import { inflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';

import { createEpub, htmlToXhtml } from './epub.js';
import { createPrintableDocument, splitExportBatches } from './print.js';
import { rewriteExportHtml } from './rewrite.js';
import { createZip, crc32 } from './zip.js';

import type { DocsExportMetadata, DocsExportPage } from './document.js';

const pages: DocsExportPage[] = [
	{
		id: 'index.md',
		title: 'Introduction',
		pathname: '/docs',
		html: '<h2 id="overview">Overview</h2>\n<p>See <a href="/docs/install">install</a> and <a href="/blog">the blog</a>.</p>'
	},
	{
		id: 'install.md',
		title: 'Installation',
		section: 'Getting started',
		description: 'Install the package.',
		pathname: '/docs/install',
		html: '<pre><code>pnpm add docs-kit</code></pre>\n<img src="/images/diagram.png" alt="Diagram">\n<p><a href="#overview">top</a></p>'
	}
];

const metadata: DocsExportMetadata = {
	title: 'Acme Documentation',
	author: 'Acme',
	siteUrl: 'https://acme.com',
	date: '2026-08-06T00:00:00Z'
};

/** Minimal reader for the archives produced by `createZip`, used to assert structure. */
function readZip(archive: Uint8Array): Map<string, string> {
	const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
	const decoder = new TextDecoder();
	const files = new Map<string, string>();
	let offset = 0;

	while (offset + 4 <= archive.length && view.getUint32(offset, true) === 0x04034b50) {
		const method = view.getUint16(offset + 8, true);
		const compressedSize = view.getUint32(offset + 18, true);
		const nameLength = view.getUint16(offset + 26, true);
		const extraLength = view.getUint16(offset + 28, true);
		const nameStart = offset + 30;
		const dataStart = nameStart + nameLength + extraLength;
		const name = decoder.decode(archive.subarray(nameStart, nameStart + nameLength));
		const data = archive.subarray(dataStart, dataStart + compressedSize);

		files.set(name, decoder.decode(method === 0 ? data : new Uint8Array(inflateRawSync(data))));
		offset = dataStart + compressedSize;
	}

	return files;
}

describe('rewriteExportHtml', () => {
	it('turns links between exported pages into anchors and absolutizes the rest', () => {
		const html = rewriteExportHtml(pages[0] as DocsExportPage, {
			pages,
			siteUrl: 'https://acme.com'
		});

		expect(html).toContain('href="#page-install"');
		expect(html).toContain('href="https://acme.com/blog"');
		expect(html).toContain('id="page-index--overview"');
	});

	it('scopes in-page anchors and resolves assets through the provided resolver', () => {
		const html = rewriteExportHtml(pages[1] as DocsExportPage, {
			pages,
			siteUrl: 'https://acme.com',
			resolveAsset: (url) => (url === '/images/diagram.png' ? 'data:image/png;base64,AAA' : undefined)
		});

		expect(html).toContain('href="#page-install--overview"');
		expect(html).toContain('src="data:image/png;base64,AAA"');
	});

	it('leaves external, mail, and data URLs untouched', () => {
		const html = rewriteExportHtml(
			{
				id: 'a.md',
				title: 'A',
				pathname: '/docs/a',
				html: '<a href="https://example.com">x</a><a href="mailto:a@b.c">y</a><img src="data:image/png;base64,AA">'
			},
			{ pages, siteUrl: 'https://acme.com' }
		);

		expect(html).toContain('href="https://example.com"');
		expect(html).toContain('href="mailto:a@b.c"');
		expect(html).toContain('src="data:image/png;base64,AA"');
	});
});

describe('createPrintableDocument', () => {
	it('builds a self-contained document with a cover, contents, and every page', () => {
		const html = createPrintableDocument(pages, metadata);

		expect(html.startsWith('<!doctype html>')).toBe(true);
		expect(html).toContain('<h1>Acme Documentation</h1>');
		expect(html).toContain('<a href="#page-install">Installation</a>');
		expect(html).toContain('<p class="docs-export-page__section">Getting started</p>');
		expect(html).toContain('pnpm add docs-kit');
		expect(html).toContain('break-before: page');
	});

	it('supports omitting the cover and contents and appending host CSS', () => {
		const html = createPrintableDocument(pages, metadata, {
			cover: false,
			tableOfContents: false,
			css: '.docs-export-page { color: rebeccapurple; }'
		});

		expect(html).not.toContain('<section class="docs-export-cover">');
		expect(html).not.toContain('<nav class="docs-export-toc"');
		expect(html).toContain('rebeccapurple');
	});

	it('escapes metadata and page titles', () => {
		const html = createPrintableDocument(
			[{ id: 'a.md', title: '<script>alert(1)</script>', pathname: '/docs/a', html: '<p>ok</p>' }],
			{ title: 'A & B' }
		);

		expect(html).toContain('A &amp; B');
		expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
	});
});

describe('splitExportBatches', () => {
	it('batches by page count and size without splitting a single page', () => {
		const many = Array.from({ length: 5 }, (_value, index) => ({
			id: `page-${index}.md`,
			title: `Page ${index}`,
			pathname: `/docs/page-${index}`,
			html: 'x'.repeat(100)
		}));

		expect(splitExportBatches(many, { maxPages: 2 }).map((batch) => batch.length)).toEqual([2, 2, 1]);
		expect(splitExportBatches(many, { maxCharacters: 250 }).map((batch) => batch.length)).toEqual([
			2, 2, 1
		]);
		expect(splitExportBatches(many, { maxCharacters: 1 })).toHaveLength(5);
		expect(splitExportBatches([])).toEqual([]);
	});
});

describe('createZip', () => {
	it('produces deterministic archives that round-trip', () => {
		const encoder = new TextEncoder();
		const entries = [
			{ path: 'mimetype', data: encoder.encode('application/epub+zip'), store: true },
			{ path: 'a/b.txt', data: encoder.encode('hello world'.repeat(20)) }
		];

		const first = createZip(entries);
		expect(Array.from(createZip(entries))).toEqual(Array.from(first));
		expect(readZip(first).get('a/b.txt')).toBe('hello world'.repeat(20));
		expect(crc32(encoder.encode('123456789'))).toBe(0xcbf43926);
	});
});

describe('createEpub', () => {
	it('packages a valid EPUB with metadata, navigation, and chapters', () => {
		const epub = createEpub(pages, metadata);
		const files = readZip(epub.data);

		expect(epub.filename).toBe('acme-documentation.epub');
		expect([...files.keys()][0]).toBe('mimetype');
		expect(files.get('mimetype')).toBe('application/epub+zip');
		expect(files.get('META-INF/container.xml')).toContain('OEBPS/content.opf');

		const opf = files.get('OEBPS/content.opf') ?? '';
		expect(opf).toContain('<dc:title>Acme Documentation</dc:title>');
		expect(opf).toContain('<dc:creator>Acme</dc:creator>');
		expect(opf).toContain('<dc:identifier id="pub-id">https://acme.com</dc:identifier>');
		expect(opf).toContain('href="text/0002-page-install.xhtml"');

		expect(files.get('OEBPS/nav.xhtml')).toContain('<a href="0002-page-install.xhtml">Installation</a>');

		const chapter = files.get('OEBPS/text/0002-page-install.xhtml') ?? '';
		expect(chapter).toContain('<h1>Installation</h1>');
		expect(chapter).toContain('pnpm add docs-kit');
		expect(chapter).toContain('<img src="https://acme.com/images/diagram.png" alt="Diagram" />');
	});

	it('is byte-stable across builds and rejects an empty export', () => {
		expect(Array.from(createEpub(pages, metadata).data)).toEqual(
			Array.from(createEpub(pages, metadata).data)
		);
		expect(() => createEpub([], metadata)).toThrow(/at least one page/);
	});

	it('closes void elements and escapes bare ampersands for XHTML', () => {
		expect(htmlToXhtml('<br><img src="a.png" alt="a & b"><p>x &amp; y &#38; z</p>')).toBe(
			'<br /><img src="a.png" alt="a &amp; b" /><p>x &amp; y &#38; z</p>'
		);
	});
});
