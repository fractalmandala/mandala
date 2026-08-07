import { describe, expect, it } from 'vitest';

import { createDocsManifest, getDocsNavigation } from './manifest.js';
import {
	buildDocsNavigation,
	createDocsPagination,
	flattenDocsNavigation,
	getDocsNavigationKey,
	type DocsNavigablePage
} from './navigation.js';
import { createDocsPageMeta, titleFromSlug } from './page.js';

import type { DiscoveredContent } from './content.js';

function page(
	slug: string,
	overrides: Partial<DocsNavigablePage> = {}
): DocsNavigablePage {
	const slugSegments = slug === '' ? [] : slug.split('/');

	return {
		id: `${slug || 'index'}.md`,
		slug,
		slugSegments,
		pathname: `/docs/${slug}`.replace(/\/$/, ''),
		title: titleFromSlug(slug),
		label: titleFromSlug(slug),
		...overrides
	};
}

describe('createDocsPageMeta', () => {
	it('prefers frontmatter, then the first heading, then the slug', () => {
		expect(
			createDocsPageMeta('---\ntitle: Install\nlabel: Set up\norder: 2\n---\n\n# Ignored', {
				slug: 'guides/install'
			})
		).toMatchObject({ title: 'Install', label: 'Set up', order: 2, hidden: false, draft: false });

		expect(createDocsPageMeta('# From heading', { slug: 'a' })).toMatchObject({
			title: 'From heading',
			label: 'From heading'
		});
		expect(createDocsPageMeta('Just text.', { slug: 'guides/getting-started' })).toMatchObject({
			title: 'Getting started'
		});
	});

	it('reads visibility flags and keeps unknown frontmatter', () => {
		const meta = createDocsPageMeta(
			'---\ntitle: Secret\ndraft: true\nauthors: [ada]\n---\n\n## Section',
			{ slug: 'secret' }
		);

		expect(meta.draft).toBe(true);
		expect(meta.frontmatter['authors']).toEqual(['ada']);
		expect(meta.headings).toEqual([{ id: 'section', text: 'Section', depth: 2, line: 2 }]);
	});
});

describe('buildDocsNavigation', () => {
	const pages = [
		page(''),
		page('getting-started', { order: 1 }),
		page('guides/deployment'),
		page('guides/installation'),
		page('internal', { hidden: true })
	];

	it('builds a tree from the file layout with the index first', () => {
		const nodes = buildDocsNavigation(pages);

		expect(nodes.map((node) => [node.type, node.label])).toEqual([
			['page', 'Introduction'],
			['page', 'Getting started'],
			['section', 'Guides']
		]);
		expect(
			(nodes[2] as { children: Array<{ label: string }> }).children.map((child) => child.label)
		).toEqual(['Deployment', 'Installation']);
	});

	it('honours folder metadata order, labels, and collapse state', () => {
		const nodes = buildDocsNavigation(pages, {
			sections: [
				{
					directory: 'guides',
					meta: {
						label: 'How-to guides',
						icon: 'book',
						order: ['installation', 'deployment'],
						collapsed: true
					}
				}
			]
		});
		const guides = nodes.find((node) => node.type === 'section');

		expect(guides).toMatchObject({ label: 'How-to guides', icon: 'book', collapsed: true });
		expect(
			(guides as { children: Array<{ label: string }> }).children.map((child) => child.label)
		).toEqual(['Installation', 'Deployment']);
	});

	it('omits hidden pages unless asked for them', () => {
		expect(buildDocsNavigation(pages).some((node) => node.label === 'Internal')).toBe(false);
		expect(
			buildDocsNavigation(pages, { includeHidden: true }).some((node) => node.label === 'Internal')
		).toBe(true);
	});

	it('appends configured links and marks external ones', () => {
		const nodes = buildDocsNavigation(pages, {
			links: [{ id: 'github', label: 'GitHub', href: 'https://github.com/acme/product' }]
		});

		expect(nodes.at(-1)).toMatchObject({ type: 'link', external: true, label: 'GitHub' });
	});

	it('resolves explicit navigation and rejects unknown references', () => {
		const nodes = buildDocsNavigation(pages, {
			navigation: [
				{ type: 'page', id: 'getting-started', label: 'Start here' },
				{
					type: 'section',
					label: 'Guides',
					children: [{ type: 'page', id: 'guides/installation' }]
				},
				{ type: 'link', label: 'GitHub', href: 'https://github.com/acme/product' }
			]
		});

		expect(nodes.map((node) => node.label)).toEqual(['Start here', 'Guides', 'GitHub']);
		expect(() =>
			buildDocsNavigation(pages, { navigation: [{ type: 'page', id: 'nope' }] })
		).toThrow(/unknown page "nope"/);
	});
});

describe('createDocsPagination', () => {
	it('links pages in visible reading order', () => {
		const nodes = buildDocsNavigation([
			page(''),
			page('getting-started'),
			page('guides/deployment'),
			page('guides/installation')
		]);
		const pagination = createDocsPagination(nodes);

		expect(flattenDocsNavigation(nodes).map((entry) => entry.label)).toEqual([
			'Introduction',
			'Getting started',
			'Deployment',
			'Installation'
		]);
		expect(pagination.get('getting-started.md')).toEqual({
			previous: { id: 'index.md', label: 'Introduction', pathname: '/docs' },
			next: { id: 'guides/deployment.md', label: 'Deployment', pathname: '/docs/guides/deployment' }
		});
		expect(pagination.get('guides/installation.md')?.next).toBeUndefined();
	});
});

describe('manifest navigation', () => {
	function discovered(relativePath: string, raw: string, locale?: string): DiscoveredContent {
		const slug = relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '');

		return {
			sourcePath: `/content/${relativePath}`,
			relativePath,
			extension: '.md',
			slugSegments: slug === '' ? [] : slug.split('/'),
			slug,
			pathname: `/${slug}`,
			raw,
			...(locale === undefined ? {} : { locale })
		};
	}

	it('enriches pages and builds one navigation tree per dimension', () => {
		const manifest = createDocsManifest(
			[
				discovered('index.md', '---\ntitle: Home\n---\n\n# Home', 'en'),
				discovered('guides/deploy.md', '---\ntitle: Deploy\norder: 1\n---\n\n# Deploy', 'en'),
				discovered('index.md', '---\ntitle: Start\n---\n\n# Start', 'de')
			],
			{
				generatedAt: 'fixed',
				locales: { defaultLocale: 'en', locales: ['en', 'de'] },
				routing: { basePath: '/docs', locales: { defaultLocale: 'en', locales: ['en', 'de'] } },
				sections: [{ directory: 'guides', meta: { label: 'Guides' }, locale: 'en' }]
			}
		);

		const english = getDocsNavigation(manifest, { locale: 'en' });
		expect(english.map((node) => node.label)).toEqual(['Home', 'Guides']);
		expect(getDocsNavigation(manifest, { locale: 'de' }).map((node) => node.label)).toEqual(['Start']);
		expect(Object.keys(manifest.navigation)).toEqual([
			getDocsNavigationKey({ locale: 'de' }),
			getDocsNavigationKey({ locale: 'en' })
		]);

		const home = manifest.pages.find((entry) => entry.id === 'en/index.md');
		expect(home).toMatchObject({ title: 'Home', label: 'Home', pathname: '/docs' });
		expect(home?.next).toMatchObject({ pathname: '/docs/guides/deploy' });
	});

	it('falls back to slug titles when sources were not read', () => {
		const manifest = createDocsManifest(
			[
				{
					sourcePath: '/content/getting-started.md',
					relativePath: 'getting-started.md',
					extension: '.md',
					slugSegments: ['getting-started'],
					slug: 'getting-started',
					pathname: '/getting-started'
				}
			],
			{ generatedAt: 'fixed' }
		);

		expect(manifest.pages[0]).toMatchObject({
			title: 'Getting started',
			label: 'Getting started',
			frontmatter: {},
			headings: []
		});
	});
});
