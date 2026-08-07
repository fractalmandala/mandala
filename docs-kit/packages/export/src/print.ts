import { escapeHtml, exportAnchorId, type DocsExportMetadata, type DocsExportPage } from './document.js';
import { rewriteExportPages } from './rewrite.js';

export interface PrintableDocumentOptions {
	/** Include a cover page. Defaults to true. */
	cover?: boolean;
	/** Include a linked table of contents. Defaults to true. */
	tableOfContents?: boolean;
	/** Extra CSS appended after the built-in print stylesheet. */
	css?: string;
	/** Rewrite links and assets before rendering. Defaults to true. */
	rewriteLinks?: boolean;
	/** Resolves asset URLs, for example to data URIs, when rewriting. */
	resolveAsset?: (url: string) => string | undefined;
}

/**
 * The built-in print stylesheet.
 *
 * It is intentionally free of colour tokens so a host theme can override everything, and it
 * keeps code blocks, tables, and images from breaking across printed pages.
 */
export const printStyles = `
:root { --docs-print-measure: 42rem; }
* { box-sizing: border-box; }
body {
	margin: 0 auto;
	padding: 2rem;
	max-width: var(--docs-print-measure);
	font-family: ui-sans-serif, system-ui, sans-serif;
	line-height: 1.6;
}
img, svg, video { max-width: 100%; height: auto; }
pre {
	white-space: pre-wrap;
	word-break: break-word;
	padding: 0.75rem 1rem;
	border: 1px solid currentColor;
	border-radius: 0.375rem;
}
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid currentColor; padding: 0.375rem 0.5rem; text-align: left; }
.docs-export-cover { min-height: 60vh; display: flex; flex-direction: column; justify-content: center; }
.docs-export-cover img { max-height: 40vh; object-fit: contain; }
.docs-export-toc ol { list-style: decimal; padding-left: 1.5rem; }
.docs-export-page { margin-block-start: 3rem; }
.docs-export-page__section { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; }
@media print {
	body { padding: 0; max-width: none; }
	.docs-export-cover, .docs-export-toc { break-after: page; }
	.docs-export-page { break-before: page; }
	.docs-export-page:first-of-type { break-before: auto; }
	h1, h2, h3, h4 { break-after: avoid; }
	pre, table, figure, img { break-inside: avoid; }
	a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.75em; word-break: break-all; }
	a[href^="#"]::after { content: none; }
}
`.trim();

function coverSection(metadata: DocsExportMetadata): string {
	return [
		'<section class="docs-export-cover">',
		metadata.coverImage
			? `<img src="${escapeHtml(metadata.coverImage)}" alt="${escapeHtml(metadata.title)}" />`
			: '',
		`<h1>${escapeHtml(metadata.title)}</h1>`,
		metadata.subtitle ? `<p class="docs-export-cover__subtitle">${escapeHtml(metadata.subtitle)}</p>` : '',
		metadata.description ? `<p>${escapeHtml(metadata.description)}</p>` : '',
		metadata.author ? `<p>${escapeHtml(metadata.author)}</p>` : '',
		metadata.date ? `<p><time datetime="${escapeHtml(metadata.date)}">${escapeHtml(metadata.date)}</time></p>` : '',
		metadata.siteUrl ? `<p><a href="${escapeHtml(metadata.siteUrl)}">${escapeHtml(metadata.siteUrl)}</a></p>` : '',
		'</section>'
	]
		.filter(Boolean)
		.join('\n');
}

function tableOfContentsSection(pages: readonly DocsExportPage[]): string {
	const items = pages
		.map(
			(page) =>
				`<li><a href="#${exportAnchorId(page.id)}">${escapeHtml(page.title)}</a></li>`
		)
		.join('\n');

	return `<nav class="docs-export-toc" aria-label="Contents">\n<h2>Contents</h2>\n<ol>\n${items}\n</ol>\n</nav>`;
}

function pageSection(page: DocsExportPage): string {
	return [
		`<article class="docs-export-page" id="${exportAnchorId(page.id)}">`,
		page.section ? `<p class="docs-export-page__section">${escapeHtml(page.section)}</p>` : '',
		`<h1>${escapeHtml(page.title)}</h1>`,
		page.description ? `<p class="docs-export-page__description">${escapeHtml(page.description)}</p>` : '',
		page.html,
		'</article>'
	]
		.filter(Boolean)
		.join('\n');
}

/**
 * Builds a self-contained printable HTML document.
 *
 * Printing it produces the PDF: no headless browser is required, so this works in the
 * browser, on a static host, and in CI alike.
 */
export function createPrintableDocument(
	pages: readonly DocsExportPage[],
	metadata: DocsExportMetadata,
	options: PrintableDocumentOptions = {}
): string {
	const prepared =
		options.rewriteLinks === false
			? [...pages]
			: rewriteExportPages(
					pages,
					metadata,
					options.resolveAsset === undefined ? {} : { resolveAsset: options.resolveAsset }
				);
	const language = metadata.language ?? 'en';

	return [
		'<!doctype html>',
		`<html lang="${escapeHtml(language)}">`,
		'<head>',
		'<meta charset="utf-8" />',
		'<meta name="viewport" content="width=device-width, initial-scale=1" />',
		`<title>${escapeHtml(metadata.title)}</title>`,
		metadata.description ? `<meta name="description" content="${escapeHtml(metadata.description)}" />` : '',
		`<style>\n${printStyles}\n${options.css ?? ''}\n</style>`,
		'</head>',
		'<body>',
		options.cover === false ? '' : coverSection(metadata),
		options.tableOfContents === false || prepared.length === 0 ? '' : tableOfContentsSection(prepared),
		'<main>',
		prepared.map(pageSection).join('\n'),
		'</main>',
		'</body>',
		'</html>',
		''
	]
		.filter((line) => line !== '')
		.join('\n');
}

export interface ExportBatchOptions {
	/** Maximum pages per batch. Defaults to 100. */
	maxPages?: number;
	/** Maximum combined HTML characters per batch. Defaults to 2,000,000. */
	maxCharacters?: number;
}

/**
 * Splits a large export into batches.
 *
 * Whole-site exports can exceed what a browser can lay out in one document; batching keeps
 * each generated file printable. A single oversized page is never split, so content is
 * never silently truncated.
 */
export function splitExportBatches(
	pages: readonly DocsExportPage[],
	options: ExportBatchOptions = {}
): DocsExportPage[][] {
	const maxPages = Math.max(options.maxPages ?? 100, 1);
	const maxCharacters = Math.max(options.maxCharacters ?? 2_000_000, 1);
	const batches: DocsExportPage[][] = [];
	let current: DocsExportPage[] = [];
	let size = 0;

	for (const page of pages) {
		const length = page.html.length;
		const wouldOverflow = current.length >= maxPages || (current.length > 0 && size + length > maxCharacters);

		if (wouldOverflow) {
			batches.push(current);
			current = [];
			size = 0;
		}

		current.push(page);
		size += length;
	}

	if (current.length > 0) {
		batches.push(current);
	}

	return batches;
}
