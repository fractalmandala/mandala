import type { DocsSearchRecord } from '@docs-kit/core';

import {
	createExcerpt,
	matchesSearchFilter,
	tokenizeQuery,
	type DocsSearchClient,
	type DocsSearchProvider,
	type SearchBuildContext,
	type SearchClientOptions
} from './provider.js';

/** The subset of Pagefind's runtime API this adapter uses. */
export interface PagefindBundle {
	options?(options: Record<string, unknown>): Promise<void>;
	search(query: string): Promise<{
		results: Array<{ id: string; data(): Promise<PagefindResultData> }>;
	}>;
}

export interface PagefindResultData {
	url: string;
	meta?: Record<string, string>;
	excerpt?: string;
	/** Arbitrary filter values Pagefind indexed from the page. */
	filters?: Record<string, string[]>;
}

export interface PagefindProviderOptions {
	/** URL the Pagefind bundle is served from. Defaults to `/pagefind/pagefind.js`. */
	bundlePath?: string;
	/** Loads the bundle. Injected in tests; defaults to a dynamic import. */
	loadBundle?: (bundlePath: string) => Promise<PagefindBundle>;
	/** Runs the Pagefind indexer. Injected in tests; defaults to the `pagefind` CLI. */
	runIndexer?: (context: SearchBuildContext) => Promise<void>;
	/** Records used to enrich results with section and dimension data. */
	records?: readonly DocsSearchRecord[];
}

async function runPagefindCli(context: SearchBuildContext): Promise<void> {
	if (context.buildDir === undefined) {
		throw new Error(
			'The Pagefind provider indexes rendered output, so `buildDir` must point at the built site.'
		);
	}

	const { spawn } = await import('node:child_process');

	await new Promise<void>((resolve, reject) => {
		const child = spawn('npx', ['-y', 'pagefind', '--site', context.buildDir as string], {
			stdio: 'inherit'
		});

		child.on('error', (error) => {
			reject(
				new Error(
					`Could not run Pagefind: ${error.message}. Install it with \`pnpm add -D pagefind\`.`
				)
			);
		});
		child.on('exit', (code) =>
			code === 0 ? resolve() : reject(new Error(`Pagefind exited with code ${code ?? 'null'}.`))
		);
	});
}

/**
 * Search over the rendered site.
 *
 * Pagefind indexes built HTML rather than source records, so it needs no runtime server and
 * its index reflects exactly what a reader sees. Results are matched back to the records so
 * headings and dimension filters behave the same as the other providers.
 */
export function pagefindProvider(options: PagefindProviderOptions = {}): DocsSearchProvider {
	const bundlePath = options.bundlePath ?? '/pagefind/pagefind.js';

	return {
		name: 'pagefind',
		async generate(_records, context) {
			await (options.runIndexer ?? runPagefindCli)(context);
		},
		async createClient(clientOptions: SearchClientOptions): Promise<DocsSearchClient> {
			const load =
				options.loadBundle ??
				((path: string) => import(/* @vite-ignore */ path) as Promise<PagefindBundle>);
			const bundle = await load(clientOptions.indexUrl ?? bundlePath);
			const records = options.records ?? clientOptions.records ?? [];
			const byPathname = new Map(records.map((record) => [record.pathname, record]));

			return {
				name: 'pagefind',
				async search(query, searchOptions = {}) {
					const terms = tokenizeQuery(query);
					if (terms.length === 0) {
						return [];
					}

					const limit = searchOptions.limit ?? 10;
					const filter = searchOptions.filter ?? clientOptions.filter;
					const found = await bundle.search(query);
					const results = [];

					for (const [rank, result] of found.results.slice(0, limit * 4).entries()) {
						const data = await result.data();
						const record =
							byPathname.get(data.url) ??
							byPathname.get(data.url.replace(/\.html$/, '').replace(/\/index$/, '')) ??
							recordFromPagefind(data, result.id);

						if (!matchesSearchFilter(record, filter)) {
							continue;
						}

						results.push({
							record,
							score: (found.results.length - rank) * record.boost,
							excerpt: data.excerpt ?? createExcerpt(record, terms)
						});
					}

					return results.sort((left, right) => right.score - left.score).slice(0, limit);
				}
			};
		}
	};
}

/** Builds a record for a page Pagefind found that the manifest did not produce. */
function recordFromPagefind(data: PagefindResultData, id: string): DocsSearchRecord {
	return {
		id,
		pageId: id,
		pathname: data.url,
		title: data.meta?.['title'] ?? data.url,
		headingPath: [data.meta?.['title'] ?? data.url],
		body: data.excerpt ?? '',
		boost: 1,
		tags: []
	};
}
