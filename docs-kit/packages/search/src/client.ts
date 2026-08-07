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

interface FlexIndex {
	add(id: number, content: string): void;
	search(query: string, options?: { limit?: number }): number[];
}

/** Browser-only FlexSearch client. It has no build-generation or Node runtime imports. */
export async function createFlexSearchClient(
	options: SearchClientOptions
): Promise<DocsSearchClient> {
	const records = await loadSearchRecords(options);
	const { Index } = (await import('flexsearch')) as unknown as {
		Index: new (config: Record<string, unknown>) => FlexIndex;
	};
	const index = new Index({ tokenize: 'forward', cache: true });
	records.forEach((record, position) => index.add(position, searchableContent(record)));

	return {
		name: 'flexsearch',
		async search(query, searchOptions = {}) {
			const terms = tokenizeQuery(query);
			if (terms.length === 0) {
				return [];
			}
			const limit = searchOptions.limit ?? 10;
			const filter = searchOptions.filter ?? options.filter;
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

/** Loads client search records from memory or a fetchable generated JSON file. */
export async function loadSearchRecords(options: SearchClientOptions): Promise<DocsSearchRecord[]> {
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

export {
	createExcerpt,
	matchesSearchFilter,
	searchableContent,
	tokenizeQuery,
	type DocsSearchClient,
	type DocsSearchFilter,
	type DocsSearchOptions,
	type DocsSearchResult,
	type SearchClientOptions
} from './provider.js';
