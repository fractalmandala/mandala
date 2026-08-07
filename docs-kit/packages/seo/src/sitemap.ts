import type { DocsManifestPage } from '@docs-kit/core';

export interface SitemapSiteOptions {
	/** Absolute site origin. Required: a sitemap must contain absolute URLs. */
	url: string;
}

export interface DocsSitemapEntry {
	loc: string;
	lastmod?: string;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
	/** Alternate language versions of this page. */
	alternates?: Array<{ hreflang: string; href: string }>;
}

export interface CreateDocsSitemapOptions extends SitemapSiteOptions {
	/** Include hidden and draft pages. Defaults to false. */
	includeHidden?: boolean;
	/**
	 * Canonicalization across versions. `current-version` emits only the current version's
	 * pages, which is usually what a search engine should index.
	 */
	versions?: 'all' | 'current-version';
	/** Current version id, required when `versions` is `current-version`. */
	currentVersion?: string;
	/** Default locale, used to emit `x-default` alternates. */
	defaultLocale?: string;
	/** ISO timestamp used when a page has no own modification date. */
	lastmod?: string;
	/** Extra non-documentation URLs the host wants included. */
	additional?: readonly DocsSitemapEntry[];
}

function absolute(pathname: string, siteUrl: string): string {
	try {
		return new URL(pathname, siteUrl).toString();
	} catch {
		throw new Error(`Sitemap site url must be absolute: "${siteUrl}".`);
	}
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function readLastModified(page: DocsManifestPage): string | undefined {
	const value = page.frontmatter['lastModified'] ?? page.frontmatter['updated'];
	return typeof value === 'string' ? value : undefined;
}

/**
 * Builds sitemap entries from the manifest.
 *
 * Hidden and draft pages are excluded, older versions are dropped unless explicitly
 * requested, and translations of a page are emitted as `hreflang` alternates rather than
 * as unrelated URLs.
 */
export function createDocsSitemapEntries(
	pages: readonly DocsManifestPage[],
	options: CreateDocsSitemapOptions
): DocsSitemapEntry[] {
	const visible = pages.filter(
		(page) => options.includeHidden === true || (!page.hidden && !page.draft)
	);
	const selected =
		options.versions === 'current-version' && options.currentVersion !== undefined
			? visible.filter((page) => page.version === undefined || page.version === options.currentVersion)
			: visible;

	const bySlug = new Map<string, DocsManifestPage[]>();
	for (const page of selected) {
		const key = `${page.version ?? ''}|${page.slug}`;
		bySlug.set(key, [...(bySlug.get(key) ?? []), page]);
	}

	const entries = selected.map((page): DocsSitemapEntry => {
		const translations = bySlug.get(`${page.version ?? ''}|${page.slug}`) ?? [page];
		const alternates = translations
			.filter((entry) => entry.locale !== undefined)
			.map((entry) => ({
				hreflang: entry.locale as string,
				href: absolute(entry.pathname, options.url)
			}));

		const defaultTranslation = translations.find(
			(entry) => entry.locale === options.defaultLocale
		);
		if (defaultTranslation && alternates.length > 0) {
			alternates.push({
				hreflang: 'x-default',
				href: absolute(defaultTranslation.pathname, options.url)
			});
		}

		const lastmod = readLastModified(page) ?? options.lastmod;

		return {
			loc: absolute(page.pathname, options.url),
			...(lastmod === undefined ? {} : { lastmod }),
			...(alternates.length > 0 ? { alternates } : {})
		};
	});

	return [...entries, ...(options.additional ?? [])].sort((left, right) =>
		left.loc.localeCompare(right.loc)
	);
}

/** Renders sitemap XML. Output is deterministic, so a rebuild produces identical bytes. */
export function renderDocsSitemap(entries: readonly DocsSitemapEntry[]): string {
	const body = entries
		.map((entry) => {
			const lines = [`\t\t<loc>${escapeXml(entry.loc)}</loc>`];
			if (entry.lastmod) {
				lines.push(`\t\t<lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
			}
			if (entry.changefreq) {
				lines.push(`\t\t<changefreq>${entry.changefreq}</changefreq>`);
			}
			if (entry.priority !== undefined) {
				lines.push(`\t\t<priority>${entry.priority.toFixed(1)}</priority>`);
			}
			for (const alternate of entry.alternates ?? []) {
				lines.push(
					`\t\t<xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.href)}" />`
				);
			}

			return `\t<url>\n${lines.join('\n')}\n\t</url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}

/** Builds and renders a sitemap in one call. */
export function createDocsSitemap(
	pages: readonly DocsManifestPage[],
	options: CreateDocsSitemapOptions
): string {
	return renderDocsSitemap(createDocsSitemapEntries(pages, options));
}

export interface CreateDocsRobotsOptions {
	/** Absolute site origin, used to link the sitemap. */
	url?: string;
	/** Paths disallowed for every crawler. */
	disallow?: readonly string[];
	/** Sitemap URL. Defaults to `/sitemap.xml` under `url`. */
	sitemap?: string | false;
	/** Block all crawling, for preview deployments. Defaults to false. */
	private?: boolean;
}

/** Renders `robots.txt`, defaulting to indexable with the sitemap advertised. */
export function createDocsRobots(options: CreateDocsRobotsOptions = {}): string {
	if (options.private) {
		return 'User-agent: *\nDisallow: /\n';
	}

	const lines = ['User-agent: *', 'Allow: /'];
	for (const path of options.disallow ?? []) {
		lines.push(`Disallow: ${path}`);
	}

	const sitemap =
		options.sitemap === false
			? undefined
			: (options.sitemap ?? (options.url ? absolute('/sitemap.xml', options.url) : undefined));
	if (sitemap) {
		lines.push('', `Sitemap: ${sitemap}`);
	}

	return `${lines.join('\n')}\n`;
}
