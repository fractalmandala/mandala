import type { Component } from 'svelte';
import {
	createDocsContentSource,
	defineDocsConfig,
	type DocsMetadata
} from '@acrolls/docs/content';

type DocsArticle = Component;
const contentPrefix = '../../docs/';

const modules = import.meta.glob('../../docs/**/*.md', {
	import: 'default'
}) as Record<string, () => Promise<DocsArticle>>;

const metadata = import.meta.glob('../../docs/**/*.md', {
	eager: true,
	import: 'metadata'
}) as Record<string, DocsMetadata>;

export const docs = createDocsContentSource({
	documents: Object.entries(modules).map(([key, load]) => ({
		key: key.slice(contentPrefix.length),
		metadata: metadata[key],
		load
	})),
	config: defineDocsConfig({
		title: 'Documentation',
		baseHref: '/docs',
		subtitle: 'Generated from Markdown'
	})
});
