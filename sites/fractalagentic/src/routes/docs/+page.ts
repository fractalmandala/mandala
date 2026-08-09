import type { PageLoad } from './$types';
import { getDocEntryBySlug, getDocsEntries, renderDocEntry } from '$lib/core/content';

export const prerender = true;

/**
 * /docs lands on the guide (docs/INDEX.md) when present, otherwise the first
 * page in reading order — so renames or additions never break the route.
 */
export const load: PageLoad = async () => {
	const entry =
		getDocEntryBySlug(['introduction']) ?? getDocEntryBySlug(['']) ?? getDocsEntries()[0];

	if (!entry) {
		throw new Error('No docs found: add markdown under packages/fractal-agentic/docs/.');
	}

	return { entry, ...(await renderDocEntry(entry)) };
};
