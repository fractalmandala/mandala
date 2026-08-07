import RocketIcon from '@lucide/svelte/icons/rocket';
import BookOpenIcon from '@lucide/svelte/icons/book-open';
import type { DocsConfig } from './types.js';

export const docsConfig: DocsConfig = {
	site: {
		title: 'Fractalwiki',
		description:
			'Projects, packages, and wiki cards from the mandala monorepo — files first, quiet chrome.',
		social: {
			github: 'https://github.com/fractalmandala/mandala'
		}
	},
	sidebar: [
		{
			label: 'Projects',
			icon: RocketIcon,
			autogenerate: { directory: 'projects' }
		},
		{
			label: 'Repo',
			icon: BookOpenIcon,
			autogenerate: { directory: 'repo' }
		},
		{
			label: 'Wiki',
			autogenerate: { directory: 'wiki' }
		}
	],
	toc: {
		minDepth: 2,
		maxDepth: 3
	},
	// Uncomment to enable version selector in the sidebar header:
	// versions: {
	// 	current: 'v1.0.0',
	// 	versions: [
	// 		{ label: 'v1.0.0 (latest)', href: '/docs' },
	// 		{ label: 'v0.x', href: 'https://v0.example.com/docs' }
	// 	]
	// },
	// i18n intentionally omitted: vault sync is single-locale → src/content/**.
	// Re-enable when locale trees and /docs/<locale> routes exist.
};
