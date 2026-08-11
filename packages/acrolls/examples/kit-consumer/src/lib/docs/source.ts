import type { Component } from 'svelte';
import {
	createAcrollsDocsSource,
	defineDocsConfig,
	type DocsMetadata
} from '@acrolls/sveltekit';

type DocsArticle = Component;

const modules = import.meta.glob('../../content/**/*.md', {
	import: 'default'
}) as Record<string, () => Promise<DocsArticle>>;

const metadata = import.meta.glob('../../content/**/*.md', {
	eager: true,
	import: 'metadata'
}) as Record<string, DocsMetadata>;

export const docs = createAcrollsDocsSource({
	modules,
	metadata,
	contentRoot: '../../content',
	config: defineDocsConfig({
		title: 'Example docs',
		baseHref: '/docs',
		subtitle: 'Generated from Markdown',
		section: {
			title: 'Reference',
			defaultOpen: true
		},
		folders: {
			guides: {
				title: 'Guides',
				order: 1
			}
		},
		entries: {
			guides: {
				kind: 'group',
				title: 'Guides',
				landing: 'guides/index.md',
				order: 1
			},
			'guides/installation': {
				parent: 'guides',
				title: 'Install',
				href: '/docs/guides/install',
				order: 0
			},
			'guides/advanced/performance': {
				parent: 'guides',
				title: 'Performance',
				order: 2
			}
		}
	})
});
