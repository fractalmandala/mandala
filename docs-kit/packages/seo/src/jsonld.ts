import type { DocsManifestPage, DocsNavigationNode } from '@docs-kit/core';

export interface DocsSeoSite {
	title: string;
	description?: string;
	url?: string;
	repository?: string;
	logo?: string;
}

export interface DocsJsonLdOptions {
	site: DocsSeoSite;
	/** Navigation used to derive the breadcrumb trail. */
	navigation?: readonly DocsNavigationNode[];
	/** Mount path, used as the documentation root breadcrumb. */
	basePath?: string;
	/** Absolute Open Graph image URL. */
	image?: string;
}

type JsonLd = Record<string, unknown>;

function absolute(pathname: string, siteUrl: string | undefined): string | undefined {
	if (siteUrl === undefined) {
		return undefined;
	}

	try {
		return new URL(pathname, siteUrl).toString();
	} catch {
		return undefined;
	}
}

function trail(
	nodes: readonly DocsNavigationNode[],
	pathname: string
): Array<{ label: string; pathname?: string }> {
	for (const node of nodes) {
		if (node.type === 'link') {
			continue;
		}
		if (node.type === 'page') {
			if (node.pathname === pathname) {
				return [{ label: node.label, pathname: node.pathname }];
			}
			const nested = trail(node.children ?? [], pathname);
			if (nested.length > 0) {
				return [{ label: node.label, pathname: node.pathname }, ...nested];
			}
			continue;
		}

		const nested = trail(node.children, pathname);
		if (nested.length > 0) {
			return [{ label: node.label }, ...nested];
		}
	}

	return [];
}

/** `TechArticle` describing one documentation page. */
export function createDocsArticleJsonLd(
	page: DocsManifestPage,
	options: DocsJsonLdOptions
): JsonLd {
	const url = absolute(page.pathname, options.site.url);

	return {
		'@context': 'https://schema.org',
		'@type': 'TechArticle',
		headline: page.title,
		...(page.description === undefined ? {} : { description: page.description }),
		...(url === undefined ? {} : { url, mainEntityOfPage: url }),
		...(options.image === undefined ? {} : { image: options.image }),
		inLanguage: page.locale ?? 'en',
		isPartOf: {
			'@type': 'WebSite',
			name: options.site.title,
			...(options.site.url === undefined ? {} : { url: options.site.url })
		},
		...(options.site.repository === undefined
			? {}
			: { codeRepository: options.site.repository })
	};
}

/** `BreadcrumbList` for the trail leading to a page. */
export function createDocsBreadcrumbJsonLd(
	page: DocsManifestPage,
	options: DocsJsonLdOptions
): JsonLd | undefined {
	const entries = [
		{ label: options.site.title, pathname: options.basePath ?? '/docs' },
		...trail(options.navigation ?? [], page.pathname)
	];

	if (entries.length < 2) {
		return undefined;
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: entries.map((entry, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: entry.label,
			...(entry.pathname === undefined
				? {}
				: { item: absolute(entry.pathname, options.site.url) ?? entry.pathname })
		}))
	};
}

/**
 * Every JSON-LD document a documentation page should expose.
 *
 * Breadcrumbs are omitted for a page with no trail rather than emitted with a single item,
 * which search engines treat as invalid.
 */
export function createDocsJsonLd(
	page: DocsManifestPage,
	options: DocsJsonLdOptions
): JsonLd[] {
	const breadcrumb = createDocsBreadcrumbJsonLd(page, options);
	return [createDocsArticleJsonLd(page, options), ...(breadcrumb ? [breadcrumb] : [])];
}

/** Serializes JSON-LD for a `<script type="application/ld+json">` block. */
export function renderDocsJsonLd(documents: readonly JsonLd[]): string {
	return JSON.stringify(documents.length === 1 ? documents[0] : documents).replace(
		/</g,
		'\\u003c'
	);
}
