import { createFlexSearchClient, type DocsSearchClient } from '@docs-kit/search/client';
import { searchRecords } from 'virtual:docs-kit/search';

let client: Promise<DocsSearchClient> | undefined;

/**
 * Creates the search client on first use.
 * The provider and its index stay out of the initial bundle until a reader searches.
 */
export function openSearch(): Promise<DocsSearchClient> {
	client ??= createFlexSearchClient({ records: searchRecords });
	return client;
}
