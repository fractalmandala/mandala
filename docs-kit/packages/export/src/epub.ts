import { escapeHtml, exportAnchorId, type DocsExportMetadata, type DocsExportPage } from './document.js';
import { rewriteExportPages } from './rewrite.js';
import { createZip, type ZipEntry } from './zip.js';

export interface EpubOptions {
	/** Rewrite links and assets before packaging. Defaults to true. */
	rewriteLinks?: boolean;
	/** Resolves asset URLs, for example to data URIs, when rewriting. */
	resolveAsset?: (url: string) => string | undefined;
	/** Extra CSS added to the packaged stylesheet. */
	css?: string;
}

export interface EpubFile {
	filename: string;
	data: Uint8Array;
}

const voidElements = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'source',
	'track',
	'wbr'
]);

const epubStyles = `
body { font-family: serif; line-height: 1.6; margin: 1em; }
pre { white-space: pre-wrap; word-wrap: break-word; border: 1px solid #888; padding: 0.5em; }
img { max-width: 100%; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #888; padding: 0.25em 0.5em; }
`.trim();

/**
 * Converts rendered HTML into the XHTML an EPUB reader requires: void elements are closed
 * and bare ampersands are escaped, without touching existing entities.
 */
export function htmlToXhtml(html: string): string {
	const withClosedVoids = html.replace(
		/<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)\s*\/?>/g,
		(match, rawName: string, attributes: string) => {
			const name = rawName.toLowerCase();
			if (!voidElements.has(name)) {
				return match;
			}
			return `<${name}${attributes.trimEnd()} />`;
		}
	);

	return withClosedVoids.replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
}

function chapterFilename(index: number, page: DocsExportPage): string {
	return `text/${String(index + 1).padStart(4, '0')}-${exportAnchorId(page.id)}.xhtml`;
}

function chapterDocument(page: DocsExportPage, language: string): string {
	return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${escapeHtml(language)}" lang="${escapeHtml(language)}">
<head>
<title>${escapeHtml(page.title)}</title>
<link rel="stylesheet" type="text/css" href="../styles/docs.css" />
</head>
<body>
<section id="${exportAnchorId(page.id)}">
<h1>${escapeHtml(page.title)}</h1>
${page.description ? `<p>${escapeHtml(page.description)}</p>\n` : ''}${htmlToXhtml(page.html)}
</section>
</body>
</html>
`;
}

function navDocument(
	pages: readonly DocsExportPage[],
	metadata: DocsExportMetadata,
	language: string
): string {
	const items = pages
		.map(
			(page, index) =>
				`<li><a href="${chapterFilename(index, page).replace('text/', '')}">${escapeHtml(page.title)}</a></li>`
		)
		.join('\n');

	return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${escapeHtml(language)}" lang="${escapeHtml(language)}">
<head>
<title>${escapeHtml(metadata.title)}</title>
</head>
<body>
<nav epub:type="toc" id="toc">
<h1>Contents</h1>
<ol>
${items}
</ol>
</nav>
</body>
</html>
`;
}

function packageDocument(
	pages: readonly DocsExportPage[],
	metadata: DocsExportMetadata,
	language: string
): string {
	const identifier = metadata.identifier ?? metadata.siteUrl ?? `urn:docs-kit:${metadata.title}`;
	const manifest = pages
		.map(
			(page, index) =>
				`<item id="chapter-${index + 1}" href="${chapterFilename(index, page)}" media-type="application/xhtml+xml" />`
		)
		.join('\n');
	const spine = pages
		.map((_page, index) => `<itemref idref="chapter-${index + 1}" />`)
		.join('\n');

	return `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="pub-id">${escapeHtml(identifier)}</dc:identifier>
<dc:title>${escapeHtml(metadata.title)}</dc:title>
<dc:language>${escapeHtml(language)}</dc:language>
${metadata.description ? `<dc:description>${escapeHtml(metadata.description)}</dc:description>\n` : ''}${
		metadata.author ? `<dc:creator>${escapeHtml(metadata.author)}</dc:creator>\n` : ''
	}${metadata.publisher ? `<dc:publisher>${escapeHtml(metadata.publisher)}</dc:publisher>\n` : ''}${
		metadata.date ? `<dc:date>${escapeHtml(metadata.date)}</dc:date>\n` : ''
	}<meta property="dcterms:modified">${escapeHtml(metadata.date ?? '1980-01-01T00:00:00Z')}</meta>
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
<item id="style" href="styles/docs.css" media-type="text/css" />
${manifest}
</manifest>
<spine>
<itemref idref="nav" />
${spine}
</spine>
</package>
`;
}

const containerDocument = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />
</rootfiles>
</container>
`;

/**
 * Packages rendered pages as a valid, deterministic EPUB 3 file.
 *
 * The `mimetype` entry is stored uncompressed first, as the specification requires, and all
 * timestamps are fixed so repeated builds produce identical bytes.
 */
export function createEpub(
	pages: readonly DocsExportPage[],
	metadata: DocsExportMetadata,
	options: EpubOptions = {}
): EpubFile {
	if (pages.length === 0) {
		throw new Error('An EPUB export requires at least one page.');
	}

	const encoder = new TextEncoder();
	const language = metadata.language ?? 'en';
	const prepared =
		options.rewriteLinks === false
			? [...pages]
			: rewriteExportPages(
					pages,
					metadata,
					options.resolveAsset === undefined ? {} : { resolveAsset: options.resolveAsset }
				);

	const entries: ZipEntry[] = [
		{ path: 'mimetype', data: encoder.encode('application/epub+zip'), store: true },
		{ path: 'META-INF/container.xml', data: encoder.encode(containerDocument) },
		{
			path: 'OEBPS/content.opf',
			data: encoder.encode(packageDocument(prepared, metadata, language))
		},
		{
			path: 'OEBPS/nav.xhtml',
			data: encoder.encode(navDocument(prepared, metadata, language))
		},
		{
			path: 'OEBPS/styles/docs.css',
			data: encoder.encode(`${epubStyles}\n${options.css ?? ''}`.trimEnd())
		},
		...prepared.map((page, index) => ({
			path: `OEBPS/${chapterFilename(index, page)}`,
			data: encoder.encode(chapterDocument(page, language))
		}))
	];

	const filename = `${
		metadata.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'documentation'
	}.epub`;

	return { filename, data: createZip(entries) };
}
