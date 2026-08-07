/** One rendered documentation page prepared for export. */
export interface DocsExportPage {
	/** Stable page id, used to build in-document anchors. */
	id: string;
	title: string;
	description?: string;
	/** Route pathname, used to resolve internal links between exported pages. */
	pathname: string;
	/** Rendered page HTML, without the surrounding documentation shell. */
	html: string;
	/** Optional section label shown above the page title. */
	section?: string;
	locale?: string;
	version?: string;
}

/** Cover and publication metadata shared by printable documents and EPUB files. */
export interface DocsExportMetadata {
	title: string;
	subtitle?: string;
	description?: string;
	author?: string;
	publisher?: string;
	language?: string;
	/** Absolute site origin used to make internal links and assets resolvable. */
	siteUrl?: string;
	/** Cover image URL or data URI. */
	coverImage?: string;
	/** Publication date as an ISO string. Supplied explicitly so output stays deterministic. */
	date?: string;
	/** Stable publication identifier. Defaults to the site URL or the title. */
	identifier?: string;
}

/** Turns a page id into a stable, document-unique anchor. */
export function exportAnchorId(id: string): string {
	const slug = id
		.toLowerCase()
		.replace(/\.(md|svx)$/, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	return `page-${slug === '' ? 'index' : slug}`;
}

/** Escapes text for safe inclusion in HTML and XHTML output. */
export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
