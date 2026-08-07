import { mkdir, readFile, readdir, rename, rm, rmdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import {
	createDocsSourceFailurePlan,
	createDocsSourceSyncPlan,
	mergeDocsSourceCacheIndex,
	normalizeDocsSourceDocument,
	parseDocsSourceCacheIndex,
	resolveDocsSourceConflicts,
	toDiscoveredContent,
	type DiscoveredContent,
	type DocsContentSource,
	type DocsSourceCacheEntry,
	type DocsSourceCacheIndex,
	type DocsSourceCacheStatus,
	type DocsSourceConflictPolicy,
	type DocsSourceDiagnostic,
	type DocsSourceRecord,
	type DocsSourceSyncPlan
} from '@docs-kit/core';

export interface SyncDocsSourcesOptions {
	sources: readonly DocsContentSource[];
	/** Cache directory, absolute or relative to `cwd`. */
	cacheDir: string;
	/** Project root. Defaults to `process.cwd()`. */
	cwd?: string;
	onConflict?: DocsSourceConflictPolicy;
	/** Injected clock so reports and tests stay deterministic. */
	now?: () => string;
	signal?: AbortSignal;
	/** Skip network work and reuse cached content. Defaults to false. */
	offline?: boolean;
}

export interface DocsSourceSyncSummary {
	sourceId: string;
	status: DocsSourceCacheStatus;
	written: string[];
	deleted: string[];
	unchanged: string[];
	error?: string;
}

export interface DocsSourceSyncReport {
	/** `ok` when every source loaded, `degraded` when cached content was reused. */
	status: 'ok' | 'degraded' | 'failed';
	cacheDir: string;
	sources: DocsSourceSyncSummary[];
	records: DocsSourceRecord[];
	content: DiscoveredContent[];
	diagnostics: DocsSourceDiagnostic[];
}

const indexFileName = 'index.json';

async function readCacheIndex(cacheDir: string): Promise<DocsSourceCacheIndex> {
	try {
		return parseDocsSourceCacheIndex(JSON.parse(await readFile(join(cacheDir, indexFileName), 'utf8')));
	} catch {
		return parseDocsSourceCacheIndex(undefined);
	}
}

async function writeFileAtomic(path: string, content: string): Promise<void> {
	await mkdir(dirname(path), { recursive: true });
	const temporaryPath = `${path}.tmp`;
	await writeFile(temporaryPath, content, 'utf8');
	await rename(temporaryPath, path);
}

async function pruneEmptyDirectories(root: string, directory: string): Promise<void> {
	let current = directory;

	while (current.startsWith(root) && current !== root) {
		try {
			const entries = await readdir(current);
			if (entries.length > 0) {
				return;
			}
			await rmdir(current);
		} catch {
			return;
		}
		current = dirname(current);
	}
}

async function applyPlan(sourceRoot: string, plan: DocsSourceSyncPlan): Promise<void> {
	for (const write of plan.writes) {
		await writeFileAtomic(join(sourceRoot, write.relativePath), write.content);
	}
	for (const relativePath of plan.deletes) {
		const path = join(sourceRoot, relativePath);
		await rm(path, { force: true });
		await pruneEmptyDirectories(sourceRoot, dirname(path));
	}
}

async function readCachedRecords(
	source: DocsContentSource,
	sourceRoot: string,
	entries: readonly DocsSourceCacheEntry[]
): Promise<DocsSourceRecord[]> {
	const records: DocsSourceRecord[] = [];

	for (const entry of entries) {
		try {
			const content = await readFile(join(sourceRoot, entry.relativePath), 'utf8');
			records.push(
				normalizeDocsSourceDocument(source, {
					relativePath: entry.relativePath,
					content,
					...(entry.version === undefined ? {} : { version: entry.version }),
					...(entry.locale === undefined ? {} : { locale: entry.locale }),
					origin: entry.origin
				})
			);
		} catch {
			// A cache file that disappeared is simply not offered to the compiler.
		}
	}

	return records;
}

interface LoadedSource {
	source: DocsContentSource;
	records: DocsSourceRecord[];
	failure?: string;
}

/**
 * Loads every configured source, materializes its documents into the cache, and returns
 * content ready for the compiler.
 *
 * Conflicts are resolved before anything is written, so each cache directory holds exactly
 * the documents the compiler will see. Failures never discard previously cached documents:
 * the affected source is reported as `cached` and the build degrades instead of losing pages.
 */
export async function syncDocsSources(
	options: SyncDocsSourcesOptions
): Promise<DocsSourceSyncReport> {
	const cwd = options.cwd ?? process.cwd();
	const cacheDir = resolve(cwd, options.cacheDir);
	const now = options.now ?? (() => new Date().toISOString());
	const previousIndex = await readCacheIndex(cacheDir);
	const loaded: LoadedSource[] = [];

	for (const source of options.sources) {
		const previous = previousIndex.sources.find((state) => state.sourceId === source.id);
		const failure = options.offline ? 'Offline: reused cached documents.' : undefined;

		if (failure === undefined) {
			try {
				const documents = await source.load({
					cwd,
					...(options.signal === undefined ? {} : { signal: options.signal })
				});
				loaded.push({
					source,
					records: documents.map((document) => normalizeDocsSourceDocument(source, document))
				});
				continue;
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				loaded.push({
					source,
					failure: message,
					records: await readCachedRecords(source, join(cacheDir, source.id), previous?.entries ?? [])
				});
				continue;
			}
		}

		loaded.push({
			source,
			failure,
			records: await readCachedRecords(source, join(cacheDir, source.id), previous?.entries ?? [])
		});
	}

	const resolution = resolveDocsSourceConflicts(
		loaded.flatMap((entry) => entry.records),
		{ ...(options.onConflict === undefined ? {} : { onConflict: options.onConflict }) }
	);
	const bySource = new Map<string, DocsSourceRecord[]>();
	for (const record of resolution.records) {
		const group = bySource.get(record.sourceId);
		if (group) {
			group.push(record);
		} else {
			bySource.set(record.sourceId, [record]);
		}
	}

	const summaries: DocsSourceSyncSummary[] = [];
	const states = [];

	for (const entry of loaded) {
		const sourceId = entry.source.id;
		const previous = previousIndex.sources.find((state) => state.sourceId === sourceId);
		let plan: DocsSourceSyncPlan;

		if (entry.failure === undefined) {
			plan = createDocsSourceSyncPlan(sourceId, bySource.get(sourceId) ?? [], previous, now());
			await applyPlan(join(cacheDir, sourceId), plan);
		} else {
			plan = createDocsSourceFailurePlan(sourceId, previous, entry.failure);
		}

		states.push(plan.state);
		summaries.push({
			sourceId,
			status: plan.status,
			written: plan.writes.map((write) => write.relativePath),
			deleted: plan.deletes,
			unchanged: plan.unchanged,
			...(plan.error === undefined ? {} : { error: plan.error })
		});
	}

	const index = mergeDocsSourceCacheIndex(states);
	await writeFileAtomic(join(cacheDir, indexFileName), `${JSON.stringify(index, null, '\t')}\n`);

	const status = summaries.some((summary) => summary.status === 'failed')
		? 'failed'
		: summaries.some((summary) => summary.status === 'cached')
			? 'degraded'
			: 'ok';

	return {
		status,
		cacheDir,
		sources: summaries,
		records: resolution.records,
		content: toDiscoveredContent(resolution.records, (record) =>
			join(cacheDir, record.sourceId, record.relativePath)
		),
		diagnostics: resolution.diagnostics
	};
}
