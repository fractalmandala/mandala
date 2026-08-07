import { describe, expect, it } from 'vitest';

import {
	buildDocsLocaleSwitcherItems,
	buildDocsVersionSwitcherItems,
	createDocsManifest,
	createDocsPageMetadata,
	createDocsPath,
	diagnoseDocsTranslations,
	getDocsManifestPageKey,
	normalizeDocsLocales,
	normalizeDocsRouteTarget,
	normalizeDocsRoutingOptions,
	normalizeDocsVersions,
	parseDocsPath,
	resolveEquivalentPage
} from './index.js';

import type { DocsManifestPage } from './manifest.js';

const versions = {
	current: 'v3',
	versions: [
		{ id: 'v3', label: 'Latest' },
		{ id: 'v2', label: 'Version 2' }
	]
} as const;

const locales = {
	defaultLocale: 'en',
	locales: [
		{ id: 'en', label: 'English' },
		{ id: 'de', label: 'Deutsch' }
	]
} as const;

const routing = {
	basePath: '/docs',
	versions,
	locales
};

function page(
	id: string,
	slug: string,
	dimensions: { version?: string; locale?: string } = {},
	hashes: { contentHash?: string; translationSourceHash?: string } = {}
): DocsManifestPage {
	return {
		id,
		source: { relativePath: `${id}.md`, extension: '.md' },
		slug,
		slugSegments: slug ? slug.split('/') : [],
		pathname: `/${slug}`,
		...(dimensions.version === undefined ? {} : { version: dimensions.version }),
		...(dimensions.locale === undefined ? {} : { locale: dimensions.locale }),
		...(hashes.contentHash === undefined ? {} : { contentHash: hashes.contentHash }),
		...(hashes.translationSourceHash === undefined
			? {}
			: { translationSourceHash: hashes.translationSourceHash })
	};
}

describe('Phase 11 version and locale models', () => {
	it('normalizes labels, current/default markers, and route policies', () => {
		expect(normalizeDocsVersions(versions)).toEqual({
			current: 'v3',
			versions: [
				{ id: 'v3', label: 'Latest', current: true },
				{ id: 'v2', label: 'Version 2', current: false }
			]
		});
		expect(normalizeDocsLocales(locales)).toEqual({
			defaultLocale: 'en',
			omitDefaultLocale: true,
			locales: [
				{ id: 'en', label: 'English', default: true, dir: 'ltr' },
				{ id: 'de', label: 'Deutsch', default: false, dir: 'ltr' }
			]
		});
		expect(normalizeDocsRoutingOptions(routing)).toMatchObject({
			basePath: '/docs',
			versionPrefix: 'except-current',
			localePrefix: 'except-default',
			versions: expect.arrayContaining([expect.objectContaining({ id: 'v3', current: true })]),
			locales: expect.arrayContaining([expect.objectContaining({ id: 'en', default: true })])
		});
	});

	it('rejects duplicate and missing dimension identities', () => {
		expect(() => normalizeDocsVersions({ current: 'v1', versions: ['v1', 'v1'] })).toThrow(
			/duplicate version id/
		);
		expect(() => normalizeDocsVersions({ current: 'v3', versions: ['v2'] })).toThrow(
			/current version "v3" is not present/
		);
		expect(() => normalizeDocsLocales({ defaultLocale: 'en', locales: ['en', 'en'] })).toThrow(
			/duplicate locale id/
		);
		expect(() => normalizeDocsLocales({ defaultLocale: 'fr', locales: ['en'] })).toThrow(
			/default locale "fr" is not present/
		);
	});
});

describe('Phase 11 route generation and equivalent pages', () => {
	it('omits current/default dimensions and parses explicit dimensions in the same order', () => {
		expect(createDocsPath({ slug: 'guides/intro', version: 'v3', locale: 'en' }, routing)).toBe(
			'/docs/guides/intro'
		);
		expect(createDocsPath({ slug: 'guides/intro', version: 'v3', locale: 'de' }, routing)).toBe(
			'/docs/de/guides/intro'
		);
		expect(createDocsPath({ slug: 'guides/intro', version: 'v2', locale: 'en' }, routing)).toBe(
			'/docs/v2/guides/intro'
		);
		expect(createDocsPath({ slug: 'guides/intro', version: 'v2', locale: 'de' }, routing)).toBe(
			'/docs/v2/de/guides/intro'
		);
		expect(parseDocsPath('/docs/v2/de/guides/intro?from=switcher', routing)).toEqual({
			slug: 'guides/intro',
			version: 'v2',
			locale: 'de'
		});
		expect(parseDocsPath('/other/guides/intro', routing)).toBeUndefined();
		expect(normalizeDocsRouteTarget({ slug: './guides/intro.md' }, routing)).toEqual({
			slug: 'guides/intro',
			version: 'v3',
			locale: 'en'
		});
	});

	it('resolves exact pages, default-locale equivalents, and destination indexes', () => {
		const pages = [
			page('v3-en-index', '', { version: 'v3', locale: 'en' }),
			page('v2-en-index', '', { version: 'v2', locale: 'en' }),
			page('v2-de-index', '', { version: 'v2', locale: 'de' }),
			page('v2-en-intro', 'guides/intro', { version: 'v2', locale: 'en' }),
			page('v2-de-intro', 'guides/intro', { version: 'v2', locale: 'de' })
		];

		expect(resolveEquivalentPage(pages, { slug: 'guides/intro', version: 'v2', locale: 'de' }, routing)).toMatchObject({
			page: { id: 'v2-de-intro' },
			exact: true,
			match: 'exact'
		});
		expect(resolveEquivalentPage(pages, { slug: 'missing', version: 'v2', locale: 'de' }, routing)).toMatchObject({
			page: { id: 'v2-de-index' },
			exact: false,
			fallback: true,
			match: 'destination-index'
		});

		const versionItems = buildDocsVersionSwitcherItems(
			pages,
			{ slug: 'guides/intro', version: 'v3', locale: 'en' },
			routing
		);
		expect(versionItems).toEqual([
			expect.objectContaining({ id: 'v3', current: true, match: 'destination-index' }),
			expect.objectContaining({ id: 'v2', href: '/docs/v2/guides/intro', match: 'exact' })
		]);

		const localeItems = buildDocsLocaleSwitcherItems(
			pages,
			{ slug: 'guides/intro', version: 'v2', locale: 'de' },
			routing
		);
		expect(localeItems).toEqual([
			expect.objectContaining({ id: 'en', href: '/docs/v2/guides/intro', fallback: false }),
			expect.objectContaining({ id: 'de', current: true, href: '/docs/v2/de/guides/intro' })
		]);
	});
});

describe('Phase 11 manifest, translation diagnostics, and metadata', () => {
	it('keeps multi-dimensional manifest identities and route-aware pathnames unique', () => {
		const manifest = createDocsManifest(
			[
				{
					sourcePath: '/private/v3/en/intro.md',
					relativePath: 'intro.md',
					extension: '.md',
					slugSegments: ['intro'],
					slug: 'intro',
					pathname: '/intro',
					version: 'v3',
					locale: 'en'
				},
				{
					sourcePath: '/private/v2/de/intro.md',
					relativePath: 'intro.md',
					extension: '.md',
					slugSegments: ['intro'],
					slug: 'intro',
					pathname: '/intro',
					version: 'v2',
					locale: 'de'
				}
			],
			{ versions, locales, routing }
		);

		expect(manifest.pages.map((entry) => entry.id)).toEqual(['v2/de/intro.md', 'v3/en/intro.md']);
		expect(manifest.pages.map((entry) => entry.pathname)).toEqual(['/docs/v2/de/intro', '/docs/intro']);
		expect(getDocsManifestPageKey(manifest.pages[0]!)).toBe('v2/de/intro.md');
		expect(JSON.stringify(manifest)).not.toContain('/private');
		expect(manifest.versions).toEqual(expect.arrayContaining([{ id: 'v3', label: 'Latest', current: true }]));
	});

	it('reports missing and stale translations', () => {
		const pages = [
			page('en-index', '', { version: 'v3', locale: 'en' }, { contentHash: 'index-1' }),
			page('en-intro', 'intro', { version: 'v3', locale: 'en' }, { contentHash: 'intro-2' }),
			page('de-index', '', { version: 'v3', locale: 'de' }, { translationSourceHash: 'old-index' })
		];
		const diagnostics = diagnoseDocsTranslations(pages, { locales, versions });

		expect(diagnostics).toEqual([
			expect.objectContaining({ code: 'STALE_TRANSLATION', locale: 'de', slug: '' }),
			expect.objectContaining({ code: 'MISSING_TRANSLATION', locale: 'de', slug: 'intro' })
		]);
	});

	it('creates absolute canonical and hreflang metadata only for real equivalents', () => {
		const pages = [
			page('v3-en-intro', 'intro', { version: 'v3', locale: 'en' }),
			page('v3-de-intro', 'intro', { version: 'v3', locale: 'de' }),
			page('v2-en-intro', 'intro', { version: 'v2', locale: 'en' })
		];
		const metadata = createDocsPageMetadata(
			pages,
			{ slug: 'intro', version: 'v3', locale: 'en' },
			routing,
			{ siteOrigin: 'https://docs.example.com', canonicalPolicy: 'self' }
		);

		expect(metadata).toMatchObject({
			canonical: 'https://docs.example.com/docs/intro',
			alternates: [
				{ hreflang: 'en', href: 'https://docs.example.com/docs/intro' },
				{ hreflang: 'de', href: 'https://docs.example.com/docs/de/intro' },
				{ hreflang: 'x-default', href: 'https://docs.example.com/docs/intro' }
			]
		});

		const oldMetadata = createDocsPageMetadata(
			pages,
			{ slug: 'intro', version: 'v2', locale: 'en' },
			routing,
			{ canonicalPolicy: 'current-version' }
		);
		expect(oldMetadata.canonical).toBe('/docs/intro');
	});
});
