import { error, redirect } from '@sveltejs/kit';
import {
	findDocsRedirect,
	findManifestPageByPathname,
	getDocsManifestPageKey,
	getDocsNavigation,
	type DocsCollectionRecord,
	type DocsLocaleRecord,
	type DocsManifest,
	type DocsManifestPage,
	type DocsNavigationNode,
	type DocsVersionRecord
} from '@docs-kit/core';
import type { Component } from 'svelte';

export type DocsPageContent = Component;
export type DocsPageImporter = () => Promise<{ default: DocsPageContent }>;

export interface DocsSvelteKitSite {
	title: string;
	description?: string;
	url?: string;
	[key: string]: unknown;
}

export interface CreateDocsLoaderOptions {
	/** Generated Vite manifest. The selected collection supplies its base path. */
	manifest: DocsManifest;
	/** Explicit Vite importers; no module is evaluated until a canonical page resolves. */
	pageImporters: Readonly<Record<string, DocsPageImporter | undefined>>;
	/** Stable collection id, never a duplicated base-path setting. */
	collection: string;
	site?: DocsSvelteKitSite;
}

export interface CreateDocsEntriesOptions {
	manifest: DocsManifest;
	collection: string;
}

/** SvelteKit's route-specific EntryGenerator is structurally compatible with this output. */
export type DocsEntries = () => Array<{ slug: string }>;

/** Structural universal load signature; route-local `PageLoad` may assign this directly. */
export type DocsLoader = (event: { url: URL }) => Promise<DocsPageData>;

export interface DocsPageData {
	page: DocsManifestPage;
	navigation: DocsNavigationNode[];
	toc: DocsManifestPage['headings'];
	previous?: DocsManifestPage['previous'];
	next?: DocsManifestPage['next'];
	collection: DocsCollectionRecord;
	locale?: DocsLocaleRecord;
	version?: DocsVersionRecord;
	content: DocsPageContent;
	site?: DocsSvelteKitSite;
}

function normalizePathname(value: string): string {
	const pathname = value.split(/[?#]/, 1)[0] ?? '';
	const normalized = `/${pathname.split('/').filter(Boolean).join('/')}`;
	return normalized === '/' ? '/' : normalized;
}

function collectionFor(manifest: DocsManifest, id: string): DocsCollectionRecord {
	const collection = manifest.collections.find((candidate) => candidate.id === id);
	if (!collection) {
		error(500, `Docs collection "${id}" is not present in the generated manifest.`);
	}
	return collection;
}

function isWithinCollection(pathname: string, collection: DocsCollectionRecord): boolean {
	if (collection.basePath === '/') {
		return pathname.startsWith('/');
	}
	return pathname === collection.basePath || pathname.startsWith(`${collection.basePath}/`);
}

/**
 * Creates a universal SvelteKit loader for exactly one manifest collection.
 * It checks redirects and canonical route resolution before obtaining a lazy module importer.
 */
export function createDocsLoader(options: CreateDocsLoaderOptions): DocsLoader {
	const collection = collectionFor(options.manifest, options.collection);

	return async ({ url }) => {
		const pathname = normalizePathname(url.pathname);
		if (!isWithinCollection(pathname, collection)) {
			error(404, `No documentation page exists at "${pathname}" for collection "${collection.id}".`);
		}

		const redirected = findDocsRedirect(options.manifest, pathname, collection.id);
		if (redirected) {
			throw redirect(308, redirected.to);
		}

		const page = findManifestPageByPathname(options.manifest, pathname, collection.id);
		if (!page) {
			error(404, `No documentation page matches "${pathname}" in collection "${collection.id}".`);
		}

		const importer = options.pageImporters[getDocsManifestPageKey(page)];
		if (!importer) {
			error(404, `No compiled module exists for documentation page "${page.pathname}".`);
		}

		const module = await importer();
		const locale = page.locale === undefined ? undefined : options.manifest.locales.find((entry) => entry.id === page.locale);
		const version = page.version === undefined ? undefined : options.manifest.versions.find((entry) => entry.id === page.version);

		return {
			page,
			navigation: getDocsNavigation(options.manifest, {
				collection: page.collection,
				...(page.version === undefined ? {} : { version: page.version }),
				...(page.locale === undefined ? {} : { locale: page.locale })
			}),
			toc: page.headings,
			...(page.previous === undefined ? {} : { previous: page.previous }),
			...(page.next === undefined ? {} : { next: page.next }),
			collection,
			...(locale === undefined ? {} : { locale }),
			...(version === undefined ? {} : { version }),
			content: module.default,
			...(options.site === undefined ? {} : { site: options.site })
		} satisfies DocsPageData;
	};
}

function routeRelative(pathname: string, collection: DocsCollectionRecord): string {
	if (pathname === collection.basePath) {
		return '';
	}
	return pathname.slice(collection.basePath.length).replace(/^\//, '');
}

/**
 * Creates route-relative catch-all entries for canonical pages and redirects under one mount.
 */
export function createDocsEntries(options: CreateDocsEntriesOptions): DocsEntries {
	const collection = collectionFor(options.manifest, options.collection);
	const paths = [
		...options.manifest.pages
			.filter((page) => page.collection === collection.id)
			.map((page) => page.pathname),
		...options.manifest.redirects
			.filter((redirect) => redirect.collection === collection.id)
			.map((redirect) => redirect.from)
	];
	return () =>
		[...new Set(paths)]
			.filter((pathname) => isWithinCollection(pathname, collection))
			.sort((left, right) => left.localeCompare(right))
			.map((pathname) => ({ slug: routeRelative(pathname, collection) }));
}
