import type { DocsSearchRecord } from '@docs-kit/core';

/** Dimension filters a query may narrow by. */
export interface DocsSearchFilter {
	version?: string;
	locale?: string;
	/** Restrict to records carrying every listed tag. */
	tags?: readonly string[];
}

export interface DocsSearchOptions {
	limit?: number;
	filter?: DocsSearchFilter;
}

export interface DocsSearchResult {
	record: DocsSearchRecord;
	/** Provider-specific relevance, normalized so higher is better. */
	score: number;
	/** Short excerpt around the match, suitable for display. */
	excerpt: string;
}

/** The client every provider returns; the search UI knows only this. */
export interface DocsSearchClient {
	name: string;
	search(query: string, options?: DocsSearchOptions): Promise<DocsSearchResult[]>;
}

export interface SearchBuildContext {
	/** Directory generated indexes may be written to. */
	outDir: string;
	/** Absolute site origin, used by providers that index rendered output. */
	siteUrl?: string;
	/** Directory holding the built site, for providers that crawl HTML. */
	buildDir?: string;
}

export interface SearchClientOptions {
	/** Records to search. Providers that load a prebuilt index may ignore these. */
	records?: readonly DocsSearchRecord[];
	/** URL an already-generated index is fetched from. */
	indexUrl?: string;
	filter?: DocsSearchFilter;
}

/** A search backend. Both hooks are optional so build-only or client-only providers fit. */
export interface DocsSearchProvider {
	name: string;
	/** Build step, run after the site is generated. */
	generate?(records: readonly DocsSearchRecord[], context: SearchBuildContext): Promise<void>;
	/** Runtime factory used by the search UI. */
	createClient?(options: SearchClientOptions): DocsSearchClient | Promise<DocsSearchClient>;
}

const stopWords = new Set(['a', 'an', 'and', 'for', 'of', 'the', 'to']);

/** Splits a query into the terms every provider's fallbacks and excerpts use. */
export function tokenizeQuery(query: string): string[] {
	return query
		.toLowerCase()
		.split(/[^\p{Letter}\p{Number}]+/u)
		.filter((token) => token.length > 1 && !stopWords.has(token));
}

/** Applies dimension and tag filters uniformly across providers. */
export function matchesSearchFilter(
	record: DocsSearchRecord,
	filter: DocsSearchFilter | undefined
): boolean {
	if (!filter) {
		return true;
	}
	if (filter.version !== undefined && record.version !== filter.version) {
		return false;
	}
	if (filter.locale !== undefined && record.locale !== filter.locale) {
		return false;
	}
	if (filter.tags && filter.tags.length > 0) {
		return filter.tags.every((tag) => record.tags.includes(tag));
	}

	return true;
}

/** Builds a display excerpt centred on the first matching term. */
export function createExcerpt(
	record: DocsSearchRecord,
	terms: readonly string[],
	length = 180
): string {
	const text = record.body === '' ? (record.description ?? '') : record.body;
	if (text === '') {
		return '';
	}

	const lower = text.toLowerCase();
	const position = terms
		.map((term) => lower.indexOf(term))
		.filter((index) => index >= 0)
		.sort((left, right) => left - right)[0];
	const start = position === undefined ? 0 : Math.max(0, position - 50);
	const excerpt = text.slice(start, start + length).trim();

	return `${start > 0 ? '…' : ''}${excerpt}${start + length < text.length ? '…' : ''}`;
}

/** Merges the searchable fields into the single string simple indexes need. */
export function searchableContent(record: DocsSearchRecord): string {
	return [record.headingPath.join(' '), record.description ?? '', record.body, record.tags.join(' ')]
		.filter(Boolean)
		.join('\n');
}
