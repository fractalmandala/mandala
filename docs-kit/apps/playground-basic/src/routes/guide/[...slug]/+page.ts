import { createDocsEntries, createDocsLoader } from '@docs-kit/sveltekit';
import { manifest, pageImporters } from 'virtual:docs-kit/manifest';

export const prerender = true;
export const entries = createDocsEntries({ manifest, collection: 'guide' });
export const load = createDocsLoader({
	manifest,
	pageImporters,
	collection: 'guide',
	site: {
		title: 'Guide Documentation',
		description: 'A second docs-kit collection mounted without replacing host routes.',
		url: 'https://example.com'
	}
});
