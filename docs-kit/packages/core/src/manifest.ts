import { pathToSlug, type ContentExtension, type DiscoveredContent } from '@docs-kit/core/content';
import { normalizeDocsLocales, type DocsI18nConfig, type DocsLocaleRecord } from '@docs-kit/core/i18n';
import { normalizeDocsVersions, type DocsVersionRecord, type DocsVersionsConfig } from '@docs-kit/core/versioning';
import { createDocsPath, type DocsRoutingOptions } from '@docs-kit/core/routing';
import type { DocsCollectionRecord } from '@docs-kit/core/config';
import type { DocsFrontmatterValue } from '@docs-kit/core/frontmatter';
import { extractDocsLinks, type DocsHeading, type DocsLink } from '@docs-kit/core/markdown';
import {
	buildDocsNavigation,
	createDocsPagination,
	getDocsNavigationKey,
	type DiscoveredSection,
	type DocsNavigationInput,
	type DocsNavigationNode,
	type DocsPageReference
} from '@docs-kit/core/navigation';
import { createDocsPageMeta, titleFromSlug } from '@docs-kit/core/page';

/** A client-safe descriptor for a local documentation source. */
export interface DocsManifestSource {
	/** Path relative to the configured documentation root. */
	relativePath: string;
	/** Original supported content extension. */
	extension: ContentExtension;
}

/** Compiler-only source information. Never serialize this object to browser manifests. */
export interface DocsPageSource extends DocsManifestSource {
	path: string;
}

/** A deterministic, serializable page record for documentation route adapters. */
export interface DocsManifestPage {
	/** Stable page identity. It is currently the relative source path. */
	id: string;
	/** Stable collection identity. `default` preserves legacy single-tree behavior. */
	collection: string;
	/** Source data that is safe to expose to client code. */
	source: DocsManifestSource;
	slug: string;
	slugSegments: string[];
	pathname: string;
	/** Normalized absolute alias paths that redirect to `pathname`. */
	aliases: string[];
	version?: string;
	locale?: string;
	contentHash?: string;
	translationSourceHash?: string;
	/** Page title, from frontmatter, the first heading, or the slug. */
	title: string;
	description?: string;
	/** Short navigation label. */
	label: string;
	icon?: string;
	badge?: string;
	order?: number;
	hidden?: boolean;
	draft?: boolean;
	/** Parsed frontmatter, kept so hosts can read their own fields. */
	frontmatter: Record<string, DocsFrontmatterValue>;
	headings: DocsHeading[];
	previous?: DocsPageReference;
	next?: DocsPageReference;
}

/** Full framework-neutral compiler record, including raw source data. */
export interface DocsPageRecord extends Omit<DocsManifestPage, 'source'> {
	source: DocsPageSource;
	raw: string;
	links: DocsLink[];
}

/** A normalized redirect emitted by the compiler and consumed by framework adapters. */
export interface DocsRedirectRecord {
	from: string;
	to: string;
	collection: string;
	/** Aliases are compiler-generated; the field leaves room for configured redirects later. */
	type: 'alias' | 'explicit';
}

/** Initial framework-neutral manifest used by Vite and route adapters. */
export interface DocsManifest {
	generatedAt: string;
	configHash: string;
	/** Runtime routing authority. */
	collections: DocsCollectionRecord[];
	pages: DocsManifestPage[];
	redirects: DocsRedirectRecord[];
	/** Configured versions, or an empty list when versioning is disabled. */
	versions: DocsVersionRecord[];
	/** Configured locales, or an empty list when localization is disabled. */
	locales: DocsLocaleRecord[];
	/** Navigation trees keyed by `getDocsNavigationKey({ version, locale })`. */
	navigation: Record<string, DocsNavigationNode[]>;
}

export interface CreateDocsManifestOptions {
	/** Optional ISO marker supplied by a build integration. Defaults to a stable epoch marker. */
	generatedAt?: string;
	/** Stable hash of the build integration's relevant configuration. */
	configHash?: string;
	/** Optional version configuration copied into the client-safe manifest. */
	versions?: DocsVersionsConfig;
	/** Optional locale configuration copied into the client-safe manifest. */
	locales?: DocsI18nConfig;
	/** Optional route settings used to make page pathnames dimension-aware. */
	routing?: DocsRoutingOptions;
	/** Resolved collection model. The legacy default collection is synthesized when omitted. */
	collections?: readonly DocsCollectionRecord[];
	/** Folder metadata discovered beside the content. */
	sections?: readonly DiscoveredSection[];
	/** Include hidden and draft pages in navigation. Defaults to false. */
	includeHidden?: boolean;
	/** Extra root-level navigation links, for example a repository link. */
	links?: readonly { id: string; label: string; href: string; icon?: string }[];
	/** Explicit navigation, which replaces file-tree generation when supplied. */
	navigation?: readonly DocsNavigationInput[];
}

/** Stable manifest marker used when a host does not provide its own generation value. */
export const defaultDocsManifestGeneratedAt = '1970-01-01T00:00:00.000Z';

function normalizePathname(value: string): string {
	const pathname = value.split(/[?#]/, 1)[0] ?? '';
	const normalized = `/${pathname.split('/').filter(Boolean).join('/')}`;
	return normalized === '/' ? '/' : normalized;
}

function collectionRecords(options: CreateDocsManifestOptions): DocsCollectionRecord[] {
	if (options.collections === undefined || options.collections.length === 0) {
		return [
			{
				id: 'default',
				content: '',
				basePath: normalizePathname(options.routing?.basePath ?? '/')
			}
		];
	}
	return options.collections
		.map((collection) => ({ ...collection, basePath: normalizePathname(collection.basePath) }))
		.sort((left, right) => left.id.localeCompare(right.id));
}

function pageId(entry: DiscoveredContent, collection: string): string {
	const dimensions = [entry.version, entry.locale].filter(
		(dimension): dimension is string => dimension !== undefined
	);
	const legacy = dimensions.length > 0 ? `${dimensions.join('/')}/${entry.relativePath}` : entry.relativePath;
	return collection === 'default' ? legacy : `${collection}/${legacy}`;
}

function pagePathname(
	entry: DiscoveredContent,
	collection: DocsCollectionRecord,
	routing: DocsRoutingOptions | undefined
): string {
	if (routing === undefined) {
		return entry.pathname;
	}
	return createDocsPath(
		{
			slug: entry.slug,
			...(entry.version === undefined ? {} : { version: entry.version }),
			...(entry.locale === undefined ? {} : { locale: entry.locale })
		},
		{ ...routing, basePath: collection.basePath }
	);
}

function aliasPathname(
	alias: string,
	entry: DiscoveredContent,
	collection: DocsCollectionRecord,
	routing: DocsRoutingOptions | undefined
): string {
	if (alias.startsWith('/')) {
		return normalizePathname(alias);
	}
	if (routing === undefined) {
		return normalizePathname(pathToSlug(alias));
	}
	return createDocsPath(
		{
			slug: pathToSlug(alias),
			...(entry.version === undefined ? {} : { version: entry.version }),
			...(entry.locale === undefined ? {} : { locale: entry.locale })
		},
		{ ...routing, basePath: collection.basePath }
	);
}

/** Creates the full compiler record; callers must project it before browser serialization. */
export function createDocsPageRecord(
	entry: DiscoveredContent,
	collection: DocsCollectionRecord,
	routing?: DocsRoutingOptions
): DocsPageRecord {
	const meta = entry.raw === undefined ? undefined : createDocsPageMeta(entry.raw, { slug: entry.slug });
	const pathname = pagePathname(entry, collection, routing);
	const aliases = (meta?.aliases ?? [])
		.map((alias) => aliasPathname(alias, entry, collection, routing))
		.filter((alias, index, all) => all.indexOf(alias) === index)
		.sort((left, right) => left.localeCompare(right));

	return {
		id: pageId(entry, collection.id),
		collection: collection.id,
		source: { relativePath: entry.relativePath, extension: entry.extension, path: entry.sourcePath },
		slug: entry.slug,
		slugSegments: [...entry.slugSegments],
		pathname,
		aliases,
		...(entry.version === undefined ? {} : { version: entry.version }),
		...(entry.locale === undefined ? {} : { locale: entry.locale }),
		...(entry.contentHash === undefined ? {} : { contentHash: entry.contentHash }),
		...(entry.translationSourceHash === undefined
			? {}
			: { translationSourceHash: entry.translationSourceHash }),
		title: meta?.title ?? titleFromSlug(entry.slug),
		...(meta?.description === undefined ? {} : { description: meta.description }),
		label: meta?.label ?? titleFromSlug(entry.slug),
		...(meta?.icon === undefined ? {} : { icon: meta.icon }),
		...(meta?.badge === undefined ? {} : { badge: meta.badge }),
		...(meta?.order === undefined ? {} : { order: meta.order }),
		...(meta?.hidden ? { hidden: true } : {}),
		...(meta?.draft ? { draft: true } : {}),
		frontmatter: meta?.frontmatter ?? {},
		headings: meta?.headings ?? [],
		raw: entry.raw ?? '',
		links: entry.raw === undefined ? [] : extractDocsLinks(entry.raw)
	};
}

function toManifestPage(record: DocsPageRecord): DocsManifestPage {
	const { raw: _raw, links: _links, source, ...page } = record;
	return { ...page, source: { relativePath: source.relativePath, extension: source.extension } };
}

function assertRouteIntegrity(pages: readonly DocsManifestPage[], redirects: readonly DocsRedirectRecord[]): void {
	const errors: string[] = [];
	const canonicalByIdentity = new Map<string, DocsManifestPage>();
	const emitted = new Map<string, { pathname: string; page: DocsManifestPage }>();
	const aliases = new Map<string, DocsRedirectRecord>();

	for (const page of pages) {
		const identity = [page.collection, page.version ?? '', page.locale ?? '', page.slug].join('|');
		const existing = canonicalByIdentity.get(identity);
		if (existing) {
			errors.push(`Duplicate canonical slug "${page.slug || 'index'}" in collection "${page.collection}": ${existing.source.relativePath} and ${page.source.relativePath}.`);
		} else {
			canonicalByIdentity.set(identity, page);
		}
		const emittedKey = normalizePathname(page.pathname).toLowerCase();
		const emittedExisting = emitted.get(emittedKey);
		if (emittedExisting && emittedExisting.pathname !== page.pathname) {
			errors.push(`Case-insensitive emitted-path collision: "${emittedExisting.pathname}" (${emittedExisting.page.source.relativePath}) and "${page.pathname}" (${page.source.relativePath}).`);
		} else if (!emittedExisting) {
			emitted.set(emittedKey, { pathname: page.pathname, page });
		}
	}

	for (const redirect of redirects) {
		const key = normalizePathname(redirect.from).toLowerCase();
		const canonical = emitted.get(key);
		if (canonical) {
			errors.push(`Alias "${redirect.from}" for collection "${redirect.collection}" collides with canonical path "${canonical.pathname}" (${canonical.page.source.relativePath}).`);
		}
		const existing = aliases.get(key);
		if (existing) {
			errors.push(
				existing.to === redirect.to
					? `Duplicate alias "${redirect.from}": both records redirect to "${redirect.to}".`
					: `Duplicate alias "${redirect.from}": redirects to both "${existing.to}" and "${redirect.to}".`
			);
		} else {
			aliases.set(key, redirect);
		}
	}

	const byFrom = new Map(redirects.map((redirect) => [normalizePathname(redirect.from), redirect]));
	for (const redirect of redirects) {
		const seen = new Set<string>();
		let current = normalizePathname(redirect.from);
		while (byFrom.has(current)) {
			if (seen.has(current)) {
				errors.push(`Redirect loop detected from "${redirect.from}".`);
				break;
			}
			seen.add(current);
			current = normalizePathname(byFrom.get(current)?.to ?? '/');
		}
	}

	if (errors.length > 0) {
		throw new Error(`Docs route validation failed:\n${[...new Set(errors)].sort().map((message) => `- ${message}`).join('\n')}`);
	}
}

function clientSafeSource(source: string | undefined): string | undefined {
	if (source === undefined) {
		return undefined;
	}

	const normalized = source.replace(/\\/g, '/');
	return normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized) ? undefined : source;
}

function clientSafeVersions(records: readonly DocsVersionRecord[]): DocsVersionRecord[] {
	return records.map((record) => {
		const source = clientSafeSource(record.source);
		return {
			id: record.id,
			label: record.label,
			current: record.current,
			...(source === undefined ? {} : { source })
		};
	});
}

function clientSafeLocales(records: readonly DocsLocaleRecord[]): DocsLocaleRecord[] {
	return records.map((record) => {
		const source = clientSafeSource(record.source);
		return {
			id: record.id,
			label: record.label,
			default: record.default,
			dir: record.dir,
			...(source === undefined ? {} : { source })
		};
	});
}

function stableSerialize(value: unknown): string {
	if (value === null || typeof value !== 'object') {
		return JSON.stringify(value);
	}

	if (Array.isArray(value)) {
		return `[${value.map(stableSerialize).join(',')}]`;
	}

	const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
		left < right ? -1 : left > right ? 1 : 0
	);
	return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`).join(',')}}`;
}

/**
 * Creates a short deterministic hash for the configuration relevant to a generated manifest.
 * It deliberately uses no runtime-specific crypto API so core stays framework-independent.
 */
export function hashDocsManifestConfig(config: unknown): string {
	let hash = 0x811c9dc5;
	for (const character of stableSerialize(config)) {
		hash ^= character.codePointAt(0) ?? 0;
		hash = Math.imul(hash, 0x01000193);
	}

	return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

/** Builds a deterministic manifest without exposing absolute source paths. */
export function createDocsManifest(
	content: readonly DiscoveredContent[],
	options: CreateDocsManifestOptions = {}
): DocsManifest {
	const versions = options.versions === undefined ? undefined : normalizeDocsVersions(options.versions);
	const locales = options.locales === undefined ? undefined : normalizeDocsLocales(options.locales);
	const collections = collectionRecords(options);
	const collectionById = new Map(collections.map((collection) => [collection.id, collection]));
	const pages = content
		.map<DocsManifestPage>((entry) => {
			const collectionId = entry.collection ?? 'default';
			const collection = collectionById.get(collectionId);
			if (!collection) {
				throw new Error(`Discovered page "${entry.relativePath}" references unknown collection "${collectionId}".`);
			}
			return toManifestPage(createDocsPageRecord(entry, collection, options.routing));
		})
		.sort((left, right) =>
			left.id < right.id ? -1 : left.id > right.id ? 1 : 0
		);

	const redirects = pages
		.flatMap((page) =>
			page.aliases.map<DocsRedirectRecord>((from) => ({
				from: normalizePathname(from),
				to: normalizePathname(page.pathname),
				collection: page.collection,
				type: 'alias'
			}))
		)
		.sort((left, right) => left.from.localeCompare(right.from) || left.to.localeCompare(right.to));

	assertRouteIntegrity(pages, redirects);

	const navigation: Record<string, DocsNavigationNode[]> = {};
	const dimensionKeys = new Map<string, { collection: string; version?: string; locale?: string }>();
	for (const page of pages) {
		const key = getDocsNavigationKey(page);
		if (!dimensionKeys.has(key)) {
			dimensionKeys.set(key, {
				collection: page.collection,
				...(page.version === undefined ? {} : { version: page.version }),
				...(page.locale === undefined ? {} : { locale: page.locale })
			});
		}
	}

	for (const [key, dimensions] of dimensionKeys) {
		const dimensionPages = pages.filter((page) => getDocsNavigationKey(page) === key);
		const dimensionSections = (options.sections ?? []).filter(
			(section) =>
				(section.collection ?? 'default') === dimensions.collection &&
				section.version === dimensions.version &&
				section.locale === dimensions.locale
		);
		const nodes = buildDocsNavigation(dimensionPages, {
			sections: dimensionSections,
			...(options.includeHidden === undefined ? {} : { includeHidden: options.includeHidden }),
			...(options.links === undefined ? {} : { links: options.links }),
			...(options.navigation === undefined ? {} : { navigation: options.navigation })
		});
		navigation[key] = nodes;

		for (const [pageId, links] of createDocsPagination(nodes)) {
			const page = pages.find((entry) => entry.id === pageId);
			if (!page) {
				continue;
			}
			if (links.previous) {
				page.previous = links.previous;
			}
			if (links.next) {
				page.next = links.next;
			}
		}
	}

	return {
		generatedAt: options.generatedAt ?? defaultDocsManifestGeneratedAt,
		configHash: options.configHash ?? hashDocsManifestConfig({}),
		collections,
		pages,
		redirects,
		versions: versions === undefined ? [] : clientSafeVersions(versions.versions),
		locales: locales === undefined ? [] : clientSafeLocales(locales.locales),
		navigation
	};
}

/** Returns the navigation tree that applies to a page's dimensions. */
export function getDocsNavigation(
	manifest: DocsManifest,
	dimensions: { collection?: string; version?: string; locale?: string } = {}
): DocsNavigationNode[] {
	return manifest.navigation[getDocsNavigationKey(dimensions)] ?? [];
}

/** Finds a manifest page using the same normalized slug identity as local discovery. */
export function findManifestPage(
	manifest: DocsManifest,
	slug: string | readonly string[],
	dimensions: { collection?: string; version?: string; locale?: string } = {}
): DocsManifestPage | undefined {
	const normalizedSlug = pathToSlug(typeof slug === 'string' ? slug : slug.join('/'));
	const currentVersion = manifest.versions.find((version) => version.current)?.id;
	const defaultLocale = manifest.locales.find((locale) => locale.default)?.id;

	return manifest.pages.find(
		(page) =>
			page.slug === normalizedSlug &&
			page.collection === (dimensions.collection ?? 'default') &&
			(page.version ?? currentVersion) === (dimensions.version ?? currentVersion) &&
			(page.locale ?? defaultLocale) === (dimensions.locale ?? defaultLocale)
	);
}

/** Returns the unique virtual-module key used for a manifest page importer. */
export function getDocsManifestPageKey(page: DocsManifestPage): string {
	if (page.collection !== 'default') {
		return page.id;
	}
	return page.version || page.locale ? page.id : page.slug;
}

/** Resolves a canonical page by its emitted absolute pathname. */
export function findManifestPageByPathname(
	manifest: DocsManifest,
	pathname: string,
	collection?: string
): DocsManifestPage | undefined {
	const normalized = normalizePathname(pathname);
	return manifest.pages.find(
		(page) => page.pathname === normalized && (collection === undefined || page.collection === collection)
	);
}

/** Resolves a normalized redirect record by its emitted absolute pathname. */
export function findDocsRedirect(
	manifest: DocsManifest,
	pathname: string,
	collection?: string
): DocsRedirectRecord | undefined {
	const normalized = normalizePathname(pathname);
	return manifest.redirects.find(
		(redirect) => redirect.from === normalized && (collection === undefined || redirect.collection === collection)
	);
}
