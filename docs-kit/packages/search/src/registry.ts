import { flexSearchProvider } from './flexsearch.js';
import { oramaProvider } from './orama.js';
import { pagefindProvider } from './pagefind.js';
import type { DocsSearchClient, DocsSearchProvider, SearchClientOptions } from './provider.js';

export type DocsSearchProviderName = 'flexsearch' | 'orama' | 'pagefind';

/** Every built-in provider, keyed by the name used in configuration. */
export const docsSearchProviders: Record<DocsSearchProviderName, () => DocsSearchProvider> = {
	flexsearch: () => flexSearchProvider(),
	orama: () => oramaProvider(),
	pagefind: () => pagefindProvider()
};

export interface CreateDocsSearchOptions extends SearchClientOptions {
	/** Provider name, or a custom provider implementation. */
	provider?: DocsSearchProviderName | DocsSearchProvider;
}

/**
 * Creates a search client from configuration.
 *
 * The UI depends on this function rather than a specific provider, so swapping backends is
 * a configuration change.
 */
export async function createDocsSearch(
	options: CreateDocsSearchOptions = {}
): Promise<DocsSearchClient> {
	const requested = options.provider ?? 'flexsearch';
	const provider =
		typeof requested === 'string'
			? (docsSearchProviders[requested] ?? docsSearchProviders.flexsearch)()
			: requested;

	if (!provider.createClient) {
		throw new Error(`Search provider "${provider.name}" does not provide a client.`);
	}

	return provider.createClient(options);
}
