export {
	createExcerpt,
	matchesSearchFilter,
	searchableContent,
	tokenizeQuery,
	type DocsSearchClient,
	type DocsSearchFilter,
	type DocsSearchOptions,
	type DocsSearchProvider,
	type DocsSearchResult,
	type SearchBuildContext,
	type SearchClientOptions
} from './provider.js';
export {
	flexSearchProvider,
	loadRecords,
	type FlexSearchProviderOptions
} from './flexsearch.js';
export { oramaProvider, type OramaProviderOptions } from './orama.js';
export {
	pagefindProvider,
	type PagefindBundle,
	type PagefindProviderOptions,
	type PagefindResultData
} from './pagefind.js';
export {
	groupSearchResults,
	highlightMatches,
	type DocsHighlightSegment,
	type DocsSearchGroup
} from './highlight.js';
export {
	createRecentSearches,
	recentSearchesKey,
	type DocsRecentSearchStore
} from './recent.js';
export {
	createDocsSearch,
	docsSearchProviders,
	type CreateDocsSearchOptions,
	type DocsSearchProviderName
} from './registry.js';
