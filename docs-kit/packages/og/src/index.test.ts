import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import type { DocsManifestPage } from '@docs-kit/core';

import { createDocsOgCard, estimateTextWidth, wrapText } from './card.js';
import { docsOgCardFileName, docsOgCardUrl } from './client.js';
import { generateDocsOgCards, listDocsOgCards } from './generate.js';

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function temporaryDirectory(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'docs-kit-og-'));
	temporaryRoots.push(root);
	return root;
}

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
	page({ id: 'index.md', slug: '', title: 'Acme Documentation', description: 'Everything.' }),
	page({ id: 'guides/deploy.md', title: 'Deployment', description: 'Ship the docs.' }),
	page({ id: 'draft.md', title: 'Draft', draft: true })
];

describe('wrapText', () => {
	it('wraps to the available width and truncates past the line limit', () => {
		const lines = wrapText('Configure the documentation framework for a large site', {
			fontSize: 78,
			maxWidth: 600,
			maxLines: 2
		});

		expect(lines.length).toBeLessThanOrEqual(2);
		expect(lines.at(-1)?.endsWith('…')).toBe(true);
		expect(estimateTextWidth('MMM', 10)).toBeGreaterThan(estimateTextWidth('iii', 10));
	});

	it('keeps a single long word rather than dropping it', () => {
		expect(wrapText('supercalifragilistic', { fontSize: 78, maxWidth: 50, maxLines: 2 })).toEqual([
			'supercalifragilistic'
		]);
	});
});

describe('createDocsOgCard', () => {
	it('renders a self-contained SVG with escaped content', () => {
		const svg = createDocsOgCard({
			title: 'Deployment & <hosting>',
			description: 'Ship it.',
			section: 'guides',
			siteName: 'Acme',
			version: 'v2',
			locale: 'en'
		});

		expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"')).toBe(
			true
		);
		expect(svg).toContain('Deployment &amp; &lt;hosting&gt;');
		expect(svg).toContain('GUIDES · V2');
		expect(svg).toContain('Acme');
		expect(svg).not.toContain('<script');
	});

	it('honours theme overrides and a custom template', () => {
		expect(createDocsOgCard({ title: 'A' }, { theme: { accent: '#ff0000' } })).toContain('#ff0000');
		expect(
			createDocsOgCard({ title: 'A' }, { template: (input) => `<svg>${input.title}</svg>` })
		).toBe('<svg>A</svg>');
	});
});

describe('browser-safe Open Graph helpers', () => {
	it('derive card paths without importing the Node generator', () => {
		expect(docsOgCardFileName(page({ id: 'guides/deploy.md' }))).toBe('guides-deploy.svg');
		expect(docsOgCardUrl(page({ id: 'index.md', slug: '' }))).toBe('/og/index.svg');
	});
});

describe('generateDocsOgCards', () => {
	it('writes one card per visible page and reports its URL', async () => {
		const cwd = await temporaryDirectory();
		const result = await generateDocsOgCards({ pages, outDir: 'static/og', cwd, siteName: 'Acme' });

		expect(result.cards.map((card) => card.file)).toEqual(['index.svg', 'guides-deploy.svg']);
		expect(result.cards[0]?.url).toBe('/og/index.svg');
		expect(result.cards.every((card) => card.status === 'written')).toBe(true);
		expect(await listDocsOgCards(join(cwd, 'static/og'))).toEqual([
			'guides-deploy.svg',
			'index.svg'
		]);
	});

	it('regenerates only what changed', async () => {
		const cwd = await temporaryDirectory();
		await generateDocsOgCards({ pages, outDir: 'static/og', cwd });

		const unchanged = await generateDocsOgCards({ pages, outDir: 'static/og', cwd });
		expect(unchanged.cards.every((card) => card.status === 'unchanged')).toBe(true);

		const edited = [pages[0] as DocsManifestPage, page({ id: 'guides/deploy.md', title: 'Deploy now' })];
		const changed = await generateDocsOgCards({ pages: edited, outDir: 'static/og', cwd });

		expect(changed.cards.find((card) => card.file === 'index.svg')?.status).toBe('unchanged');
		expect(changed.cards.find((card) => card.file === 'guides-deploy.svg')?.status).toBe('written');
	});

	it('regenerates every card when the theme changes', async () => {
		const cwd = await temporaryDirectory();
		await generateDocsOgCards({ pages, outDir: 'static/og', cwd });

		const restyled = await generateDocsOgCards({
			pages,
			outDir: 'static/og',
			cwd,
			theme: { accent: '#123456' }
		});

		expect(restyled.cards.every((card) => card.status === 'written')).toBe(true);
	});

	it('removes cards whose page was deleted', async () => {
		const cwd = await temporaryDirectory();
		await generateDocsOgCards({ pages, outDir: 'static/og', cwd });

		const result = await generateDocsOgCards({
			pages: [pages[0] as DocsManifestPage],
			outDir: 'static/og',
			cwd
		});

		expect(result.removed).toEqual(['guides-deploy.svg']);
		expect(await listDocsOgCards(join(cwd, 'static/og'))).toEqual(['index.svg']);
	});

	it('emits PNG when a rasterizer is supplied', async () => {
		const cwd = await temporaryDirectory();
		const rasterize = async (svg: string) => new TextEncoder().encode(`PNG:${svg.length}`);
		const result = await generateDocsOgCards({
			pages: [pages[0] as DocsManifestPage],
			outDir: 'static/og',
			cwd,
			rasterize
		});

		expect(result.cards[0]?.file).toBe('index.png');
		expect(await readFile(join(cwd, 'static/og/index.png'), 'utf8')).toMatch(/^PNG:\d+$/);
	});

	it('names cards per dimension and recovers from a corrupt cache', async () => {
		const cwd = await temporaryDirectory();
		const localized = [
			page({ id: 'de/install.md', slug: 'install', title: 'Installation', locale: 'de', version: 'v2' })
		];

		const first = await generateDocsOgCards({ pages: localized, outDir: 'static/og', cwd });
		expect(first.cards[0]?.file).toBe('v2-de-install.svg');

		await writeFile(join(cwd, 'static/og/cache.json'), 'not json', 'utf8');
		const second = await generateDocsOgCards({ pages: localized, outDir: 'static/og', cwd });
		expect(second.cards[0]?.status).toBe('written');
	});
});
