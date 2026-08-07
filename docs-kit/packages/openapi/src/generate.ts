import { mkdir, readFile, readdir, rename, rm, rmdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

import { parseAsyncApi, detectApiKind } from './asyncapi.js';
import { generateApiPages, type DocsApiPage, type GenerateApiPagesOptions } from './pages.js';
import { parseOpenApi } from './parse.js';
import type { DocsApiDiagnostic, DocsApiDocument } from './model.js';

export interface DocsApiSourceConfig extends GenerateApiPagesOptions {
	/** Stable id, used for the generated directory and diagnostics. */
	id: string;
	/** Specification file, relative to the project root, or an absolute HTTPS URL. */
	source: string;
	/** Specification kind. Detected from the document when omitted. */
	kind?: 'openapi' | 'asyncapi';
}

export interface GenerateApiDocsOptions {
	sources: readonly DocsApiSourceConfig[];
	/** Directory generated Markdown is written to. */
	outDir: string;
	cwd?: string;
	/** Injected fetch, used for remote specifications and by tests. */
	fetch?: (url: string) => Promise<Response>;
}

export interface GenerateApiDocsResult {
	/** Directory to mount as an additional content root. */
	outDir: string;
	written: string[];
	unchanged: string[];
	removed: string[];
	diagnostics: Array<DocsApiDiagnostic & { sourceId: string }>;
	documents: Array<{ sourceId: string; document: DocsApiDocument; pages: DocsApiPage[] }>;
}

async function readSource(
	config: DocsApiSourceConfig,
	cwd: string,
	fetchImpl: GenerateApiDocsOptions['fetch']
): Promise<{ text?: string; error?: string }> {
	if (/^https?:\/\//i.test(config.source)) {
		if (!config.source.toLowerCase().startsWith('https://')) {
			return { error: 'Remote specifications must be served over HTTPS.' };
		}

		try {
			const response = await (fetchImpl ?? fetch)(config.source);
			if (!response.ok) {
				return { error: `Request failed with HTTP ${response.status}.` };
			}
			return { text: await response.text() };
		} catch (error) {
			return { error: error instanceof Error ? error.message : String(error) };
		}
	}

	try {
		return { text: await readFile(resolve(cwd, config.source), 'utf8') };
	} catch (error) {
		return { error: error instanceof Error ? error.message : String(error) };
	}
}

async function writeFileAtomic(path: string, content: string): Promise<void> {
	await mkdir(dirname(path), { recursive: true });
	const temporaryPath = `${path}.tmp`;
	await writeFile(temporaryPath, content, 'utf8');
	await rename(temporaryPath, path);
}

async function listMarkdown(root: string): Promise<string[]> {
	try {
		const entries = await readdir(root, { recursive: true, withFileTypes: true });
		return entries
			.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
			.map((entry) => relative(root, join(entry.parentPath ?? root, entry.name)).replace(/\\/g, '/'))
			.sort();
	} catch {
		return [];
	}
}

async function pruneEmptyDirectories(root: string, directory: string): Promise<void> {
	let current = directory;

	while (current.startsWith(root) && current !== root) {
		try {
			if ((await readdir(current)).length > 0) {
				return;
			}
			await rmdir(current);
		} catch {
			return;
		}
		current = dirname(current);
	}
}

/**
 * Generates Markdown pages for every configured API specification.
 *
 * Pages are written to disk rather than kept in memory so the ordinary compiler treats them
 * exactly like hand-written documentation. Unchanged files are not rewritten, and pages for
 * operations that disappeared are deleted.
 */
export async function generateApiDocs(
	options: GenerateApiDocsOptions
): Promise<GenerateApiDocsResult> {
	const cwd = options.cwd ?? process.cwd();
	const outDir = resolve(cwd, options.outDir);
	const existing = new Set(await listMarkdown(outDir));
	const written: string[] = [];
	const unchanged: string[] = [];
	const diagnostics: Array<DocsApiDiagnostic & { sourceId: string }> = [];
	const documents: GenerateApiDocsResult['documents'] = [];

	for (const config of options.sources) {
		const { text, error } = await readSource(config, cwd, options.fetch);

		if (text === undefined) {
			diagnostics.push({
				sourceId: config.id,
				severity: 'error',
				code: 'INVALID_DOCUMENT',
				message: `Could not read "${config.source}": ${error ?? 'unknown error'}`
			});
			continue;
		}

		const kind = config.kind ?? (await detectApiKind(text)) ?? 'openapi';
		const parsed = kind === 'asyncapi' ? await parseAsyncApi(text) : await parseOpenApi(text);
		diagnostics.push(
			...parsed.diagnostics.map((diagnostic) => ({ ...diagnostic, sourceId: config.id }))
		);

		if (!parsed.document) {
			continue;
		}

		const pages = generateApiPages(parsed.document, {
			...config,
			directory: config.directory ?? config.id
		});
		documents.push({ sourceId: config.id, document: parsed.document, pages });

		for (const page of pages) {
			const path = join(outDir, page.relativePath);
			existing.delete(page.relativePath);

			let previous: string | undefined;
			try {
				previous = await readFile(path, 'utf8');
			} catch {
				previous = undefined;
			}

			if (previous === page.content) {
				unchanged.push(page.relativePath);
				continue;
			}

			await writeFileAtomic(path, page.content);
			written.push(page.relativePath);
		}
	}

	const removed: string[] = [];
	for (const stale of existing) {
		const path = join(outDir, stale);
		await rm(path, { force: true });
		await pruneEmptyDirectories(outDir, dirname(path));
		removed.push(stale);
	}

	return {
		outDir,
		written: written.sort(),
		unchanged: unchanged.sort(),
		removed: removed.sort(),
		diagnostics,
		documents
	};
}
