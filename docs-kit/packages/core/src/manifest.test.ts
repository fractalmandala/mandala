import { describe, expect, it } from 'vitest';

import {
	createDocsManifest,
	findManifestPage,
	hashDocsManifestConfig
} from './manifest.js';

import type { DiscoveredContent } from './content.js';

const root = '/private/tmp/docs-kit-content';
const discoveredContent: DiscoveredContent[] = [
	{
		sourcePath: `${root}/guides/index.svx`,
		relativePath: 'guides/index.svx',
		extension: '.svx',
		slugSegments: ['guides'],
		slug: 'guides',
		pathname: '/guides'
	},
	{
		sourcePath: `${root}/getting-started.md`,
		relativePath: 'getting-started.md',
		extension: '.md',
		slugSegments: ['getting-started'],
		slug: 'getting-started',
		pathname: '/getting-started'
	}
];

describe('createDocsManifest', () => {
	it('creates deterministically ordered client-safe pages', () => {
		const manifest = createDocsManifest(discoveredContent, {
			generatedAt: '2026-08-06T00:00:00.000Z',
			configHash: 'config-123'
		});

		expect(manifest).toMatchObject({
			generatedAt: '2026-08-06T00:00:00.000Z',
			configHash: 'config-123'
		});
		expect(manifest.pages.map((page) => page.id)).toEqual([
			'getting-started.md',
			'guides/index.svx'
		]);
		expect(manifest.pages[0]).toEqual({
			id: 'getting-started.md',
			collection: 'default',
			source: { relativePath: 'getting-started.md', extension: '.md' },
			slug: 'getting-started',
			slugSegments: ['getting-started'],
			pathname: '/getting-started',
			aliases: [],
			title: 'Getting started',
			label: 'Getting started',
			frontmatter: {},
			headings: [],
			next: { id: 'guides/index.svx', label: 'Guides', pathname: '/guides' }
		});
		expect(JSON.stringify(manifest)).not.toContain(root);
		expect(JSON.stringify(manifest)).not.toContain('sourcePath');
	});

	it('emits collection-qualified pages and normalized alias redirects without changing default keys', () => {
		const manifest = createDocsManifest(
			[
				{
					sourcePath: `${root}/index.md`, relativePath: 'index.md', extension: '.md', slugSegments: [], slug: '', pathname: '/',
					raw: '---\nalias: welcome\n---\n# Home'
				},
				{
					collection: 'guide', sourcePath: `${root}/guide/index.md`, relativePath: 'index.md', extension: '.md', slugSegments: [], slug: '', pathname: '/',
					raw: '---\naliases: [start, /legacy-guide]\n---\n# Guide'
				}
			],
			{
				collections: [
					{ id: 'default', content: 'docs', basePath: '/docs' },
					{ id: 'guide', content: 'guide', basePath: '/guide' }
				],
				routing: { basePath: '/docs' },
				generatedAt: 'fixed'
			}
		);

		expect(manifest.pages.map((page) => [page.id, page.pathname, page.aliases])).toEqual([
			['guide/index.md', '/guide', ['/guide/start', '/legacy-guide']],
			['index.md', '/docs', ['/docs/welcome']]
		]);
		expect(manifest.redirects).toEqual([
			{ from: '/docs/welcome', to: '/docs', collection: 'default', type: 'alias' },
			{ from: '/guide/start', to: '/guide', collection: 'guide', type: 'alias' },
			{ from: '/legacy-guide', to: '/guide', collection: 'guide', type: 'alias' }
		]);
	});

	it('rejects deterministic duplicate, case-insensitive, and alias collisions before navigation', () => {
		const source = (relativePath: string, raw = '# Page') => ({
			sourcePath: `${root}/${relativePath}`,
			relativePath,
			extension: '.md' as const,
			slugSegments: relativePath.replace(/\.md$/, '').split('/'),
			slug: relativePath.replace(/\.md$/, ''),
			pathname: `/${relativePath.replace(/\.md$/, '')}`,
			raw
		});

		expect(() => createDocsManifest([source('guide.md'), { ...source('guide.md'), sourcePath: `${root}/guide.svx`, relativePath: 'guide.svx', extension: '.svx' }])).toThrow(
			'Duplicate canonical slug "guide"'
		);
		expect(() => createDocsManifest([source('Guide.md'), source('guide.md')])).toThrow(
			'Case-insensitive emitted-path collision'
		);
		expect(() => createDocsManifest([source('guide.md', '---\nalias: other\n---\n# Guide'), source('other.md')])).toThrow(
			'collides with canonical path "/other"'
		);
		expect(() => createDocsManifest([source('guide.md', '---\nalias: Welcome\naliases: [welcome]\n---\n# Guide')])).toThrow(
			'Duplicate alias'
		);
	});

	it('serializes repeated generated manifests identically without a wall-clock override', () => {
		const first = createDocsManifest(discoveredContent);
		const second = createDocsManifest(discoveredContent);
		expect(first.generatedAt).toBe('1970-01-01T00:00:00.000Z');
		expect(JSON.stringify(first)).toBe(JSON.stringify(second));
		expect(createDocsManifest(discoveredContent, { generatedAt: 'custom' }).generatedAt).toBe('custom');
	});

	it('normalizes route slugs for manifest lookup', () => {
		const manifest = createDocsManifest(discoveredContent, { generatedAt: 'fixed' });

		expect(findManifestPage(manifest, 'guides/index.svx')).toMatchObject({ slug: 'guides' });
		expect(findManifestPage(manifest, ['getting-started'])).toMatchObject({
			slug: 'getting-started'
		});
		expect(findManifestPage(manifest, 'missing')).toBeUndefined();
	});

	it('hashes equivalent configuration objects stably and changes when configuration changes', () => {
		expect(hashDocsManifestConfig({ content: 'src/lib/docs', hidden: false })).toBe(
			hashDocsManifestConfig({ hidden: false, content: 'src/lib/docs' })
		);
		expect(hashDocsManifestConfig({ content: 'src/lib/docs' })).not.toBe(
			hashDocsManifestConfig({ content: 'src/content' })
		);
	});
});
