import type { DocsI18nConfig } from '@docs-kit/core/i18n';
import type { DocsLocalePrefixPolicy, DocsVersionPrefixPolicy } from '@docs-kit/core/routing';
import type { DocsSourceConflictPolicy } from '@docs-kit/core/sources';
import type { DocsVersionsConfig } from '@docs-kit/core/versioning';

export interface DocsSiteConfig {
	title: string;
	description?: string;
	/** Absolute site origin used for canonical URLs and generated absolute links. */
	url?: string;
	repository?: string;
	language?: string;
}

export interface DocsContentConfig {
	/** Local content directory relative to the project root. */
	directory: string;
}

export interface DocsRoutingConfig {
	basePath?: string;
	versionPrefix?: DocsVersionPrefixPolicy;
	localePrefix?: DocsLocalePrefixPolicy;
}

/** A separately mounted documentation tree. Collection dimensions remain global for now. */
export interface DocsCollectionConfig {
	/** Stable collection identity used by manifests, navigation, and importer keys. */
	id: string;
	/** Local content directory relative to the project root. */
	content: string;
	/** Absolute URL mount point for this collection. */
	basePath: string;
}

/** Runtime routing authority emitted into the manifest. */
export interface DocsCollectionRecord {
	id: string;
	content: string;
	basePath: string;
}

/** A serializable description of a content source, resolved to an adapter by the host. */
export interface DocsSourceConfig {
	id: string;
	type: string;
	priority?: number;
	namespace?: string;
	[option: string]: unknown;
}

export interface DocsSourcesConfig {
	/** How duplicate slugs across sources are handled. Defaults to `error`. */
	onConflict?: DocsSourceConflictPolicy;
	/** Cache directory relative to the project root. */
	cacheDir?: string;
	entries?: readonly DocsSourceConfig[];
}

export interface DocsConfig {
	site: DocsSiteConfig;
	content?: DocsContentConfig;
	/** Multi-collection replacement for legacy `content` plus `routing.basePath`. */
	collections?: readonly DocsCollectionConfig[];
	routing?: DocsRoutingConfig;
	versions?: DocsVersionsConfig;
	i18n?: DocsI18nConfig;
	sources?: DocsSourcesConfig;
	/** Directory for generated artifacts, relative to the project root. */
	outDir?: string;
}

export interface DocsResolvedConfig {
	site: Required<Pick<DocsSiteConfig, 'title'>> & DocsSiteConfig;
	content: DocsContentConfig;
	collections: DocsCollectionRecord[];
	routing: Required<DocsRoutingConfig>;
	versions?: DocsVersionsConfig;
	i18n?: DocsI18nConfig;
	sources: Required<Pick<DocsSourcesConfig, 'onConflict' | 'cacheDir'>> & {
		entries: DocsSourceConfig[];
	};
	outDir: string;
}

/** The default generated-artifact directory. */
export const defaultDocsOutDir = '.docs-kit';

/** Identity helper that gives configuration files editor types without a runtime cost. */
export function defineDocsConfig(config: DocsConfig): DocsConfig {
	return config;
}

function requireString(value: unknown, field: string): string {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`Docs configuration field "${field}" must be a non-empty string.`);
	}
	return value.trim();
}

const knownKeys = new Set([
	'site',
	'content',
	'collections',
	'routing',
	'versions',
	'i18n',
	'sources',
	'outDir'
]);

const collectionIdPattern = /^[a-z][a-z0-9-]*$/;
const sourceTypes = new Set(['local', 'remote-markdown', 'github', 'github-releases', 'notion', 'sanity']);
const commonSourceKeys = new Set(['id', 'type', 'priority', 'namespace', 'version', 'locale']);
const sourceTypeKeys: Record<string, readonly string[]> = {
	local: ['root', 'includeHiddenDirectories'],
	'remote-markdown': ['documents', 'timeoutMs', 'maxBytes', 'headers', 'allowInsecureHttp'],
	github: ['repository', 'ref', 'directory', 'token', 'tokenEnv', 'apiUrl', 'rawUrl', 'timeoutMs', 'maxBytes', 'headers', 'allowInsecureHttp'],
	'github-releases': ['repository', 'directory', 'token', 'tokenEnv', 'apiUrl', 'limit', 'includeUnpublished', 'index', 'timeoutMs', 'maxBytes', 'headers', 'allowInsecureHttp'],
	notion: ['databaseId', 'pageIds', 'token', 'tokenEnv', 'notionVersion', 'apiUrl', 'directory', 'slugProperty', 'titleProperty', 'timeoutMs', 'maxBytes', 'headers', 'allowInsecureHttp'],
	sanity: ['projectId', 'dataset', 'query', 'apiVersion', 'token', 'tokenEnv', 'useCdn', 'slugField', 'titleField', 'bodyField', 'directory', 'timeoutMs', 'maxBytes', 'headers', 'allowInsecureHttp']
};

function record(value: unknown, field: string): Record<string, unknown> {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error(`Docs configuration field "${field}" must be an object.`);
	}
	return value as Record<string, unknown>;
}

function rejectUnknownKeys(value: Record<string, unknown>, field: string, allowed: readonly string[]): void {
	const unknown = Object.keys(value).filter((key) => !allowed.includes(key)).sort();
	if (unknown.length > 0) {
		throw new Error(`Unknown docs configuration field(s) in "${field}": ${unknown.join(', ')}.`);
	}
}

function optionalString(value: unknown, field: string): void {
	if (value !== undefined) {
		requireString(value, field);
	}
}

function optionalBoolean(value: unknown, field: string): void {
	if (value !== undefined && typeof value !== 'boolean') {
		throw new Error(`Docs configuration field "${field}" must be a boolean.`);
	}
}

function optionalFiniteNumber(value: unknown, field: string): void {
	if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value))) {
		throw new Error(`Docs configuration field "${field}" must be a finite number.`);
	}
}

function validateSite(value: unknown): void {
	const site = record(value, 'site');
	rejectUnknownKeys(site, 'site', ['title', 'description', 'url', 'repository', 'language']);
	requireString(site['title'], 'site.title');
	for (const key of ['description', 'repository', 'language'] as const) optionalString(site[key], `site.${key}`);
	if (site['url'] !== undefined) {
		const url = requireString(site['url'], 'site.url');
		try {
			if (!new URL(url).protocol.match(/^https?:$/)) throw new Error();
		} catch {
			throw new Error('Docs configuration field "site.url" must be an absolute HTTP(S) URL.');
		}
	}
}

function validateRouting(value: unknown): void {
	if (value === undefined) return;
	const routing = record(value, 'routing');
	rejectUnknownKeys(routing, 'routing', ['basePath', 'versionPrefix', 'localePrefix']);
	if (routing['basePath'] !== undefined) normalizeBasePath(requireString(routing['basePath'], 'routing.basePath'), 'routing.basePath');
	if (routing['versionPrefix'] !== undefined && routing['versionPrefix'] !== 'always' && routing['versionPrefix'] !== 'except-current') {
		throw new Error('Docs configuration field "routing.versionPrefix" must be "always" or "except-current".');
	}
	if (routing['localePrefix'] !== undefined && routing['localePrefix'] !== 'always' && routing['localePrefix'] !== 'except-default') {
		throw new Error('Docs configuration field "routing.localePrefix" must be "always" or "except-default".');
	}
}

function validateDimensions(config: DocsConfig): void {
	if (config.versions !== undefined) {
		const versions = record(config.versions, 'versions');
		rejectUnknownKeys(versions, 'versions', ['current', 'versions', 'available']);
		requireString(versions['current'], 'versions.current');
		for (const key of ['versions', 'available'] as const) {
			if (versions[key] !== undefined && !Array.isArray(versions[key])) throw new Error(`Docs configuration field "versions.${key}" must be an array.`);
			for (const [index, input] of (versions[key] ?? []).entries()) {
				if (typeof input === 'string') { requireString(input, `versions.${key}[${index}]`); continue; }
				const entry = record(input, `versions.${key}[${index}]`);
				rejectUnknownKeys(entry, `versions.${key}[${index}]`, ['id', 'label', 'source']);
				requireString(entry['id'], `versions.${key}[${index}].id`);
				optionalString(entry['label'], `versions.${key}[${index}].label`);
				optionalString(entry['source'], `versions.${key}[${index}].source`);
			}
		}
	}
	if (config.i18n !== undefined) {
		const i18n = record(config.i18n, 'i18n');
		rejectUnknownKeys(i18n, 'i18n', ['defaultLocale', 'locales', 'omitDefaultLocale']);
		requireString(i18n['defaultLocale'], 'i18n.defaultLocale');
		if (!Array.isArray(i18n['locales'])) throw new Error('Docs configuration field "i18n.locales" must be an array.');
		optionalBoolean(i18n['omitDefaultLocale'], 'i18n.omitDefaultLocale');
		for (const [index, input] of i18n['locales'].entries()) {
			if (typeof input === 'string') { requireString(input, `i18n.locales[${index}]`); continue; }
			const locale = record(input, `i18n.locales[${index}]`);
			rejectUnknownKeys(locale, `i18n.locales[${index}]`, ['id', 'label', 'dir', 'source']);
			requireString(locale['id'], `i18n.locales[${index}].id`);
			optionalString(locale['label'], `i18n.locales[${index}].label`);
			optionalString(locale['source'], `i18n.locales[${index}].source`);
			if (locale['dir'] !== undefined && locale['dir'] !== 'ltr' && locale['dir'] !== 'rtl') throw new Error(`Docs configuration field "i18n.locales[${index}].dir" must be "ltr" or "rtl".`);
		}
	}
}

function validateSources(value: unknown): void {
	if (value === undefined) return;
	const sources = record(value, 'sources');
	rejectUnknownKeys(sources, 'sources', ['onConflict', 'cacheDir', 'entries']);
	if (sources['onConflict'] !== undefined && !['error', 'priority', 'namespace'].includes(String(sources['onConflict']))) throw new Error('Docs configuration field "sources.onConflict" must be "error", "priority", or "namespace".');
	optionalString(sources['cacheDir'], 'sources.cacheDir');
	if (sources['entries'] !== undefined && !Array.isArray(sources['entries'])) throw new Error('Docs configuration field "sources.entries" must be an array.');
	for (const [index, input] of (sources['entries'] ?? []).entries()) {
		const entry = record(input, `sources.entries[${index}]`);
		const type = requireString(entry['type'], `sources.entries[${index}].type`);
		if (!sourceTypes.has(type)) throw new Error(`Unknown docs source type "${type}" in "sources.entries[${index}]".`);
		rejectUnknownKeys(entry, `sources.entries[${index}]`, [...commonSourceKeys, ...(sourceTypeKeys[type] ?? [])]);
		requireString(entry['id'], `sources.entries[${index}].id`);
		for (const key of ['namespace', 'version', 'locale', 'root', 'repository', 'ref', 'directory', 'token', 'tokenEnv', 'apiUrl', 'rawUrl', 'databaseId', 'notionVersion', 'projectId', 'dataset', 'query', 'apiVersion', 'slugProperty', 'titleProperty', 'bodyField'] as const) optionalString(entry[key], `sources.entries[${index}].${key}`);
		optionalFiniteNumber(entry['priority'], `sources.entries[${index}].priority`);
		for (const key of ['timeoutMs', 'maxBytes', 'limit'] as const) optionalFiniteNumber(entry[key], `sources.entries[${index}].${key}`);
		for (const key of ['includeHiddenDirectories', 'allowInsecureHttp', 'includeUnpublished', 'index', 'useCdn'] as const) optionalBoolean(entry[key], `sources.entries[${index}].${key}`);
		if (entry['pageIds'] !== undefined && (!Array.isArray(entry['pageIds']) || entry['pageIds'].some((id) => typeof id !== 'string' || id.trim() === ''))) throw new Error(`Docs configuration field "sources.entries[${index}].pageIds" must be an array of non-empty strings.`);
		if (entry['headers'] !== undefined && (entry['headers'] === null || typeof entry['headers'] !== 'object' || Array.isArray(entry['headers']) || Object.values(entry['headers'] as Record<string, unknown>).some((header) => typeof header !== 'string'))) throw new Error(`Docs configuration field "sources.entries[${index}].headers" must be a string map.`);
		if (entry['documents'] !== undefined) {
			if (!Array.isArray(entry['documents'])) throw new Error(`Docs configuration field "sources.entries[${index}].documents" must be an array.`);
			for (const [documentIndex, document] of entry['documents'].entries()) {
				const item = record(document, `sources.entries[${index}].documents[${documentIndex}]`);
				rejectUnknownKeys(item, `sources.entries[${index}].documents[${documentIndex}]`, ['url', 'path', 'version', 'locale']);
				for (const key of ['url', 'path'] as const) requireString(item[key], `sources.entries[${index}].documents[${documentIndex}].${key}`);
				optionalString(item['version'], `sources.entries[${index}].documents[${documentIndex}].version`);
				optionalString(item['locale'], `sources.entries[${index}].documents[${documentIndex}].locale`);
			}
		}
		switch (type) {
			case 'local':
				requireString(entry['root'], `sources.entries[${index}].root`);
				break;
			case 'remote-markdown':
				if (!Array.isArray(entry['documents'])) {
					throw new Error(`Docs configuration field "sources.entries[${index}].documents" must be an array.`);
				}
				break;
			case 'github':
			case 'github-releases':
				requireString(entry['repository'], `sources.entries[${index}].repository`);
				break;
			case 'notion':
				if (typeof entry['token'] !== 'string' && typeof entry['tokenEnv'] !== 'string') {
					throw new Error(`Docs source "${entry['id']}" requires a "tokenEnv" or "token" option.`);
				}
				break;
			case 'sanity':
				requireString(entry['projectId'], `sources.entries[${index}].projectId`);
				requireString(entry['dataset'], `sources.entries[${index}].dataset`);
				break;
		}
	}
}

function validateNestedConfig(config: DocsConfig): void {
	validateSite(config.site);
	if (config.content !== undefined) {
		const content = record(config.content, 'content');
		rejectUnknownKeys(content, 'content', ['directory']);
		normalizeRelativeDirectory(requireString(content['directory'], 'content.directory'), 'content.directory');
	}
	validateRouting(config.routing);
	validateDimensions(config);
	validateSources(config.sources);
	if (config.outDir !== undefined) normalizeRelativeDirectory(config.outDir, 'outDir');
}

function normalizeBasePath(value: string, field: string): string {
	const trimmed = requireString(value, field);
	if (!trimmed.startsWith('/') || trimmed.includes('?') || trimmed.includes('#')) {
		throw new Error(`Docs configuration field "${field}" must be an absolute pathname.`);
	}
	const normalized = `/${trimmed.split('/').filter(Boolean).join('/')}`;
	return normalized === '/' ? '/' : normalized;
}

function normalizeRelativeDirectory(value: string, field: string): string {
	const normalized = requireString(value, field).replace(/\\/g, '/');
	if (normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized) || normalized.split('/').includes('..')) {
		throw new Error(`Docs configuration field "${field}" must be a relative directory inside the project.`);
	}
	return normalized.replace(/^\.\//, '').replace(/\/+$/, '');
}

function resolveCollections(config: DocsConfig): DocsCollectionRecord[] {
	const hasCollections = config.collections !== undefined;
	if (hasCollections && (config.content !== undefined || config.routing?.basePath !== undefined)) {
		throw new Error('Use either legacy `content` + `routing.basePath` or `collections`, not both.');
	}

	if (!hasCollections) {
		return [
			{
				id: 'default',
				content: normalizeRelativeDirectory(config.content?.directory ?? 'src/lib/docs', 'content.directory'),
				basePath: normalizeBasePath(config.routing?.basePath ?? '/docs', 'routing.basePath')
			}
		];
	}

	if (!Array.isArray(config.collections) || config.collections.length === 0) {
		throw new Error('Docs configuration field "collections" must contain at least one collection.');
	}

	const ids = new Set<string>();
	const paths = new Set<string>();
	const collections = config.collections.map((collection, index) => {
		const entry = record(collection, `collections[${index}]`);
		rejectUnknownKeys(entry, `collections[${index}]`, ['id', 'content', 'basePath']);
		const id = requireString(entry['id'], `collections[${index}].id`);
		if (!collectionIdPattern.test(id)) {
			throw new Error(`Docs collection id "${id}" must match ${collectionIdPattern}.`);
		}
		if (ids.has(id)) {
			throw new Error(`Duplicate docs collection id "${id}".`);
		}
		ids.add(id);
		const basePath = normalizeBasePath(requireString(entry['basePath'], `collections[${index}].basePath`), `collections[${index}].basePath`);
		if (paths.has(basePath.toLowerCase())) {
			throw new Error(`Duplicate docs collection base path "${basePath}".`);
		}
		paths.add(basePath.toLowerCase());
		return {
			id,
			content: normalizeRelativeDirectory(requireString(entry['content'], `collections[${index}].content`), `collections[${index}].content`),
			basePath
		};
	});

	for (const left of collections) {
		for (const right of collections) {
			const leftPath = left.basePath.toLowerCase();
			const rightPath = right.basePath.toLowerCase();
			if (left.id !== right.id && (rightPath.startsWith(`${leftPath}/`) || leftPath === '/')) {
				throw new Error(`Overlapping docs collection base paths "${left.basePath}" and "${right.basePath}".`);
			}
		}
	}

	return collections.sort((left, right) => left.id.localeCompare(right.id));
}

/** Applies defaults and rejects unknown or malformed configuration instead of ignoring it. */
export function resolveDocsConfig(config: DocsConfig): DocsResolvedConfig {
	if (config === null || typeof config !== 'object' || Array.isArray(config)) {
		throw new Error('Docs configuration must be an object.');
	}

	const unknown = Object.keys(config).filter((key) => !knownKeys.has(key));
	if (unknown.length > 0) {
		throw new Error(`Unknown docs configuration field(s): ${unknown.sort().join(', ')}.`);
	}
	validateNestedConfig(config);

	const outDir = config.outDir?.trim() || defaultDocsOutDir;
	const collections = resolveCollections(config);
	const entries = config.sources?.entries ?? [];
	const seen = new Set<string>();

	for (const entry of entries) {
		const id = requireString(entry.id, 'sources.entries[].id');
		requireString(entry.type, `sources.entries[${id}].type`);
		if (seen.has(id)) {
			throw new Error(`Duplicate docs source id "${id}".`);
		}
		seen.add(id);
	}

	return {
		site: { ...config.site, title: requireString(config.site?.title, 'site.title') },
		// Keep this field for legacy consumers; collections[0] is the resolved routing authority.
		content: { directory: collections[0]?.content ?? 'src/lib/docs' },
		collections,
		routing: {
			basePath: collections[0]?.basePath ?? '/docs',
			versionPrefix: config.routing?.versionPrefix ?? 'except-current',
			localePrefix: config.routing?.localePrefix ?? 'except-default'
		},
		...(config.versions === undefined ? {} : { versions: config.versions }),
		...(config.i18n === undefined ? {} : { i18n: config.i18n }),
		sources: {
			onConflict: config.sources?.onConflict ?? 'error',
			cacheDir: config.sources?.cacheDir?.trim() || `${outDir}/cache/sources`,
			entries: entries.map((entry) => ({ ...entry }))
		},
		outDir
	};
}
