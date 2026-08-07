import type { DocsManifestPage } from '@docs-kit/core';

function cardFileName(
	page: Pick<DocsManifestPage, 'slug' | 'version' | 'locale'>,
	extension: string
): string {
	const slug = page.slug === '' ? 'index' : page.slug.replace(/\//g, '-');
	const dimensions = [page.version, page.locale].filter(Boolean).join('-');

	return `${dimensions === '' ? slug : `${dimensions}-${slug}`}.${extension}`;
}

/** Deterministic file name for a page's card, safe to import in a browser bundle. */
export function docsOgCardFileName(
	page: Pick<DocsManifestPage, 'slug' | 'version' | 'locale'>,
	extension = 'svg'
): string {
	return cardFileName(page, extension);
}

/** URL for a generated page card, safe to import in a browser bundle. */
export function docsOgCardUrl(
	page: Pick<DocsManifestPage, 'slug' | 'version' | 'locale'>,
	options: { publicPath?: string; extension?: string; siteUrl?: string } = {}
): string {
	const path = `${(options.publicPath ?? '/og').replace(/\/$/, '')}/${docsOgCardFileName(page, options.extension ?? 'svg')}`;

	if (options.siteUrl === undefined) {
		return path;
	}

	try {
		return new URL(path, options.siteUrl).toString();
	} catch {
		return path;
	}
}
