import type { DocsSearchRecord } from '@docs-kit/core';

import { loadRecords } from './flexsearch.js';
import {
	createExcerpt,
	matchesSearchFilter,
	tokenizeQuery,
	type DocsSearchClient,
	type DocsSearchProvider,
	type SearchClientOptions
} from './provider.js';

export interface OramaProviderOptions {
	/** Typo tolerance passed to Orama. Defaults to 1. */
	tolerance?: number;
	fileName?: string;
}

/**
 * Typed local search with stemming and typo tolerance.
 *
 * Orama indexes fields separately, so a heading match outranks a body match without the
 * provider having to score results itself.
 */
export function oramaProvider(options: OramaProviderOptions = {}): DocsSearchProvider {
	return {
		name: 'orama',
		async generate(records, context) {
			const { mkdir, writeFile } = await import('node:fs/promises');
			const { dirname, join } = await import('node:path');
			const path = join(context.outDir, options.fileName ?? 'search/orama.json');

			await mkdir(dirname(path), { recursive: true });
			await writeFile(path, `${JSON.stringify(records)}\n`, 'utf8');
		},
		async createClient(clientOptions: SearchClientOptions): Promise<DocsSearchClient> {
			const records = await loadRecords(clientOptions);
			const orama = await import('@orama/orama');
			const database = orama.create({
				schema: {
					id: 'string',
					title: 'string',
					section: 'string',
					description: 'string',
					body: 'string'
				} as const
			});
			const byId = new Map(records.map((record) => [record.id, record]));

			for (const record of records) {
				orama.insert(database, {
					id: record.id,
					title: record.title,
					section: record.section ?? '',
					description: record.description ?? '',
					body: record.body
				});
			}

			return {
				name: 'orama',
				async search(query, searchOptions = {}) {
					const terms = tokenizeQuery(query);
					if (terms.length === 0) {
						return [];
					}

					const limit = searchOptions.limit ?? 10;
					const filter = searchOptions.filter ?? clientOptions.filter;
					const found = await orama.search(database, {
						term: query,
						limit: limit * 4,
						tolerance: options.tolerance ?? 1,
						boost: { title: 3, section: 2, description: 1.5 }
					});

					return found.hits
						.map((hit) => ({ record: byId.get(String(hit.document['id'])), score: hit.score }))
						.filter(
							(entry): entry is { record: DocsSearchRecord; score: number } =>
								entry.record !== undefined && matchesSearchFilter(entry.record, filter)
						)
						.map(({ record, score }) => ({
							record,
							score: score * record.boost,
							excerpt: createExcerpt(record, terms)
						}))
						.sort((left, right) => right.score - left.score)
						.slice(0, limit);
				}
			};
		}
	};
}
