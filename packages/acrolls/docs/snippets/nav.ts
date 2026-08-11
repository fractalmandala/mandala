import type { DocsNav } from '@acrolls/docs';

/**
 * Copy into your app as src/lib/docs/nav.ts and edit.
 */
export const docsNav: DocsNav = {
	title: 'Documentation',
	baseHref: '/docs',
	subtitle: 'Guides and reference',
	storageKey: 'myapp-docs',
	sections: [
		{
			id: 'start',
			title: 'Start here',
			defaultOpen: true,
			items: [
				{
					title: 'Introduction',
					href: '/docs/intro',
					slug: 'intro',
					description: 'What this is and who it is for'
				},
				{
					title: 'Installation',
					href: '/docs/install',
					slug: 'install',
					description: 'Add Acrolls to a SvelteKit app'
				}
			]
		},
		{
			id: 'guides',
			title: 'Guides',
			items: [
				{
					id: 'advanced',
					title: 'Advanced',
					defaultOpen: false,
					children: [
						{
							title: 'Performance',
							href: '/docs/performance',
							slug: 'performance'
						},
						{
							title: 'Security',
							href: '/docs/security',
							slug: 'security'
						}
					]
				}
			]
		}
	]
};
