import type { DocsSearchRecord } from '@docs-kit/core';

import {
	createExcerpt,
	matchesSearchFilter,
	searchableContent,
	tokenizeQuery,
	type DocsSearchClient,
	type DocsSearchProvider,
	type SearchClientOptions
} from './provider.js';

export interface FlexSearchProviderOptions {
	/** Tokenizer passed to FlexSearch. `forward` gives prefix matching. */
	tokenize?: 'strict' | 'forward' | 'reverse' | 'full';
	/** Write the records as JSON during the build so a client can fetch them. */
	fileName?: string;
}

interface FlexIndex {
	add(id: number, content: string): void;
	search(query: string, options?: { limit?: number }): number[];
}

/**
 * Client-side search with no infrastructure.
 *
 * Records are indexed in memory on first use, which suits documentation-sized corpora and
 * keeps a fully static deployment viable.
 */
export function flexSearchProvider(
	options: FlexSearchProviderOptions = {}
): DocsSearchProvider {
	return {
		name: 'flexsearch',
		async generate(records, context) {
			const { mkdir, writeFile } = await import('node:fs/promises');
			const { dirname, join } = await import('node:path');
			const path = join(context.outDir, options.fileName ?? 'search/flexsearch.json');

			await mkdir(dirname(path), { recursive: true });
			await writeFile(path, `${JSON.stringify(records)}\n`, 'utf8');
		},
		async createClient(clientOptions: SearchClientOptions): Promise<DocsSearchClient> {
			const records = await loadRecords(clientOptions);
			const { Index } = (await import('flexsearch')) as unknown as {
				Index: new (config: Record<string, unknown>) => FlexIndex;
			};
			const index = new Index({ tokenize: options.tokenize ?? 'forward', cache: true });

			records.forEach((record, position) => {
				index.add(position, searchableContent(record));
			});

			return {
				name: 'flexsearch',
				async search(query, searchOptions = {}) {
					const terms = tokenizeQuery(query);
					if (terms.length === 0) {
						return [];
					}

					const limit = searchOptions.limit ?? 10;
					const filter = searchOptions.filter ?? clientOptions.filter;
					const matches = index.search(query, { limit: limit * 4 });

					return matches
						.map((position, rank) => ({ record: records[position], rank }))
						.filter(
							(entry): entry is { record: DocsSearchRecord; rank: number } =>
								entry.record !== undefined && matchesSearchFilter(entry.record, filter)
						)
						.map(({ record, rank }) => ({
							record,
							score: (matches.length - rank) * record.boost,
							excerpt: createExcerpt(record, terms)
						}))
						.sort((left, right) => right.score - left.score)
						.slice(0, limit);
				}
			};
		}
	};
}

/** Records come from memory, or from a generated index when one is configured. */
export async function loadRecords(
	options: SearchClientOptions
): Promise<DocsSearchRecord[]> {
	if (options.records) {
		return [...options.records];
	}
	if (options.indexUrl === undefined) {
		throw new Error('A search client needs either `records` or an `indexUrl`.');
	}

	const response = await fetch(options.indexUrl);
	if (!response.ok) {
		throw new Error(`Could not load the search index from ${options.indexUrl}.`);
	}

	return (await response.json()) as DocsSearchRecord[];
}
