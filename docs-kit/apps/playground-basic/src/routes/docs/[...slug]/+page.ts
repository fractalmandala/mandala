import { createDocsEntries, createDocsLoader } from '@docs-kit/sveltekit';
import { manifest, pageImporters } from 'virtual:docs-kit/manifest';

export const prerender = true;

export const entries = createDocsEntries({ manifest, collection: 'default' });

export const load = createDocsLoader({
	manifest,
	pageImporters,
	collection: 'default',
	site: {
		title: 'Acme Documentation',
		description: 'The docs-kit playground documentation.',
		url: 'https://example.com'
	}
});
