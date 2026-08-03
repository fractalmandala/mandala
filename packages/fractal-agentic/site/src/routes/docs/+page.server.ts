import { listDocsInSequence, toSummaries } from '$lib/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		// Reading order matches DOCS_SEQUENCE (and prev/next on detail pages)
		items: toSummaries(listDocsInSequence())
	};
};
