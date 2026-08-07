import { pathToSlug } from '@docs-kit/core/content';
import { normalizeDocsLocales, type DocsI18nConfig, type DocsLocaleRecord } from '@docs-kit/core/i18n';
import type { DocsManifestPage } from '@docs-kit/core/manifest';
import {
	normalizeDocsVersions,
	type DocsVersionRecord,
	type DocsVersionsConfig
} from '@docs-kit/core/versioning';

/** A documentation location independent of any router implementation. */
export interface DocsRouteTarget {
	slug: string;
	version?: string;
	locale?: string;
}

export type DocsVersionPrefixPolicy = 'always' | 'except-current';
export type DocsLocalePrefixPolicy = 'always' | 'except-default';

/** Input configuration for route generation and parsing. */
export interface DocsRoutingOptions {
	basePath?: string;
	versionPrefix?: DocsVersionPrefixPolicy;
	localePrefix?: DocsLocalePrefixPolicy;
	versions?: DocsVersionsConfig;
	locales?: DocsI18nConfig;
}

/** Fully materialized route policy, suitable for adapters and serialized build data. */
export interface DocsNormalizedRoutingOptions {
	basePath: string;
	versionPrefix: DocsVersionPrefixPolicy;
	localePrefix: DocsLocalePrefixPolicy;
	versions: DocsVersionRecord[];
	locales: DocsLocaleRecord[];
}

export type DocsEquivalentMatch =
	| 'exact'
	| 'default-locale'
	| 'destination-index'
	| 'current-default-index'
	| 'none';

/** Result of finding the closest real documentation page for a requested destination. */
export interface DocsEquivalentPageResolution {
	page?: DocsManifestPage;
	target: DocsRouteTarget;
	exact: boolean;
	fallback: boolean;
	match: DocsEquivalentMatch;
}

export interface DocsVersionSwitcherItem {
	id: string;
	label: string;
	current: boolean;
	target: DocsRouteTarget;
	href?: string;
	page?: DocsManifestPage;
	fallback: boolean;
	match: DocsEquivalentMatch;
}

export interface DocsLocaleSwitcherItem {
	id: string;
	label: string;
	dir: 'ltr' | 'rtl';
	default: boolean;
	current: boolean;
	target: DocsRouteTarget;
	href?: string;
	page?: DocsManifestPage;
	fallback: boolean;
	match: DocsEquivalentMatch;
}

function normalizeBasePath(basePath: string | undefined): string {
	if (basePath === undefined || basePath.trim() === '' || basePath === '/') {
		return '';
	}

	const segments = basePath
		.trim()
		.split('/')
		.filter(Boolean);
	return segments.length === 0 ? '' : `/${segments.join('/')}`;
}

function makeTarget(slug: string, version: string | undefined, locale: string | undefined): DocsRouteTarget {
	return {
		slug: pathToSlug(slug),
		...(version === undefined ? {} : { version }),
		...(locale === undefined ? {} : { locale })
	};
}

function currentVersion(options: DocsNormalizedRoutingOptions): string | undefined {
	return options.versions.find((version) => version.current)?.id;
}

function defaultLocale(options: DocsNormalizedRoutingOptions): string | undefined {
	return options.locales.find((locale) => locale.default)?.id;
}

function assertKnownId(
	id: string,
	records: readonly { id: string }[],
	dimension: 'version' | 'locale'
): void {
	if (!records.some((record) => record.id === id)) {
		throw new Error(`Unknown docs ${dimension} "${id}".`);
	}
}

/** Normalizes all routing policy into explicit version and locale records. */
export function normalizeDocsRoutingOptions(
	options: DocsRoutingOptions = {}
): DocsNormalizedRoutingOptions {
	const versions = options.versions === undefined ? undefined : normalizeDocsVersions(options.versions);
	const locales = options.locales === undefined ? undefined : normalizeDocsLocales(options.locales);
	const localePrefix =
		options.localePrefix ?? (options.locales?.omitDefaultLocale === false ? 'always' : 'except-default');

	return {
		basePath: normalizeBasePath(options.basePath),
		versionPrefix: options.versionPrefix ?? 'except-current',
		localePrefix,
		versions: versions?.versions ?? [],
		locales: locales?.locales ?? []
	};
}

/** Applies configured defaults and validates any explicitly requested route dimensions. */
export function normalizeDocsRouteTarget(
	target: DocsRouteTarget,
	options: DocsRoutingOptions = {}
): DocsRouteTarget {
	const normalized = normalizeDocsRoutingOptions(options);
	const version = target.version ?? currentVersion(normalized);
	const locale = target.locale ?? defaultLocale(normalized);

	if (target.version !== undefined && normalized.versions.length === 0) {
		throw new Error('A docs version target requires a versions configuration.');
	}
	if (target.locale !== undefined && normalized.locales.length === 0) {
		throw new Error('A docs locale target requires a locales configuration.');
	}
	if (version !== undefined) {
		assertKnownId(version, normalized.versions, 'version');
	}
	if (locale !== undefined) {
		assertKnownId(locale, normalized.locales, 'locale');
	}

	return makeTarget(target.slug, version, locale);
}

/** Creates a canonical pathname with deterministic version-before-locale segments. */
export function createDocsPath(target: DocsRouteTarget, options: DocsRoutingOptions = {}): string {
	const normalized = normalizeDocsRoutingOptions(options);
	const resolved = normalizeDocsRouteTarget(target, options);
	const segments = normalized.basePath === '' ? [] : normalized.basePath.slice(1).split('/');
	const current = currentVersion(normalized);
	const defaultLanguage = defaultLocale(normalized);

	if (
		resolved.version !== undefined &&
		(normalized.versionPrefix === 'always' || resolved.version !== current)
	) {
		segments.push(resolved.version);
	}
	if (
		resolved.locale !== undefined &&
		(normalized.localePrefix === 'always' || resolved.locale !== defaultLanguage)
	) {
		segments.push(resolved.locale);
	}

	const slug = pathToSlug(resolved.slug);
	if (slug) {
		segments.push(...slug.split('/'));
	}

	return `/${segments.join('/')}`.replace(/\/+/g, '/') || '/';
}

/** Parses a pathname only when it belongs to the configured documentation base path. */
export function parseDocsPath(
	pathname: string,
	options: DocsRoutingOptions = {}
): DocsRouteTarget | undefined {
	const normalized = normalizeDocsRoutingOptions(options);
	const pathOnly = pathname.split(/[?#]/, 1)[0] ?? '';
	const segments = pathOnly.split('/').filter(Boolean);
	const baseSegments = normalized.basePath === '' ? [] : normalized.basePath.slice(1).split('/');

	if (baseSegments.some((segment, index) => segments[index] !== segment)) {
		return undefined;
	}

	let index = baseSegments.length;
	let version = currentVersion(normalized);
	let locale = defaultLocale(normalized);
	const candidateVersion = segments[index];
	if (normalized.versions.length > 0 && candidateVersion !== undefined) {
		const knownVersion = normalized.versions.find((record) => record.id === candidateVersion);
		if (
			knownVersion !== undefined &&
			(normalized.versionPrefix === 'always' || !knownVersion.current)
		) {
			version = knownVersion.id;
			index += 1;
		} else if (normalized.versionPrefix === 'always') {
			return undefined;
		}
	} else if (normalized.versionPrefix === 'always' && normalized.versions.length > 0) {
		return undefined;
	}

	const candidateLocale = segments[index];
	if (normalized.locales.length > 0 && candidateLocale !== undefined) {
		const knownLocale = normalized.locales.find((record) => record.id === candidateLocale);
		if (
			knownLocale !== undefined &&
			(normalized.localePrefix === 'always' || !knownLocale.default)
		) {
			locale = knownLocale.id;
			index += 1;
		} else if (normalized.localePrefix === 'always') {
			return undefined;
		}
	} else if (normalized.localePrefix === 'always' && normalized.locales.length > 0) {
		return undefined;
	}

	return makeTarget(segments.slice(index).join('/'), version, locale);
}

function pageDimensions(
	page: DocsManifestPage,
	options: DocsNormalizedRoutingOptions
): Pick<DocsRouteTarget, 'version' | 'locale'> {
	const version = options.versions.length === 0 ? undefined : page.version ?? currentVersion(options);
	const locale = options.locales.length === 0 ? undefined : page.locale ?? defaultLocale(options);
	return {
		...(version === undefined ? {} : { version }),
		...(locale === undefined ? {} : { locale })
	};
}

function findPage(
	pages: readonly DocsManifestPage[],
	target: DocsRouteTarget,
	options: DocsNormalizedRoutingOptions
): DocsManifestPage | undefined {
	const slug = pathToSlug(target.slug);
	return pages.find((page) => {
		const dimensions = pageDimensions(page, options);
		return (
			pathToSlug(page.slug) === slug &&
			dimensions.version === target.version &&
			dimensions.locale === target.locale
		);
	});
}

function resolution(
	page: DocsManifestPage | undefined,
	target: DocsRouteTarget,
	match: DocsEquivalentMatch
): DocsEquivalentPageResolution {
	return {
		...(page === undefined ? {} : { page }),
		target,
		exact: match === 'exact',
		fallback: match !== 'exact',
		match
	};
}

/**
 * Resolves an equivalent real page in deterministic fallback order: exact, default-locale,
 * destination index, then the current/default index.
 */
export function resolveEquivalentPage(
	pages: readonly DocsManifestPage[],
	target: DocsRouteTarget,
	options: DocsRoutingOptions = {}
): DocsEquivalentPageResolution {
	const normalized = normalizeDocsRoutingOptions(options);
	const destination = normalizeDocsRouteTarget(target, options);
	const defaultLanguage = defaultLocale(normalized);
	const current = currentVersion(normalized);
	const candidates: Array<{ target: DocsRouteTarget; match: DocsEquivalentMatch }> = [
		{ target: destination, match: 'exact' }
	];

	if (destination.locale !== undefined && destination.locale !== defaultLanguage) {
		candidates.push({
			target: makeTarget(destination.slug, destination.version, defaultLanguage),
			match: 'default-locale'
		});
	}
	if (destination.slug !== '') {
		candidates.push({
			target: makeTarget('', destination.version, destination.locale),
			match: 'destination-index'
		});
	}
	if (destination.slug !== '' || destination.version !== current || destination.locale !== defaultLanguage) {
		candidates.push({
			target: makeTarget('', current, defaultLanguage),
			match: 'current-default-index'
		});
	}

	for (const candidate of candidates) {
		const page = findPage(pages, candidate.target, normalized);
		if (page !== undefined) {
			return resolution(page, candidate.target, candidate.match);
		}
	}

	return resolution(undefined, destination, 'none');
}

/** Builds version-switcher data that always points at a real equivalent page when one exists. */
export function buildDocsVersionSwitcherItems(
	pages: readonly DocsManifestPage[],
	target: DocsRouteTarget,
	options: DocsRoutingOptions = {}
): DocsVersionSwitcherItem[] {
	const normalized = normalizeDocsRoutingOptions(options);
	const destination = normalizeDocsRouteTarget(target, options);
	return normalized.versions.map((version) => {
		const requested = makeTarget(destination.slug, version.id, destination.locale);
		const resolved = resolveEquivalentPage(pages, requested, options);
		return {
			id: version.id,
			label: version.label,
			current: destination.version === version.id,
			target: resolved.target,
			...(resolved.page === undefined ? {} : { page: resolved.page }),
			...(resolved.page === undefined ? {} : { href: createDocsPath(resolved.target, options) }),
			fallback: resolved.fallback,
			match: resolved.match
		};
	});
}

/** Builds locale-switcher data that preserves the current slug whenever that translation exists. */
export function buildDocsLocaleSwitcherItems(
	pages: readonly DocsManifestPage[],
	target: DocsRouteTarget,
	options: DocsRoutingOptions = {}
): DocsLocaleSwitcherItem[] {
	const normalized = normalizeDocsRoutingOptions(options);
	const destination = normalizeDocsRouteTarget(target, options);
	return normalized.locales.map((locale) => {
		const requested = makeTarget(destination.slug, destination.version, locale.id);
		const resolved = resolveEquivalentPage(pages, requested, options);
		return {
			id: locale.id,
			label: locale.label,
			dir: locale.dir,
			default: locale.default,
			current: destination.locale === locale.id,
			target: resolved.target,
			...(resolved.page === undefined ? {} : { page: resolved.page }),
			...(resolved.page === undefined ? {} : { href: createDocsPath(resolved.target, options) }),
			fallback: resolved.fallback,
			match: resolved.match
		};
	});
}
