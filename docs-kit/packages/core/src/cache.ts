import type { DocsSourceOrigin, DocsSourceRecord } from '@docs-kit/core/sources';

/** Current on-disk format of the source cache index. */
export const docsSourceCacheVersion = 1;

export interface DocsSourceCacheEntry {
	/** Path relative to the source's cache directory. */
	relativePath: string;
	contentHash: string;
	origin: DocsSourceOrigin;
	version?: string;
	locale?: string;
}

export type DocsSourceCacheStatus = 'fetched' | 'cached' | 'failed';

export interface DocsSourceCacheState {
	sourceId: string;
	status: DocsSourceCacheStatus;
	/** ISO timestamp of the last successful load. */
	fetchedAt?: string;
	/** Message of the last failure, retained so stale content is diagnosable. */
	error?: string;
	entries: DocsSourceCacheEntry[];
}

export interface DocsSourceCacheIndex {
	version: number;
	sources: DocsSourceCacheState[];
}

export interface DocsSourceSyncWrite {
	relativePath: string;
	content: string;
	contentHash: string;
}

/** The deterministic file operations required to bring one source's cache up to date. */
export interface DocsSourceSyncPlan {
	sourceId: string;
	status: DocsSourceCacheStatus;
	writes: DocsSourceSyncWrite[];
	deletes: string[];
	unchanged: string[];
	state: DocsSourceCacheState;
	/** Populated when a failed load fell back to previously cached content. */
	error?: string;
}

/** Returns an empty index, used when no cache exists yet or the format changed. */
export function createDocsSourceCacheIndex(): DocsSourceCacheIndex {
	return { version: docsSourceCacheVersion, sources: [] };
}

/** Reads a persisted cache index defensively, discarding unknown or corrupt formats. */
export function parseDocsSourceCacheIndex(value: unknown): DocsSourceCacheIndex {
	if (value === null || typeof value !== 'object') {
		return createDocsSourceCacheIndex();
	}

	const candidate = value as Partial<DocsSourceCacheIndex>;
	if (candidate.version !== docsSourceCacheVersion || !Array.isArray(candidate.sources)) {
		return createDocsSourceCacheIndex();
	}

	const sources = candidate.sources.filter(
		(source): source is DocsSourceCacheState =>
			source !== null &&
			typeof source === 'object' &&
			typeof (source as DocsSourceCacheState).sourceId === 'string' &&
			Array.isArray((source as DocsSourceCacheState).entries)
	);

	return { version: docsSourceCacheVersion, sources };
}

/** Returns the cached state for one source, if the index has one. */
export function findDocsSourceCacheState(
	index: DocsSourceCacheIndex,
	sourceId: string
): DocsSourceCacheState | undefined {
	return index.sources.find((source) => source.sourceId === sourceId);
}

function toEntry(record: DocsSourceRecord): DocsSourceCacheEntry {
	return {
		relativePath: record.relativePath,
		contentHash: record.contentHash,
		origin: record.origin,
		...(record.version === undefined ? {} : { version: record.version }),
		...(record.locale === undefined ? {} : { locale: record.locale })
	};
}

function byRelativePath<T extends { relativePath: string }>(entries: readonly T[]): T[] {
	return [...entries].sort((left, right) =>
		left.relativePath < right.relativePath ? -1 : left.relativePath > right.relativePath ? 1 : 0
	);
}

/**
 * Computes the writes, deletes, and untouched files for a successful source load.
 * Unchanged content is never rewritten, so generated caches stay byte-stable.
 */
export function createDocsSourceSyncPlan(
	sourceId: string,
	records: readonly DocsSourceRecord[],
	previous: DocsSourceCacheState | undefined,
	fetchedAt: string
): DocsSourceSyncPlan {
	const previousByPath = new Map(
		(previous?.entries ?? []).map((entry) => [entry.relativePath, entry])
	);
	const writes: DocsSourceSyncWrite[] = [];
	const unchanged: string[] = [];

	for (const record of byRelativePath(records)) {
		const existing = previousByPath.get(record.relativePath);
		previousByPath.delete(record.relativePath);

		if (existing && existing.contentHash === record.contentHash) {
			unchanged.push(record.relativePath);
			continue;
		}

		writes.push({
			relativePath: record.relativePath,
			content: record.content,
			contentHash: record.contentHash
		});
	}

	return {
		sourceId,
		status: 'fetched',
		writes,
		deletes: [...previousByPath.keys()].sort(),
		unchanged,
		state: {
			sourceId,
			status: 'fetched',
			fetchedAt,
			entries: byRelativePath(records.map(toEntry))
		}
	};
}

/**
 * Produces the plan for a failed load. Previously cached documents are retained so a remote
 * outage degrades to stale-but-usable content instead of an empty documentation set.
 */
export function createDocsSourceFailurePlan(
	sourceId: string,
	previous: DocsSourceCacheState | undefined,
	error: string
): DocsSourceSyncPlan {
	const entries = byRelativePath(previous?.entries ?? []);

	return {
		sourceId,
		status: entries.length > 0 ? 'cached' : 'failed',
		writes: [],
		deletes: [],
		unchanged: entries.map((entry) => entry.relativePath),
		error,
		state: {
			sourceId,
			status: entries.length > 0 ? 'cached' : 'failed',
			...(previous?.fetchedAt === undefined ? {} : { fetchedAt: previous.fetchedAt }),
			error,
			entries
		}
	};
}

/** Merges source states into a deterministic index ready to be written to disk. */
export function mergeDocsSourceCacheIndex(
	states: readonly DocsSourceCacheState[]
): DocsSourceCacheIndex {
	return {
		version: docsSourceCacheVersion,
		sources: [...states].sort((left, right) =>
			left.sourceId < right.sourceId ? -1 : left.sourceId > right.sourceId ? 1 : 0
		)
	};
}
