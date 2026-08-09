import {
	contentExtensionFromPath,
	createDocsManifest,
	createDocsSearchRecords,
	getDocsManifestPageKey,
	hashDocsManifestConfig,
	normalizeDocsLocales,
	normalizeDocsVersions,
	parseDocsSourceCacheIndex,
	sectionMetaFileName,
	type DocsI18nConfig,
	type DocsManifest,
	type DocsManifestPage,
	type DocsCollectionRecord,
	type DiscoveredSection,
	type DocsNavigationInput,
	type DocsRoutingOptions,
	type DocsVersionRecord,
	type DocsVersionsConfig,
	type DiscoveredContent
} from '@docs-kit/core';
import {
	discoverLocalContent,
	discoverLocalSections
} from '@docs-kit/core/discovery';
import { generateDocsOgCards, type GenerateDocsOgCardsOptions } from '@docs-kit/og/server';
import { generateApiDocs, type DocsApiSourceConfig } from '@docs-kit/openapi';
import {
	createDocsRobots,
	createDocsSitemap,
	type CreateDocsRobotsOptions,
	type CreateDocsSitemapOptions
} from '@docs-kit/seo';
import { readdirSync, readFileSync } from 'node:fs';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { isAbsolute, relative, resolve } from 'node:path';

import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';

/** Public Vite module id consumed by documentation route adapters. */
export const virtualManifestId = 'virtual:docs-kit/manifest';
const resolvedVirtualManifestId = `\0${virtualManifestId}`;

/** Public Vite module id exposing search records for any provider or host-wide index. */
export const virtualSearchId = 'virtual:docs-kit/search';
const resolvedVirtualSearchId = `\0${virtualSearchId}`;

/**
 * Public Vite module id exposing raw Markdown keyed by page id.
 *
 * It backs raw-Markdown endpoints and `llms.txt`. Import it from server code only: the
 * documentation body does not belong in a client bundle.
 */
export const virtualRawId = 'virtual:docs-kit/raw';
const resolvedVirtualRawId = `\0${virtualRawId}`;

export interface DocsPluginOptions {
	/** Backward-compatible single local content directory. */
	content?: string;
	/** Separately mounted documentation trees. Replaces legacy `content` and `basePath`. */
	collections?: readonly { id: string; content: string; basePath: string }[];
	/** Version configuration; each version may supply a source relative to the Vite root. */
	versions?: DocsVersionsConfig;
	/** Locale configuration; locale sources are resolved below each version/content root. */
	i18n?: DocsI18nConfig;
	/** Documentation mount path used for generated manifest pathnames. */
	basePath?: string;
	/** Whether current-version route segments are emitted. */
	versionPrefix?: DocsRoutingOptions['versionPrefix'];
	/** Whether default-locale route segments are emitted. */
	localePrefix?: DocsRoutingOptions['localePrefix'];
	/**
	 * Directory holding synced content-source caches, relative to the Vite root.
	 * Each immediate subdirectory is mounted as an additional content root, so remote
	 * documents produced by `docs sync` compile alongside local content.
	 */
	sourceCacheDir?: string;
	/** Include hidden and draft pages in generated navigation. Defaults to false. */
	includeHidden?: boolean;
	/** Extra root-level navigation links, for example a repository link. */
	links?: readonly { id: string; label: string; href: string; icon?: string }[];
	/** Explicit navigation, which replaces file-tree generation when supplied. */
	navigation?: readonly DocsNavigationInput[];
	/** Search-record generation. Set `false` to omit the virtual search module. */
	search?: false | { includeHidden?: boolean; sections?: boolean; maxBodyLength?: number };
	/**
	 * Discovery artifacts written into the static directory: sitemap, robots, and Open Graph
	 * cards. They are written before the build so the adapter copies them like any other
	 * static file, and refreshed in development so links resolve there too.
	 */
	seo?: DocsSeoOptions;
	/** Raw Markdown module generation. Set `false` to omit `virtual:docs-kit/raw`. */
	raw?: false;
	/**
	 * API specifications compiled into documentation pages.
	 *
	 * Each specification is rendered to Markdown in `openapiOutDir` and mounted as an
	 * additional content root, so its pages are ordinary manifest pages: they appear in
	 * navigation, search, the sitemap, Open Graph cards, and the AI outputs with no further
	 * configuration.
	 */
	openapi?: readonly DocsApiOptions[];
	/** Where generated API Markdown is written. Defaults to `.docs-kit/generated/openapi`. */
	openapiOutDir?: string;
}

export interface DocsApiOptions extends DocsApiSourceConfig {
	/** Collection the generated pages belong to. Defaults to `default`. */
	collection?: string;
}

export interface DocsSeoOptions {
	/** Absolute site origin. Required for a sitemap, which must contain absolute URLs. */
	siteUrl: string;
	siteName?: string;
	/** Static directory, relative to the Vite root. Defaults to `static`. */
	staticDir?: string;
	/** Sitemap generation, or `false` to skip it. */
	sitemap?: false | Omit<CreateDocsSitemapOptions, 'url'>;
	/** `robots.txt` generation, or `false` to skip it. */
	robots?: false | Omit<CreateDocsRobotsOptions, 'url'>;
	/** Open Graph card generation, or `false` to skip it. */
	openGraph?:
		| false
		| Omit<GenerateDocsOgCardsOptions, 'pages' | 'outDir' | 'cwd' | 'siteName'> & {
				outDir?: string;
		  };
}

interface ResolvedContentSource {
	root: string;
	collection: string;
	version?: string;
	locale?: string;
	/** Per-file dimensions recovered from a synced source cache index. */
	dimensions?: Map<string, { version?: string; locale?: string }>;
}

function normalizeBasePath(value: string): string {
	if (!value.startsWith('/') || value.includes('?') || value.includes('#')) {
		throw new Error(`@docs-kit/vite collection base path "${value}" must be an absolute pathname.`);
	}
	return `/${value.split('/').filter(Boolean).join('/')}`.replace(/\/$/, '') || '/';
}

function resolvePluginCollections(options: DocsPluginOptions): DocsCollectionRecord[] {
	if (options.collections !== undefined && (options.content !== undefined || options.basePath !== undefined)) {
		throw new Error('@docs-kit/vite accepts either legacy `content` + `basePath` or `collections`, not both.');
	}
	if (options.collections === undefined) {
		return [{ id: 'default', content: requireContent(options.content, 'the documentation plugin'), basePath: normalizeBasePath(options.basePath ?? '/') }];
	}
	if (options.collections.length === 0) {
		throw new Error('@docs-kit/vite requires at least one collection.');
	}
	const ids = new Set<string>();
	const paths = new Set<string>();
	const collections = options.collections.map((collection) => {
		if (!/^[a-z][a-z0-9-]*$/.test(collection.id)) {
			throw new Error(`@docs-kit/vite collection id "${collection.id}" is invalid.`);
		}
		if (ids.has(collection.id)) {
			throw new Error(`@docs-kit/vite found duplicate collection id "${collection.id}".`);
		}
		ids.add(collection.id);
		const basePath = normalizeBasePath(collection.basePath);
		if (paths.has(basePath.toLowerCase())) {
			throw new Error(`@docs-kit/vite found duplicate collection base path "${basePath}".`);
		}
		paths.add(basePath.toLowerCase());
		return { id: collection.id, content: requireContent(collection.content, `collection "${collection.id}"`), basePath };
	});
	for (const left of collections) {
		for (const right of collections) {
			const leftPath = left.basePath.toLowerCase();
			const rightPath = right.basePath.toLowerCase();
			if (left.id !== right.id && (leftPath === '/' || rightPath.startsWith(`${leftPath}/`))) {
				throw new Error(`@docs-kit/vite collection base paths "${left.basePath}" and "${right.basePath}" overlap.`);
			}
		}
	}
	return collections.sort((left, right) => left.id.localeCompare(right.id));
}

interface GeneratedManifestModule {
	content: DiscoveredContent[];
	sections: DiscoveredSection[];
	manifest: DocsManifest;
	code: string;
	searchCode: string;
	rawCode: string;
}

export interface DocsRouteConflict {
	collection: string;
	basePath: string;
	route: string;
	file: string;
	/** Dynamic routes are flagged as potential overlap rather than assumed safe. */
	dynamic: boolean;
}

function routePathFromSegments(segments: readonly string[]): { pathname: string; dynamic: boolean; catchAll: boolean; suffixedRest: boolean } {
	const visible = segments.filter((segment) => !/^\(.+\)$/.test(segment));
	const dynamicIndex = visible.findIndex((segment) => segment.startsWith('['));
	const staticSegments = (dynamicIndex === -1 ? visible : visible.slice(0, dynamicIndex)).filter(Boolean);
	return {
		pathname: `/${staticSegments.join('/')}` || '/',
		dynamic: dynamicIndex !== -1,
		catchAll: dynamicIndex !== -1 && visible[dynamicIndex] === '[...slug]' && dynamicIndex === visible.length - 1,
		suffixedRest: dynamicIndex !== -1 && /^\[\.\.\.[^\]]+\]\./.test(visible[dynamicIndex] ?? '')
	};
}

/**
 * Finds physical SvelteKit endpoints that can overlap a docs collection mount.
 * Route groups are ignored; dynamic segments are reported conservatively. The intended
 * `[...slug]` mounted exactly at a collection base path is excluded.
 */
export function findDocsRouteConflicts(
	routesRoot: string,
	collections: readonly DocsCollectionRecord[]
): DocsRouteConflict[] {
	const conflicts: DocsRouteConflict[] = [];
	const visit = (directory: string, segments: string[]): void => {
		let entries;
		try {
			entries = readdirSync(directory, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
			const file = resolve(directory, entry.name);
			if (entry.isDirectory()) {
				visit(file, [...segments, entry.name]);
				continue;
			}
			if (!entry.isFile() || !/^\+(?:page|server)\.(?:svelte|[cm]?[jt]s)$/.test(entry.name)) {
				continue;
			}
			const route = routePathFromSegments(segments);
			for (const collection of collections) {
				const routeKey = route.pathname.toLowerCase();
				const basePathKey = collection.basePath.toLowerCase();
				const overlaps =
					routeKey === basePathKey ||
					routeKey.startsWith(`${basePathKey}/`) ||
					(route.dynamic && (routeKey === '/' || basePathKey.startsWith(`${routeKey}/`)));
				const intendedCatchAll = (route.catchAll || route.suffixedRest) && route.pathname === collection.basePath;
				if (overlaps && !intendedCatchAll) {
					conflicts.push({
						collection: collection.id,
						basePath: collection.basePath,
						route: route.pathname,
						file,
						dynamic: route.dynamic
					});
				}
			}
		}
	};
	visit(routesRoot, []);
	return conflicts.sort((left, right) =>
		left.collection.localeCompare(right.collection) || left.file.localeCompare(right.file)
	);
}

function resolveRelativeDirectory(
	value: string,
	config: ResolvedConfig,
	label: string
): string {
	if (isAbsolute(value)) {
		if (label === 'content') {
			throw new Error('@docs-kit/vite expects `content` to be relative to the Vite root.');
		}
		throw new Error(`@docs-kit/vite expects ${label} to be relative to the Vite root.`);
	}

	return resolve(config.root, value);
}

function requireContent(value: string | undefined, label: string): string {
	if (!value || value.trim() === '') {
		throw new Error(`@docs-kit/vite requires a content directory for ${label}.`);
	}
	return value;
}

function createConfiguredSources(
	options: DocsPluginOptions,
	config: ResolvedConfig,
	collections: readonly DocsCollectionRecord[]
): ResolvedContentSource[] {
	if (options.collections !== undefined && (options.versions !== undefined || options.i18n !== undefined)) {
		throw new Error('@docs-kit/vite does not yet support versions or locales with multiple collections; keep dimensions global in a legacy collection until collection-scoped source configuration is introduced.');
	}
	const versionModel = options.versions ? normalizeDocsVersions(options.versions) : undefined;
	const localeModel = options.i18n ? normalizeDocsLocales(options.i18n) : undefined;

	if (versionModel !== undefined) {
		return versionModel.versions.flatMap((version) => {
			const baseContent = requireContent(
				version.source ?? options.content,
				`version "${version.id}"`
			);
			const versionRoot = resolveRelativeDirectory(
				baseContent,
				config,
				`version "${version.id}" source`
			);

			if (localeModel === undefined) {
				return [{ root: versionRoot, collection: 'default', version: version.id }];
			}

			return localeModel.locales.map((locale) => ({
				root: resolveRelativeDirectory(
					locale.source ?? locale.id,
					{ ...config, root: versionRoot },
					`locale "${locale.id}" source`
				),
				version: version.id,
				collection: 'default',
				locale: locale.id
			}));
		});
	}

	if (options.collections !== undefined) {
		return collections.map((collection) => ({
			root: resolveRelativeDirectory(collection.content, config, `collection "${collection.id}" content`),
			collection: collection.id
		}));
	}
	const baseContent = requireContent(options.content, 'the documentation plugin');
	const contentRoot = resolveRelativeDirectory(baseContent, config, 'content');
	if (localeModel === undefined) {
		return [{ root: contentRoot, collection: 'default' }];
	}

	return localeModel.locales.map((locale) => ({
		root: resolveRelativeDirectory(
			locale.source ?? locale.id,
			{ ...config, root: contentRoot },
			`locale "${locale.id}" source`
		),
		locale: locale.id,
		collection: 'default'
	}));
}

/**
 * Mounts each synced source cache directory as an additional content root and recovers the
 * version and locale each cached document was produced for.
 */
function createSourceCacheSources(
	options: DocsPluginOptions,
	config: ResolvedConfig
): ResolvedContentSource[] {
	if (options.sourceCacheDir === undefined) {
		return [];
	}

	const cacheRoot = resolveRelativeDirectory(options.sourceCacheDir, config, 'sourceCacheDir');
	let index;
	let directories: string[];

	try {
		index = parseDocsSourceCacheIndex(
			JSON.parse(readFileSync(resolve(cacheRoot, 'index.json'), 'utf8'))
		);
		directories = readdirSync(cacheRoot, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name)
			.sort();
	} catch {
		// A cache that has not been synced yet simply contributes no content.
		return [];
	}

	return directories.map((sourceId) => {
		const state = index.sources.find((source) => source.sourceId === sourceId);
		const dimensions = new Map<string, { version?: string; locale?: string }>(
			(state?.entries ?? []).map((entry) => [
				entry.relativePath,
				{
					...(entry.version === undefined ? {} : { version: entry.version }),
					...(entry.locale === undefined ? {} : { locale: entry.locale })
				}
			])
		);

		return { root: resolve(cacheRoot, sourceId), collection: 'default', dimensions };
	});
}

async function writeStaticFile(path: string, data: string): Promise<void> {
	await mkdir(dirname(path), { recursive: true });
	const temporaryPath = `${path}.tmp`;
	await writeFile(temporaryPath, data, 'utf8');
	await rename(temporaryPath, path);
}

/**
 * Writes sitemap, robots, and Open Graph artifacts into the static directory.
 *
 * Open Graph cards are cached by content hash, so a rebuild rewrites only the pages whose
 * card inputs changed and deletes cards for pages that no longer exist.
 */
async function generateSeoArtifacts(
	options: DocsPluginOptions,
	manifest: DocsManifest,
	root: string
): Promise<void> {
	const seo = options.seo;
	if (seo === undefined) {
		return;
	}

	const staticDir = resolve(root, seo.staticDir ?? 'static');

	if (seo.sitemap !== false) {
		const currentVersion = manifest.versions.find((version) => version.current)?.id;
		const defaultLocale = manifest.locales.find((locale) => locale.default)?.id;

		await writeStaticFile(
			resolve(staticDir, 'sitemap.xml'),
			createDocsSitemap(manifest.pages, {
				...(seo.sitemap ?? {}),
				url: seo.siteUrl,
				...(currentVersion === undefined ? {} : { currentVersion }),
				...(defaultLocale === undefined ? {} : { defaultLocale })
			})
		);
	}

	if (seo.robots !== false) {
		await writeStaticFile(
			resolve(staticDir, 'robots.txt'),
			createDocsRobots({ ...(seo.robots ?? {}), url: seo.siteUrl })
		);
	}

	if (seo.openGraph !== false) {
		const { outDir = 'og', ...cardOptions } = seo.openGraph ?? {};
		await generateDocsOgCards({
			...cardOptions,
			pages: manifest.pages,
			outDir: resolve(staticDir, outDir),
			...(seo.siteName === undefined ? {} : { siteName: seo.siteName })
		});
	}
}

function isContentSource(file: string, contentRoot: string): boolean {
	const relativePath = relative(contentRoot, resolve(file));
	const isWithinRoot =
		relativePath !== '' &&
		relativePath !== '..' &&
		!relativePath.startsWith('../') &&
		!relativePath.startsWith('..\\') &&
		!isAbsolute(relativePath);

	return (
		isWithinRoot &&
		(contentExtensionFromPath(relativePath) !== undefined ||
			relativePath.endsWith(sectionMetaFileName))
	);
}

function findManifestPage(
	manifest: DocsManifest,
	entry: DiscoveredContent
): DocsManifestPage | undefined {
	return manifest.pages.find(
		(page) =>
			page.source.relativePath === entry.relativePath &&
			page.collection === (entry.collection ?? 'default') &&
			page.version === entry.version &&
			page.locale === entry.locale
	);
}

function createManifestModuleCode(
	manifest: DocsManifest,
	content: readonly DiscoveredContent[]
): string {
	const importers = content
		.map((entry) => {
			const page = findManifestPage(manifest, entry);
			if (!page) {
				throw new Error(
					`@docs-kit/vite could not match discovered content "${entry.relativePath}" to its manifest page.`
				);
			}

			return {
				key: getDocsManifestPageKey(page),
				sourcePath: entry.sourcePath
			};
		})
		.sort((left, right) => (left.key < right.key ? -1 : left.key > right.key ? 1 : 0));

	const seen = new Set<string>();
	for (const importer of importers) {
		if (seen.has(importer.key)) {
			throw new Error(
				`@docs-kit/vite generated duplicate page importer key "${importer.key}". Two content roots resolve to the same page; set a source conflict policy or move the content.`
			);
		}
		seen.add(importer.key);
	}

	const pageImporters = importers
		.map(
			(importer) =>
				`\t${JSON.stringify(importer.key)}: () => import(${JSON.stringify(importer.sourcePath)})`
		)
		.join(',\n');

	return `export const manifest = ${JSON.stringify(manifest, null, '\t')};\n\nexport const pageImporters = {\n${pageImporters}\n};\n`;
}

function invalidateContentModules(server: ViteDevServer, file: string): void {
	for (const module of server.moduleGraph.getModulesByFile(file) ?? []) {
		server.moduleGraph.invalidateModule(module);
	}
}

function invalidateManifestModule(server: ViteDevServer): void {
	for (const id of [resolvedVirtualManifestId, resolvedVirtualSearchId, resolvedVirtualRawId]) {
		const virtualModule = server.moduleGraph.getModuleById(id);
		if (virtualModule) {
			server.moduleGraph.invalidateModule(virtualModule);
		}
	}
}

/**
 * Generates a typed manifest and explicit lazy compiled-content importers for Vite.
 * Source paths are used only as Vite import specifiers; the exported manifest is client-safe.
 */
export function docs(options: DocsPluginOptions): Plugin {
	let config: ResolvedConfig | undefined;
	let collections: DocsCollectionRecord[] | undefined;
	let configuredSources: ResolvedContentSource[] | undefined;
	let generated: GeneratedManifestModule | undefined;
	const configuredServers = new WeakSet<ViteDevServer>();

	const routingOptions = (): DocsRoutingOptions => ({
		...(options.basePath === undefined ? {} : { basePath: options.basePath }),
		...(options.versionPrefix === undefined ? {} : { versionPrefix: options.versionPrefix }),
		...(options.localePrefix === undefined ? {} : { localePrefix: options.localePrefix }),
		...(options.versions === undefined ? {} : { versions: options.versions }),
		...(options.i18n === undefined ? {} : { locales: options.i18n })
	});

	/**
	 * Compiles API specifications and returns their generated directories as content roots.
	 *
	 * Errors fail the build rather than producing a documentation set that silently omits an
	 * API; warnings are logged and generation continues.
	 */
	const generateApiSources = async (): Promise<ResolvedContentSource[]> => {
		const resolvedConfig = config;
		if (!resolvedConfig || options.openapi === undefined || options.openapi.length === 0) {
			return [];
		}

		const outDir = options.openapiOutDir ?? '.docs-kit/generated/openapi';
		const result = await generateApiDocs({
			cwd: resolvedConfig.root,
			outDir,
			sources: options.openapi.map(({ collection, ...source }) => ({
				...source,
				// Generated pages link to one another, so they need the mount point of the
				// collection they belong to.
				basePath:
					source.basePath ??
					collections?.find((entry) => entry.id === (collection ?? 'default'))?.basePath ??
					'/'
			}))
		});

		const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
		for (const diagnostic of result.diagnostics) {
			if (diagnostic.severity !== 'error') {
				resolvedConfig.logger.warn(
					`@docs-kit/vite [${diagnostic.sourceId}] ${diagnostic.code}: ${diagnostic.message}`
				);
			}
		}

		if (errors.length > 0) {
			throw new Error(
				`@docs-kit/vite could not compile ${errors.length} API specification(s):\n${errors
					.map((diagnostic) => `  [${diagnostic.sourceId}] ${diagnostic.code}: ${diagnostic.message}`)
					.join('\n')}`
			);
		}

		return options.openapi.map((source) => ({
			root: resolve(resolvedConfig.root, outDir),
			collection: source.collection ?? 'default'
		}));
	};

	const regenerateManifest = async (): Promise<GeneratedManifestModule> => {
		if (!config || !configuredSources || !collections) {
			throw new Error('@docs-kit/vite was not given a resolved Vite configuration.');
		}

		const apiSources = await generateApiSources();
		const allSources = [
			...configuredSources,
			// Several specifications share one generated root, so it is mounted once.
			...apiSources.filter(
				(source, index, all) =>
					all.findIndex((entry) => entry.root === source.root && entry.collection === source.collection) === index
			)
		];

		const content = (await Promise.all(
			allSources.map(async (source) => {
				const discovered = await discoverLocalContent({
					root: source.root,
					readSources: true,
					collection: source.collection,
					...(source.version === undefined ? {} : { version: source.version }),
					...(source.locale === undefined ? {} : { locale: source.locale })
				});

				if (source.dimensions === undefined) {
					return discovered;
				}

				return discovered.map((entry) => ({
					...entry,
					collection: source.collection,
					...(source.dimensions?.get(entry.relativePath) ?? {})
				}));
			})
		)).flat();
		const sections = (await Promise.all(
			configuredSources.map((source) =>
				discoverLocalSections({
					root: source.root,
					collection: source.collection,
					...(source.version === undefined ? {} : { version: source.version }),
					...(source.locale === undefined ? {} : { locale: source.locale })
				})
			)
		)).flat();
		const manifest = createDocsManifest(content, {
			collections,
			sections,
			...(options.includeHidden === undefined ? {} : { includeHidden: options.includeHidden }),
			...(options.links === undefined ? {} : { links: options.links }),
			...(options.navigation === undefined ? {} : { navigation: options.navigation }),
			configHash: hashDocsManifestConfig({
				content: options.content,
				collections: options.collections,
				versions: options.versions,
				i18n: options.i18n,
				basePath: options.basePath,
				versionPrefix: options.versionPrefix,
				localePrefix: options.localePrefix,
				sourceCacheDir: options.sourceCacheDir,
				openapi: options.openapi,
				openapiOutDir: options.openapiOutDir,
				seo: options.seo,
				includeHidden: options.includeHidden,
				links: options.links,
				navigation: options.navigation,
				search: options.search
			}),
			...(options.versions === undefined ? {} : { versions: options.versions }),
			...(options.i18n === undefined ? {} : { locales: options.i18n }),
			routing: routingOptions()
		});
		const searchRecords =
			options.search === false
				? []
				: createDocsSearchRecords(manifest.pages, {
						sources: new Map(
							content.map((entry) => [
								manifest.pages.find(
									(page) =>
										page.source.relativePath === entry.relativePath &&
										page.collection === (entry.collection ?? 'default') &&
										page.version === entry.version &&
										page.locale === entry.locale
								)?.id ?? entry.relativePath,
								entry.raw ?? ''
							])
						),
						...(options.search === undefined ? {} : options.search)
					});

		generated = {
			content,
			sections,
			manifest,
			code: createManifestModuleCode(manifest, content),
			searchCode: `export const searchRecords = ${JSON.stringify(searchRecords, null, '\t')};\n`,
			rawCode:
				options.raw === false
					? 'export const rawSources = {};\n'
					: `export const rawSources = ${JSON.stringify(
							Object.fromEntries(
								manifest.pages.map((page) => [
									page.id,
									content.find(
										(entry) =>
											entry.relativePath === page.source.relativePath &&
											(entry.collection ?? 'default') === page.collection &&
											entry.version === page.version &&
											entry.locale === page.locale
									)?.raw ?? ''
								])
							),
							null,
							'\t'
						)};\n`
		};
		return generated;
	};

	return {
		name: '@docs-kit/vite',
		enforce: 'pre',
		config(userConfig) {
			// Generated content lives outside the source tree, and SvelteKit narrows Vite's
			// file-serving allowlist, so these directories are declared here or the dev server
			// refuses to load their modules.
			const root = userConfig.root ?? process.cwd();
			const generated = [
				options.openapi === undefined
					? undefined
					: (options.openapiOutDir ?? '.docs-kit/generated/openapi'),
				options.sourceCacheDir
			]
				.filter((directory): directory is string => directory !== undefined)
				.map((directory) => resolve(root, directory));

			return generated.length === 0 ? undefined : { server: { fs: { allow: generated } } };
		},
		configResolved(resolvedConfig) {
			config = resolvedConfig;
			collections = resolvePluginCollections(options);
			configuredSources = [
				...createConfiguredSources(options, resolvedConfig, collections),
				...createSourceCacheSources(options, resolvedConfig)
			];
		},
		resolveId(id) {
			if (id === virtualManifestId) {
				return resolvedVirtualManifestId;
			}
			if (id === virtualSearchId) {
				return resolvedVirtualSearchId;
			}
			return id === virtualRawId ? resolvedVirtualRawId : undefined;
		},
		async load(id) {
			if (
				id !== resolvedVirtualManifestId &&
				id !== resolvedVirtualSearchId &&
				id !== resolvedVirtualRawId
			) {
				return undefined;
			}

			const module = generated ?? (await regenerateManifest());
			if (id === resolvedVirtualSearchId) {
				return module.searchCode;
			}
			return id === resolvedVirtualRawId ? module.rawCode : module.code;
		},
		async buildStart() {
			if (!configuredSources) {
				throw new Error('@docs-kit/vite was not given a resolved Vite configuration.');
			}
			if (config && collections) {
				const conflicts = findDocsRouteConflicts(resolve(config.root, 'src/routes'), collections);
				if (conflicts.length > 0) {
					throw new Error(
						`@docs-kit/vite route conflicts detected:\n${conflicts
							.map((conflict) => `- ${conflict.collection} (${conflict.basePath}) overlaps ${conflict.route} at ${conflict.file}${conflict.dynamic ? ' (dynamic route)' : ''}`)
							.join('\n')}`
					);
				}
			}

			for (const source of configuredSources) {
				this.addWatchFile(source.root);
			}
			const nextGenerated = await regenerateManifest();
			for (const entry of nextGenerated.content) {
				this.addWatchFile(entry.sourcePath);
			}

			if (config) {
				await generateSeoArtifacts(options, nextGenerated.manifest, config.root);
			}
		},
		configureServer(server) {
			if (!configuredSources) {
				throw new Error('@docs-kit/vite was not given a resolved Vite configuration.');
			}
			if (configuredServers.has(server)) {
				return;
			}
			configuredServers.add(server);

			const contentRoots = configuredSources.map((source) => source.root);
			for (const contentRoot of contentRoots) {
				server.watcher.add(contentRoot);
			}

			const onContentEvent = (file: string) => {
				if (!contentRoots.some((root) => isContentSource(file, root))) {
					return;
				}

				void regenerateManifest()
					.then(() => {
						invalidateContentModules(server, file);
						invalidateManifestModule(server);
						server.ws.send({ type: 'full-reload', path: '*' });
					})
					.catch((error: unknown) => {
						const message = error instanceof Error ? error.message : String(error);
						const logger = (server as { config?: { logger?: { error: (message: string) => void } } })
							.config?.logger;
						logger?.error(`@docs-kit/vite could not refresh its manifest: ${message}`);
					});
			};

			server.watcher.on('add', onContentEvent);
			server.watcher.on('change', onContentEvent);
			server.watcher.on('unlink', onContentEvent);

			const cleanup = () => {
				server.watcher.off('add', onContentEvent);
				server.watcher.off('change', onContentEvent);
				server.watcher.off('unlink', onContentEvent);
				configuredServers.delete(server);
			};

			server.httpServer?.once('close', cleanup);
		}
	};
}
