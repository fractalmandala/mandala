import { describe, expect, it } from 'vitest';

import { createDocsManifest, type DiscoveredContent } from '@docs-kit/core';

import { createDocsEntries, createDocsLoader } from './index.js';

const root = '/private/docs';
const collections = [
	{ id: 'default', content: 'src/lib/docs', basePath: '/docs' },
	{ id: 'guide', content: 'src/lib/guide', basePath: '/guide' }
] as const;

function page(
	collection: string,
	relativePath: string,
	raw: string
): DiscoveredContent {
	const slug = relativePath.replace(/\.(?:md|svx)$/, '').replace(/(?:^|\/)index$/, '');
	return {
		collection,
		sourcePath: `${root}/${collection}/${relativePath}`,
		relativePath,
		extension: relativePath.endsWith('.svx') ? '.svx' : '.md',
		slugSegments: slug === '' ? [] : slug.split('/'),
		slug,
		pathname: slug === '' ? '/' : `/${slug}`,
		raw
	};
}

function fixture() {
	return createDocsManifest(
		[
			page('default', 'index.md', '---\nalias: welcome\n---\n# Docs'),
			page('default', 'install.md', '# Install'),
			page('guide', 'index.md', '# Guide')
		],
		{ collections, routing: { basePath: '/docs' }, generatedAt: 'fixed' }
	);
}

function rootFixture() {
	return createDocsManifest(
		[
			page('root', 'index.md', '---\nalias: welcome\n---\n# Root docs'),
			page('root', 'install.md', '# Root install')
		],
		{
			collections: [{ id: 'root', content: 'src/lib/docs', basePath: '/' }],
			routing: { basePath: '/docs' },
			generatedAt: 'fixed'
		}
	);
}

describe('createDocsLoader', () => {
	it('resolves the selected collection before lazily importing the canonical module', async () => {
		const manifest = fixture();
		let calls = 0;
		const content = {};
		const load = createDocsLoader({
			manifest,
			collection: 'default',
			pageImporters: {
				'': async () => {
					calls += 1;
					return { default: content };
				}
			},
			site: { title: 'Docs' }
		});

		const data = await load({ url: new URL('https://example.test/docs') });
		expect(calls).toBe(1);
		expect(data).toMatchObject({
			page: { pathname: '/docs', collection: 'default' },
			collection: { id: 'default', basePath: '/docs' },
			toc: [{ id: 'docs', text: 'Docs', depth: 1 }],
			site: { title: 'Docs' }
		});
	});

	it('redirects aliases before calling importers and distinguishes missing pages and importers', async () => {
		const manifest = fixture();
		let calls = 0;
		const load = createDocsLoader({
			manifest,
			collection: 'default',
			pageImporters: {
				'': async () => {
					calls += 1;
					return { default: {} };
				}
			}
		});

		await expect(load({ url: new URL('https://example.test/docs/welcome') })).rejects.toMatchObject({
			status: 308,
			location: '/docs'
		});
		expect(calls).toBe(0);
		await expect(load({ url: new URL('https://example.test/docs/missing') })).rejects.toMatchObject({ status: 404 });
		await expect(load({ url: new URL('https://example.test/docs/install') })).rejects.toMatchObject({ status: 404 });
	});

	it('resolves root-mounted child pages and aliases', async () => {
		const manifest = rootFixture();
		let calls = 0;
		const load = createDocsLoader({
			manifest,
			collection: 'root',
			pageImporters: {
				'root/install.md': async () => {
					calls += 1;
					return { default: {} };
				}
			}
		});

		const data = await load({ url: new URL('https://example.test/install') });
		expect(data.page.pathname).toBe('/install');
		expect(calls).toBe(1);
		await expect(load({ url: new URL('https://example.test/welcome') })).rejects.toMatchObject({
			status: 308,
			location: '/'
		});
	});
});

describe('createDocsEntries', () => {
	it('emits canonical and redirect entries route-relative to each mount', () => {
		const manifest = fixture();
		expect(createDocsEntries({ manifest, collection: 'default' })()).toEqual([
			{ slug: '' },
			{ slug: 'install' },
			{ slug: 'welcome' }
		]);
		expect(createDocsEntries({ manifest, collection: 'guide' })()).toEqual([{ slug: '' }]);
	});

	it('keeps root-mounted canonical pages and aliases route-relative', () => {
		expect(createDocsEntries({ manifest: rootFixture(), collection: 'root' })()).toEqual([
			{ slug: '' },
			{ slug: 'install' },
			{ slug: 'welcome' }
		]);
	});
});
