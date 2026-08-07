import { describe, expect, it } from 'vitest';

import type { DocsManifestPage, DocsNavigationNode } from '@docs-kit/core';

import {
	createDocsArticleJsonLd,
	createDocsBreadcrumbJsonLd,
	createDocsJsonLd,
	renderDocsJsonLd
} from './jsonld.js';
import {
	createDocsRobots,
	createDocsSitemap,
	createDocsSitemapEntries
} from './sitemap.js';

function page(overrides: Partial<DocsManifestPage> & { id: string }): DocsManifestPage {
	const slug = overrides.slug ?? overrides.id.replace(/\.md$/, '');

	return {
		source: { relativePath: overrides.id, extension: '.md' },
		slug,
		slugSegments: slug === '' ? [] : slug.split('/'),
		pathname: `/docs/${slug}`.replace(/\/$/, ''),
		title: overrides.title ?? slug,
		label: overrides.title ?? slug,
		frontmatter: {},
		headings: [],
		...overrides
	};
}

const pages = [
	page({ id: 'index.md', slug: '', title: 'Introduction' }),
	page({
		id: 'guides/deploy.md',
		title: 'Deployment',
		frontmatter: { lastModified: '2026-07-01T00:00:00Z' }
	}),
	page({ id: 'internal.md', title: 'Internal', draft: true }),
	page({ id: 'old.md', title: 'Old', version: 'v1' })
];

const site = { url: 'https://acme.com' };

describe('createDocsSitemapEntries', () => {
	it('emits absolute URLs and skips drafts', () => {
		const entries = createDocsSitemapEntries(pages, site);

		expect(entries.map((entry) => entry.loc)).toEqual([
			'https://acme.com/docs',
			'https://acme.com/docs/guides/deploy',
			'https://acme.com/docs/old'
		]);
		expect(entries[1]?.lastmod).toBe('2026-07-01T00:00:00Z');
	});

	it('can restrict the sitemap to the current version', () => {
		const entries = createDocsSitemapEntries(pages, {
			...site,
			versions: 'current-version',
			currentVersion: 'v2'
		});

		expect(entries.map((entry) => entry.loc)).not.toContain('https://acme.com/docs/old');
	});

	it('emits hreflang alternates including x-default', () => {
		const localized = [
			page({ id: 'en/install.md', slug: 'install', title: 'Install', locale: 'en' }),
			page({
				id: 'de/install.md',
				slug: 'install',
				title: 'Installation',
				locale: 'de',
				pathname: '/docs/de/install'
			})
		];

		const entries = createDocsSitemapEntries(localized, { ...site, defaultLocale: 'en' });

		expect(entries[0]?.alternates).toEqual([
			{ hreflang: 'en', href: 'https://acme.com/docs/install' },
			{ hreflang: 'de', href: 'https://acme.com/docs/de/install' },
			{ hreflang: 'x-default', href: 'https://acme.com/docs/install' }
		]);
	});

	it('includes host-supplied URLs and stays deterministic', () => {
		const options = { ...site, additional: [{ loc: 'https://acme.com/' }] };

		expect(createDocsSitemap(pages, options)).toBe(createDocsSitemap(pages, options));
		expect(createDocsSitemap(pages, options)).toContain('<loc>https://acme.com/</loc>');
	});

	it('renders valid XML with escaped values', () => {
		const xml = createDocsSitemap(
			[page({ id: 'a.md', slug: 'a&b', title: 'A' })],
			{ ...site, lastmod: '2026-08-01T00:00:00Z' }
		);

		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(xml).toContain('<loc>https://acme.com/docs/a&amp;b</loc>');
		expect(xml).toContain('<lastmod>2026-08-01T00:00:00Z</lastmod>');
		expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
	});

	it('rejects a relative site url', () => {
		expect(() => createDocsSitemapEntries(pages, { url: '/docs' })).toThrow(/absolute/);
	});
});

describe('createDocsRobots', () => {
	it('advertises the sitemap by default', () => {
		expect(createDocsRobots({ url: 'https://acme.com' })).toBe(
			'User-agent: *\nAllow: /\n\nSitemap: https://acme.com/sitemap.xml\n'
		);
	});

	it('supports disallow rules and a fully private site', () => {
		expect(createDocsRobots({ url: 'https://acme.com', disallow: ['/preview'] })).toContain(
			'Disallow: /preview'
		);
		expect(createDocsRobots({ private: true })).toBe('User-agent: *\nDisallow: /\n');
		expect(createDocsRobots({ url: 'https://acme.com', sitemap: false })).not.toContain('Sitemap');
	});
});

describe('JSON-LD', () => {
	const navigation: DocsNavigationNode[] = [
		{
			type: 'section',
			id: 'guides',
			label: 'Guides',
			collapsible: true,
			collapsed: false,
			children: [
				{
					type: 'page',
					id: 'guides/deploy.md',
					label: 'Deployment',
					pathname: '/docs/guides/deploy'
				}
			]
		}
	];
	const options = {
		site: { title: 'Acme', url: 'https://acme.com', repository: 'https://github.com/acme/product' },
		navigation
	};
	const deploy = pages[1] as DocsManifestPage;

	it('describes a page as a TechArticle inside the site', () => {
		expect(createDocsArticleJsonLd(deploy, options)).toMatchObject({
			'@type': 'TechArticle',
			headline: 'Deployment',
			url: 'https://acme.com/docs/guides/deploy',
			inLanguage: 'en',
			isPartOf: { '@type': 'WebSite', name: 'Acme' },
			codeRepository: 'https://github.com/acme/product'
		});
	});

	it('builds a breadcrumb trail from navigation', () => {
		const breadcrumb = createDocsBreadcrumbJsonLd(deploy, options) as {
			itemListElement: Array<{ name: string; position: number; item?: string }>;
		};

		expect(breadcrumb.itemListElement.map((entry) => entry.name)).toEqual([
			'Acme',
			'Guides',
			'Deployment'
		]);
		expect(breadcrumb.itemListElement[2]?.item).toBe('https://acme.com/docs/guides/deploy');
	});

	it('omits a breadcrumb with no trail', () => {
		expect(createDocsBreadcrumbJsonLd(pages[0] as DocsManifestPage, { site: options.site })).toBeUndefined();
		expect(createDocsJsonLd(pages[0] as DocsManifestPage, { site: options.site })).toHaveLength(1);
	});

	it('escapes angle brackets so the script block cannot be closed early', () => {
		const rendered = renderDocsJsonLd(
			createDocsJsonLd(page({ id: 'x.md', title: '</script><script>alert(1)' }), {
				site: options.site
			})
		);

		expect(rendered).not.toContain('</script>');
		expect(rendered).toContain('\\u003c/script');
	});
});
