import {
	createDocsContentSource,
	defineDocsConfig,
	type DocsMetadata
} from '@acrolls/docs/content';
import type { Component } from 'svelte';

type DocsArticle = Component;

const contentRoot = '/docs/';

const modules = import.meta.glob('/docs/**/*.md', {
	import: 'default'
}) as Record<string, () => Promise<DocsArticle>>;

const metadata = import.meta.glob('/docs/**/*.md', {
	eager: true,
	import: 'metadata'
}) as Record<string, DocsMetadata>;

export const docs = createDocsContentSource({
	config: defineDocsConfig({
		title: 'Fractal Mandala Documentation',
		baseHref: '/docs',
		subtitle: 'Research guides, technical notes, and collection maps',
		storageKey: 'fractalmandala-docs'
	}),
	documents: Object.entries(modules).map(([key, load]) => ({
		key: key.slice(contentRoot.length),
		metadata: metadata[key],
		load
	}))
});

export const docsNav = docs.nav;
