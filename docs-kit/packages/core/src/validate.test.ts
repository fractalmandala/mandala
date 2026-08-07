import { describe, expect, it } from 'vitest';

import { createDocsManifest } from './manifest.js';
import { extractDocsLinks } from './markdown.js';
import { formatDocsDiagnostic, validateDocs } from './validate.js';

import type { DiscoveredContent } from './content.js';

function discovered(relativePath: string, raw: string): DiscoveredContent {
	const slug = relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '');

	return {
		sourcePath: `/content/${relativePath}`,
		relativePath,
		extension: '.md',
		slugSegments: slug === '' ? [] : slug.split('/'),
		slug,
		pathname: `/${slug}`,
		raw
	};
}

function build(files: Record<string, string>) {
	const content = Object.entries(files).map(([path, raw]) => discovered(path, raw));
	const manifest = createDocsManifest(content, {
		generatedAt: 'fixed',
		routing: { basePath: '/docs' }
	});
	const sources = new Map(content.map((entry) => [entry.relativePath, entry.raw ?? '']));

	return { manifest, sources };
}

describe('extractDocsLinks', () => {
	it('finds Markdown and HTML links outside code fences', () => {
		const links = extractDocsLinks(
			[
				'---',
				'title: A',
				'---',
				'',
				'See [install](/docs/install) and ![diagram](/img/a.png).',
				'',
				'<a href="/docs/other">other</a>',
				'',
				'```md',
				'[not a link](/docs/nope)',
				'```'
			].join('\n')
		);

		expect(links.map((link) => [link.kind, link.href])).toEqual([
			['link', '/docs/install'],
			['image', '/img/a.png'],
			['link', '/docs/other']
		]);
		expect(links[0]?.line).toBe(5);
	});
});

describe('validateDocs', () => {
	it('accepts a healthy documentation set', () => {
		const { manifest, sources } = build({
			'index.md': '---\ntitle: Home\n---\n\nSee [install](/docs/install).',
			'install.md': '---\ntitle: Install\n---\n\n## Requirements\n\nSee [home](/docs).'
		});

		expect(validateDocs({ manifest, sources }).diagnostics).toEqual([]);
	});

	it('reports broken internal links with suggestions', () => {
		const { manifest, sources } = build({
			'index.md': '---\ntitle: Home\n---\n\nSee [install](/docs/instal).',
			'install.md': '---\ntitle: Install\n---\n\nBody.'
		});

		const [diagnostic] = validateDocs({ manifest, sources }).errors;
		expect(diagnostic).toMatchObject({
			code: 'BROKEN_INTERNAL_LINK',
			file: 'index.md',
			line: 5,
			message: 'Broken internal link: /docs/instal'
		});
		expect(diagnostic?.suggestions).toContain('/docs/install');
		expect(formatDocsDiagnostic(diagnostic!)).toContain('Did you mean: /docs/install');
	});

	it('reports broken anchors on the same page and across pages', () => {
		const { manifest, sources } = build({
			'index.md': '---\ntitle: Home\n---\n\n[a](#overvew) [b](/docs/install#nope)\n\n## Overview',
			'install.md': '---\ntitle: Install\n---\n\n## Requirements'
		});

		const codes = validateDocs({ manifest, sources }).errors.map((entry) => entry.message);
		expect(codes).toEqual(['Broken anchor: #overvew', 'Broken anchor: /docs/install#nope']);
		expect(validateDocs({ manifest, sources }).errors[0]?.suggestions).toContain('#overview');
	});

	it('accepts links to host routes it was told about', () => {
		const { manifest, sources } = build({
			'index.md': '---\ntitle: Home\n---\n\n[blog](/blog)'
		});

		expect(validateDocs({ manifest, sources }).errors).toHaveLength(1);
		expect(
			validateDocs({ manifest, sources, knownRoutes: ['/blog'] }).errors
		).toHaveLength(0);
	});

	it('checks assets only when it can resolve them', () => {
		const { manifest, sources } = build({
			'index.md': '---\ntitle: Home\n---\n\n![x](/img/missing.png)'
		});

		expect(validateDocs({ manifest, sources }).errors).toHaveLength(0);
		expect(
			validateDocs({ manifest, sources, assetExists: () => false }).errors[0]
		).toMatchObject({ code: 'MISSING_ASSET', message: 'Missing asset: /img/missing.png' });
	});

	it('reports missing titles, empty documents, and duplicate anchors', () => {
		const { manifest, sources } = build({
			'empty.md': '',
			'dupes.md': '---\ntitle: Dupes\n---\n\n## Install\n\n## Install'
		});

		const codes = validateDocs({ manifest, sources }).diagnostics.map((entry) => entry.code);
		expect(codes).toContain('EMPTY_DOCUMENT');
		expect(codes).toContain('DUPLICATE_HEADING_ID');
	});

	it('reports orphan pages only when asked', () => {
		const { manifest, sources } = build({
			'index.md': '---\ntitle: Home\n---\n\nBody.',
			'lonely.md': '---\ntitle: Lonely\nhidden: true\n---\n\nBody.'
		});

		expect(validateDocs({ manifest, sources }).warnings).toHaveLength(0);
		expect(
			validateDocs({ manifest, sources, reportOrphans: true }).warnings.map((entry) => entry.code)
		).toEqual([]);
	});

	it('ignores external links and never fetches them', () => {
		const { manifest, sources } = build({
			'index.md': '---\ntitle: Home\n---\n\n[x](https://example.com/missing) [y](mailto:a@b.c)'
		});

		expect(validateDocs({ manifest, sources }).diagnostics).toEqual([]);
	});
});
