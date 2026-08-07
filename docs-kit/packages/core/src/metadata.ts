import type { DocsManifestPage } from '@docs-kit/core/manifest';
import { normalizeDocsLocales } from '@docs-kit/core/i18n';
import {
	createDocsPath,
	normalizeDocsRoutingOptions,
	normalizeDocsRouteTarget,
	resolveEquivalentPage,
	type DocsRouteTarget,
	type DocsRoutingOptions
} from '@docs-kit/core/routing';

export type DocsCanonicalPolicy = 'self' | 'current-version';

export interface DocsMetadataOptions {
	/** Optional absolute site origin used to turn pathnames into absolute URLs. */
	siteOrigin?: string;
	/** Whether canonical URLs identify the current-version equivalent or the current page itself. */
	canonicalPolicy?: DocsCanonicalPolicy;
}

export interface DocsLocaleAlternate {
	hreflang: string;
	href: string;
}

/** Framework-neutral canonical and alternate-link data for a real manifest page. */
export interface DocsPageMetadata {
	canonical?: string;
	alternates: DocsLocaleAlternate[];
	page?: DocsManifestPage;
	fallback: boolean;
}

function absoluteOrPath(pathname: string, siteOrigin: string | undefined): string {
	if (siteOrigin === undefined) {
		return pathname;
	}

	try {
		return new URL(pathname, siteOrigin).toString();
	} catch {
		throw new Error(`Docs metadata siteOrigin must be an absolute URL: "${siteOrigin}".`);
	}
}

function findExactPage(
	pages: readonly DocsManifestPage[],
	target: DocsRouteTarget,
	options: DocsRoutingOptions
): DocsManifestPage | undefined {
	const resolved = resolveEquivalentPage(pages, target, options);
	return resolved.exact ? resolved.page : undefined;
}

/**
 * Creates canonical and locale alternate metadata while linking only to pages that exist in
 * the manifest. Missing translations are deliberately omitted instead of routed to fallbacks.
 */
export function createDocsPageMetadata(
	pages: readonly DocsManifestPage[],
	target: DocsRouteTarget,
	routing: DocsRoutingOptions = {},
	options: DocsMetadataOptions = {}
): DocsPageMetadata {
	const self = resolveEquivalentPage(pages, target, routing);
	if (self.page === undefined) {
		return { alternates: [], fallback: true };
	}

	const normalizedTarget = normalizeDocsRouteTarget(self.target, routing);
	const normalizedRouting = normalizeDocsRoutingOptions(routing);
	let canonicalResolution = self;
	const currentVersion = normalizedRouting.versions.find((version) => version.current)?.id;
	if (options.canonicalPolicy === 'current-version' && currentVersion !== undefined) {
		canonicalResolution = resolveEquivalentPage(
			pages,
			{
				slug: normalizedTarget.slug,
				version: currentVersion,
				...(normalizedTarget.locale === undefined ? {} : { locale: normalizedTarget.locale })
			},
			routing
		);
	}

	const canonical =
		canonicalResolution.page === undefined
			? undefined
			: absoluteOrPath(createDocsPath(canonicalResolution.target, routing), options.siteOrigin);
	const alternates: DocsLocaleAlternate[] = [];
	if (routing.locales !== undefined) {
		const locales = normalizeDocsLocales(routing.locales);
		const defaultLocale = locales.defaultLocale;
		for (const localeRecord of locales.locales) {
			const locale = localeRecord.id;
			const alternateTarget: DocsRouteTarget = {
				slug: normalizedTarget.slug,
				...(normalizedTarget.version === undefined ? {} : { version: normalizedTarget.version }),
				locale
			};
			if (findExactPage(pages, alternateTarget, routing) !== undefined) {
				alternates.push({
					hreflang: locale,
					href: absoluteOrPath(createDocsPath(alternateTarget, routing), options.siteOrigin)
				});
			}
		}

		const defaultAlternate = alternates.find((alternate) => alternate.hreflang === defaultLocale);
		if (defaultAlternate !== undefined) {
			alternates.push({ hreflang: 'x-default', href: defaultAlternate.href });
		}
	}

	return {
		...(canonical === undefined ? {} : { canonical }),
		alternates,
		page: self.page,
		fallback: self.fallback
	};
}
