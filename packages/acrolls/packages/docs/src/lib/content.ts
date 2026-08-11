import type { DocsNav, DocsNavNode, DocsNavSection } from './types.js';
import { normalizePath, slugify, stableId } from './nav-path.js';

export type DocsMetadata = Readonly<Record<string, unknown>>;

export type DocsContentLoader<TDocument> = () => Promise<TDocument>;

export type DocsFolderConfig = {
	title?: string;
	description?: string;
	badge?: string;
	/** Optional landing filename stem used when no host entry overrides it. */
	index?: string;
	order?: number;
	hidden?: boolean;
	defaultOpen?: boolean;
	id?: string;
};

export type DocsContentEntryConfig = {
	kind?: 'page' | 'group';
	parent?: string;
	href?: string;
	landing?: string;
	title?: string;
	description?: string;
	order?: number;
	hidden?: boolean;
	defaultOpen?: boolean;
	badge?: string;
};

export type DocsDocumentConfig = {
	title?: string;
	description?: string;
	order?: number;
	hidden?: boolean;
	id?: string;
	badge?: string;
};

export type DocsContentConfig = {
	title: string;
	baseHref: string;
	/** Optional root landing filename stem used when no host entry overrides it. */
	index?: string;
	subtitle?: string;
	storageKey?: string;
	section?: {
		id?: string;
		title?: string;
		defaultOpen?: boolean;
		order?: number;
	};
	folders?: Record<string, DocsFolderConfig>;
	documents?: Record<string, DocsDocumentConfig>;
	/** Host-owned information architecture overrides and virtual groups. */
	entries?: Record<string, DocsContentEntryConfig>;
};

export type DocsContentInput<TDocument> = {
	key: string;
	metadata?: DocsMetadata;
	load: DocsContentLoader<TDocument>;
};

export type DocsContentDocument<TDocument> = {
	key: string;
	slug: string;
	href: string;
	title: string;
	description?: string;
	metadata: DocsMetadata;
	hidden: boolean;
	order?: number;
	loader: DocsContentLoader<TDocument>;
};

export type DocsContentSource<TDocument> = {
	nav: DocsNav;
	documents: readonly DocsContentDocument<TDocument>[];
	get(value: string): DocsContentDocument<TDocument> | undefined;
	load(value: string): Promise<TDocument> | undefined;
	entries(): string[];
};

export class DocsContentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DocsContentError';
	}
}

/** Type-safe authoring helper for host-owned docs configuration. */
export function defineDocsConfig<const T extends DocsContentConfig>(config: T): T {
	return config;
}

type SourceRecord<TDocument> = DocsContentDocument<TDocument> & {
	isIndex: boolean;
	folderPath: string;
	routeSegments: string[];
};

type ResolvedGroup<TDocument> = {
	key: string;
	name: string;
	path: string;
	parent: string;
	config?: DocsContentEntryConfig;
	folderConfig?: DocsFolderConfig;
	landing?: SourceRecord<TDocument>;
	children: Array<ResolvedGroup<TDocument> | SourceRecord<TDocument>>;
};

type FolderRecord<TDocument> = {
	name: string;
	path: string;
	children: Map<string, FolderRecord<TDocument>>;
	documents: SourceRecord<TDocument>[];
};

type NavCandidate = {
	node: DocsNavNode;
	order?: number;
	path: string;
	title: string;
};

type DefinedNavCandidate = NavCandidate & { node: DocsNavNode };

const ACRONYMS = new Set(['api', 'cli', 'css', 'faq', 'html', 'http', 'id', 'md', 'sdk', 'ui', 'url', 'yaml']);

export function createDocsContentSource<TDocument>(options: {
	config: DocsContentConfig;
	documents: readonly DocsContentInput<TDocument>[];
}): DocsContentSource<TDocument> {
	const baseHref = absolutePath(options.config.baseHref);
	const config = normalizeConfig(options.config);
	const routeOverrides = resolveRouteOverrides(options.documents, baseHref, config);
	const landingEntryConfigs = resolveLandingEntryConfigs(config);
	const records = options.documents.map((input) =>
		toSourceRecord(
			input,
			baseHref,
			config,
			routeOverrides.get(normalizeSourceKey(input.key)),
			landingEntryConfigs.get(normalizeSourceKey(input.key).replace(/\.md$/, ''))
		)
	);
	const routeMap = new Map<string, SourceRecord<TDocument>>();

	for (const record of records) {
		const previous = routeMap.get(record.slug);
		if (previous) {
			throw new DocsContentError(
				`Duplicate docs route "${record.href}" from "${previous.key}" and "${record.key}".`
			);
		}
		routeMap.set(record.slug, record);
	}

	const root = createFolder('', '');
	for (const record of records) insertRecord(root, record);

	const hasDefinition = Object.keys(config.entries ?? {}).length > 0 ||
		Boolean(config.index) ||
	Object.values(config.folders ?? {}).some((folder) => Boolean(folder.index));
	const nav = hasDefinition
		? buildDefinedNav(records, config, baseHref)
		: buildNav(root, records, config, baseHref);
	const documents = [...records].sort(compareDocuments);
	const aliases = new Map<string, SourceRecord<TDocument>>();
	for (const document of documents) {
		aliases.set(document.key, document);
		aliases.set(document.key.slice(0, -3), document);
		aliases.set(document.slug, document);
		aliases.set(normalizePath(document.href), document);
	}
	const get = (value: string): DocsContentDocument<TDocument> | undefined => {
		const normalized = normalizeLookup(value, baseHref);
		return aliases.get(normalized) ?? aliases.get(value);
	};

	return {
		nav,
		documents,
		get,
		load(value) {
			return get(value)?.loader();
		},
		entries() {
			return documents.map((document) => document.href);
		}
	};
}

function normalizeConfig(config: DocsContentConfig): DocsContentConfig {
	return {
		...config,
		folders: Object.fromEntries(
			Object.entries(config.folders ?? {}).map(([key, value]) => [normalizeConfigPath(key), value])
		),
		documents: Object.fromEntries(
			Object.entries(config.documents ?? {}).map(([key, value]) => [normalizeConfigPath(key), value])
		),
		entries: Object.fromEntries(
			Object.entries(config.entries ?? {}).map(([key, value]) => [normalizeEntryKey(key), value])
		)
	};
}

function resolveRouteOverrides<TDocument>(
	inputs: readonly DocsContentInput<TDocument>[],
	baseHref: string,
	config: DocsContentConfig
): Map<string, string> {
	const sourceKeys = new Set(inputs.map((input) => normalizeSourceKey(input.key).replace(/\.md$/, '')));
	const overrides = new Map<string, string>();

	for (const [key, entry] of Object.entries(config.entries ?? {})) {
		const sourceKey = sourceKeys.has(key) ? key : undefined;
		if (entry.kind === 'page' && !sourceKey) {
			throw new DocsContentError(`Docs page entry "${key}" references a missing source.`);
		}
		if (entry.kind === 'page' && entry.landing) {
			throw new DocsContentError(`Docs page entry "${key}" cannot define a group landing source.`);
		}
		const isGroup = entry.kind === 'group' || !sourceKey;

		if (entry.href && sourceKey) {
			setRouteOverride(overrides, sourceKey, entry.href, baseHref, key);
		}

		if (!isGroup || !entry.landing) continue;
		const landingKey = normalizeEntryKey(entry.landing);
		if (!sourceKeys.has(landingKey)) {
			throw new DocsContentError(`Docs entry "${key}" references missing landing source "${entry.landing}".`);
		}

		const groupHref = entry.href ?? joinBaseHref(baseHref, key);
		setRouteOverride(overrides, landingKey, groupHref, baseHref, key);
	}

	const folderLandingConfigs = [
		...(config.index ? [['', config.index] as const] : []),
		...Object.entries(config.folders ?? {}).flatMap(([folder, folderConfig]) =>
			folderConfig.index ? [[folder, folderConfig.index] as const] : []
		)
	];
	for (const [folder, index] of folderLandingConfigs) {
		const landingKey = normalizeEntryKey(folder ? `${folder}/${index}` : index);
		if (!sourceKeys.has(landingKey)) {
			throw new DocsContentError(`Configured landing source "${landingKey}.md" was not discovered.`);
		}
		if (!overrides.has(`${landingKey}.md`)) {
			setRouteOverride(overrides, landingKey, folder ? joinBaseHref(baseHref, folder) : baseHref, baseHref, folder || '<root>');
		}
	}

	return overrides;
}

function setRouteOverride(
	overrides: Map<string, string>,
	sourceKey: string,
	href: string,
	baseHref: string,
	entryKey: string
): void {
	const normalizedHref = absolutePath(href);
	routeSlug(normalizedHref, baseHref);
	const previous = overrides.get(`${sourceKey}.md`);
	if (previous && normalizePath(previous) !== normalizePath(normalizedHref)) {
		throw new DocsContentError(`Docs entry "${entryKey}" assigns source "${sourceKey}.md" multiple routes.`);
	}
	overrides.set(`${sourceKey}.md`, normalizedHref);
}

function toSourceRecord<TDocument>(
	input: DocsContentInput<TDocument>,
	baseHref: string,
	config: DocsContentConfig,
	routeOverride?: string,
	landingEntryConfig?: DocsContentEntryConfig
): SourceRecord<TDocument> {
	const key = normalizeSourceKey(input.key);
	if (!key.endsWith('.md')) {
		throw new DocsContentError(`Unsupported docs source "${input.key}". The first source supports .md files.`);
	}

	const withoutExtension = key.slice(0, -3);
	const rawSegments = withoutExtension.split('/').filter(Boolean);
	const isIndex = rawSegments.at(-1) === 'index';
	const routeSegments = (isIndex ? rawSegments.slice(0, -1) : rawSegments).map(routeSegment);
	const slug = routeOverride ? routeSlug(routeOverride, baseHref) : routeSegments.join('/');
	const folderSegments = isIndex ? routeSegments : routeSegments.slice(0, -1);
	const folderPath = folderSegments.join('/');
	const metadata = input.metadata ?? {};
	const documentConfig = config.documents?.[withoutExtension] ?? config.documents?.[slug];
	const entryConfig = config.entries?.[withoutExtension];
	const inheritedHidden = folderHidden(config, folderPath);
	const hidden = entryConfig?.hidden ?? documentConfig?.hidden ?? booleanMetadata(metadata, 'hidden') ?? inheritedHidden;
	const title = entryConfig?.title ?? landingEntryConfig?.title ?? documentConfig?.title ?? stringMetadata(metadata, 'title') ?? fallbackTitle(routeSegments, config.title);
	const description = entryConfig?.description ?? landingEntryConfig?.description ?? documentConfig?.description ?? stringMetadata(metadata, 'description') ?? stringMetadata(metadata, 'brief');
	const order = entryConfig?.order ?? documentConfig?.order ?? numberMetadata(metadata, 'order');

	return {
		key,
		slug,
		href: routeOverride ?? joinBaseHref(baseHref, slug),
		title,
		description,
		metadata,
		hidden,
		order,
		loader: input.load,
		isIndex,
		folderPath,
		routeSegments
	};
}

function resolveLandingEntryConfigs(config: DocsContentConfig): Map<string, DocsContentEntryConfig> {
	const landingConfigs = new Map<string, DocsContentEntryConfig>();
	for (const entry of Object.values(config.entries ?? {})) {
		if (entry.kind !== 'group' || !entry.landing) continue;
		landingConfigs.set(normalizeEntryKey(entry.landing), entry);
	}
	return landingConfigs;
}

function insertRecord<TDocument>(root: FolderRecord<TDocument>, record: SourceRecord<TDocument>): void {
	let folder = root;
	const folderSegments = record.isIndex ? record.routeSegments : record.routeSegments.slice(0, -1);
	for (const segment of folderSegments) {
		const path = folder.path ? `${folder.path}/${segment}` : segment;
		let child = folder.children.get(segment);
		if (!child) {
			child = createFolder(segment, path);
			folder.children.set(segment, child);
		}
		folder = child;
	}
	folder.documents.push(record);
}

function buildDefinedNav<TDocument>(
	records: readonly SourceRecord<TDocument>[],
	config: DocsContentConfig,
	baseHref: string
): DocsNav {
	const recordByKey = new Map(records.map((record) => [record.key.slice(0, -3), record]));
	const groups = new Map<string, ResolvedGroup<TDocument>>();
	const root = ensureDefinedGroup(groups, '', config);

	for (const record of records) {
		let path = record.folderPath;
		while (path) {
			ensureDefinedGroup(groups, path, config);
			path = path.slice(0, path.lastIndexOf('/'));
		}
	}

	for (const [key, entry] of Object.entries(config.entries ?? {})) {
		if (entry.kind === 'group' || (!recordByKey.has(key) && entry.kind !== 'page')) {
			ensureDefinedGroup(groups, key, config);
		}
	}

	for (const group of groups.values()) {
		group.parent = normalizeEntryKey(group.config?.parent ?? defaultGroupParent(group.key));
		if (group.key && !groups.has(group.parent)) {
			throw new DocsContentError(`Docs group "${group.key}" references unknown parent "${group.parent}".`);
		}
	}
	validateGroupParents(groups);

	const landingGroups = new Map<SourceRecord<TDocument>, ResolvedGroup<TDocument>>();
	for (const group of groups.values()) {
		if (group.key === '' && !group.config?.landing) continue;
		const configuredLanding = group.folderConfig?.index
			? normalizeEntryKey(group.key ? `${group.key}/${group.folderConfig.index}` : group.folderConfig.index)
			: undefined;
		const landingKey = group.config?.landing ??
			(group.config?.kind === 'group' && recordByKey.has(group.key) ? group.key : configuredLanding);
		const landing = landingKey
			? recordByKey.get(normalizeEntryKey(landingKey))
			: records.find((record) => record.isIndex && record.folderPath === group.key);
		if (!landing) {
			if (landingKey) {
				throw new DocsContentError(`Docs group "${group.key}" references missing landing source "${landingKey}".`);
			}
			continue;
		}
		const previous = landingGroups.get(landing);
		if (previous && previous !== group) {
			throw new DocsContentError(`Source "${landing.key}" is the landing page for both "${previous.key}" and "${group.key}".`);
		}
		landingGroups.set(landing, group);
		group.landing = landing;
	}

	for (const group of groups.values()) {
		if (group === root) continue;
		groups.get(group.parent)!.children.push(group);
	}

	for (const record of records) {
		const sourceKey = record.key.slice(0, -3);
		const entry = config.entries?.[sourceKey];
		if (entry?.kind === 'group' || landingGroups.has(record)) continue;
		const parent = normalizeEntryKey(entry?.parent ?? record.folderPath);
		const group = groups.get(parent);
		if (!group) {
			throw new DocsContentError(`Source "${record.key}" references unknown parent "${parent}".`);
		}
		group.children.push(record);
	}

	const sections: Array<DocsNavSection & { order?: number; path: string }> = [];
	const rootPages = definedChildrenNodes(
		root.children.filter((child): child is SourceRecord<TDocument> => isSourceRecord(child) && !child.hidden),
		config
	);
	if (rootPages.length > 0) {
		sections.push({
			id: config.section?.id ?? 'docs',
			title: config.section?.title ?? 'Docs',
			defaultOpen: config.section?.defaultOpen,
			items: rootPages,
			order: config.section?.order,
			path: ''
		});
	}

	for (const group of root.children.filter(isResolvedGroup)) {
		const node = definedGroupNode(group, config);
		if (!node && !visibleLanding(group)) continue;
		sections.push({
			id: `section-${stableId(group.key || group.name)}`,
			title: groupTitle(group),
			href: visibleLanding(group)?.href,
			slug: visibleLanding(group)?.slug,
			description: groupDescription(group),
			badge: groupBadge(group),
			defaultOpen: group.config?.defaultOpen ?? group.folderConfig?.defaultOpen ?? true,
			items: node?.children ?? [],
			order: groupOrder(group),
			path: group.key
		});
	}

	if (sections.length === 0) {
		sections.push({
			id: config.section?.id ?? 'docs',
			title: config.section?.title ?? 'Docs',
			defaultOpen: config.section?.defaultOpen,
			items: [],
			order: config.section?.order,
			path: ''
		});
	}

	sections.sort((a, b) => compareOptionalOrder(a.order, b.order) || a.path.localeCompare(b.path) || a.title.localeCompare(b.title));
	return {
		title: config.title,
		baseHref,
		subtitle: config.subtitle,
		storageKey: config.storageKey,
		sections: sections.map(({ order: _order, path: _path, ...section }) => section)
	};
}

function ensureDefinedGroup<TDocument>(
	groups: Map<string, ResolvedGroup<TDocument>>,
	key: string,
	config: DocsContentConfig
): ResolvedGroup<TDocument> {
	const existing = groups.get(key);
	if (existing) return existing;
	const entry = config.entries?.[key];
	const folderConfig = config.folders?.[key];
	const group: ResolvedGroup<TDocument> = {
		key,
		name: humanize(key.split('/').at(-1) ?? config.title),
		path: key,
		parent: '',
		config: entry,
		folderConfig,
		children: []
	};
	groups.set(key, group);
	return group;
}

function validateGroupParents<TDocument>(groups: Map<string, ResolvedGroup<TDocument>>): void {
	for (const group of groups.values()) {
		const seen = new Set<string>();
		let current: ResolvedGroup<TDocument> | undefined = group;
		while (current && current.key) {
			if (seen.has(current.key)) throw new DocsContentError(`Docs group cycle detected at "${current.key}".`);
			seen.add(current.key);
			current = groups.get(current.parent);
		}
	}
}

function definedGroupNode<TDocument>(group: ResolvedGroup<TDocument>, config: DocsContentConfig): DocsNavNode | null {
	if (group.config?.hidden === true || group.folderConfig?.hidden === true) return null;
	const children = definedChildrenNodes(group.children, config);
	const landing = visibleLanding(group);
	if (!landing && children.length === 0) return null;
	return {
		id: group.folderConfig?.id ?? `group-${stableId(group.key || group.name)}`,
		title: groupTitle(group),
		href: landing?.href,
		slug: landing?.slug,
			description: groupDescription(group),
			badge: groupBadge(group),
			defaultOpen: group.config?.defaultOpen ?? group.folderConfig?.defaultOpen,
		children: children.length > 0 ? children : undefined
	};
}

function definedPageNode<TDocument>(record: SourceRecord<TDocument>, config: DocsContentConfig): DocsNavNode {
	const sourceKey = record.key.slice(0, -3);
	const entry = config.entries?.[sourceKey];
	const documentConfig = config.documents?.[sourceKey] ?? config.documents?.[record.slug];
	return {
		id: documentConfig?.id ?? `page-${stableId(record.slug || 'index')}`,
		title: entry?.title ?? documentConfig?.title ?? record.title,
		href: record.href,
		slug: record.slug,
		description: entry?.description ?? documentConfig?.description ?? record.description,
		badge: entry?.badge ?? documentConfig?.badge
	};
}

function definedChildrenNodes<TDocument>(
	children: Array<ResolvedGroup<TDocument> | SourceRecord<TDocument>>,
	config: DocsContentConfig
): DocsNavNode[] {
	const candidates: DefinedNavCandidate[] = [];
	for (const child of children) {
		const node = isResolvedGroup(child)
			? definedGroupNode(child, config)
			: child.hidden
				? null
				: definedPageNode(child, config);
		if (!node) continue;
		candidates.push({
			node,
			order: isResolvedGroup(child) ? groupOrder(child) : definedRecordOrder(child, config),
			path: isResolvedGroup(child) ? child.key : child.slug,
			title: node.title
		});
	}
	candidates.sort(compareNavCandidates);
	return candidates.map((candidate) => candidate.node);
}

function definedRecordOrder<TDocument>(record: SourceRecord<TDocument>, config: DocsContentConfig): number | undefined {
	const entry = config.entries?.[record.key.slice(0, -3)];
	const documentConfig = config.documents?.[record.key.slice(0, -3)] ?? config.documents?.[record.slug];
	return entry?.order ?? documentConfig?.order ?? record.order;
}

function visibleLanding<TDocument>(group: ResolvedGroup<TDocument>): SourceRecord<TDocument> | undefined {
	return group.landing && !group.landing.hidden && group.config?.hidden !== true && group.folderConfig?.hidden !== true
		? group.landing
		: undefined;
}

function groupTitle<TDocument>(group: ResolvedGroup<TDocument>): string {
	return group.config?.title ?? group.folderConfig?.title ?? visibleLanding(group)?.title ?? group.name;
}

function groupDescription<TDocument>(group: ResolvedGroup<TDocument>): string | undefined {
	return group.config?.description ?? group.folderConfig?.description ?? visibleLanding(group)?.description;
}

function groupBadge<TDocument>(group: ResolvedGroup<TDocument>): string | undefined {
	return group.config?.badge ?? group.folderConfig?.badge;
}

function groupOrder<TDocument>(group: ResolvedGroup<TDocument>): number | undefined {
	return group.config?.order ?? group.folderConfig?.order ?? visibleLanding(group)?.order;
}

function isSourceRecord<TDocument>(value: ResolvedGroup<TDocument> | SourceRecord<TDocument>): value is SourceRecord<TDocument> {
	return 'loader' in value;
}

function isResolvedGroup<TDocument>(value: ResolvedGroup<TDocument> | SourceRecord<TDocument>): value is ResolvedGroup<TDocument> {
	return !isSourceRecord(value);
}

function defaultGroupParent(key: string): string {
	const index = key.lastIndexOf('/');
	return index < 0 ? '' : key.slice(0, index);
}

function normalizeEntryKey(value: string): string {
	return normalizeSourceKey(value).replace(/\.md$/, '');
}

function routeSlug(href: string, baseHref: string): string {
	const path = normalizePath(href);
	if (path === baseHref) return '';
	const prefix = baseHref === '/' ? '/' : `${baseHref}/`;
	if (!path.startsWith(prefix)) {
		throw new DocsContentError(`Docs route "${href}" must be inside baseHref "${baseHref}".`);
	}
	return path.slice(prefix.length);
}

function buildNav<TDocument>(
	root: FolderRecord<TDocument>,
	records: readonly SourceRecord<TDocument>[],
	config: DocsContentConfig,
	baseHref: string
): DocsNav {
	const sections: Array<DocsNavSection & { order?: number; path: string }> = [];
	const visibleRootDocuments = root.documents.filter((document) => !document.hidden);
	if (visibleRootDocuments.length > 0) {
		sections.push({
			id: config.section?.id ?? 'docs',
			title: config.section?.title ?? 'Docs',
			defaultOpen: config.section?.defaultOpen,
			items: buildFolderItems(root, config, false),
			order: config.section?.order,
			path: ''
		});
	}

	for (const folder of root.children.values()) {
		if (folderHidden(config, folder.path)) continue;
		const items = buildFolderItems(folder, config);
		if (items.length === 0) continue;
		const folderConfig = config.folders?.[folder.path];
		sections.push({
			id: folderConfig?.id ?? sectionId(folder.path, sections),
			title: folderConfig?.title ?? humanize(folder.name),
			badge: folderConfig?.badge,
			defaultOpen: folderConfig?.defaultOpen ?? true,
			items,
			order: folderConfig?.order,
			path: folder.path
		});
	}

	if (sections.length === 0 && records.length === 0) {
		sections.push({
			id: config.section?.id ?? 'docs',
			title: config.section?.title ?? 'Docs',
			defaultOpen: config.section?.defaultOpen,
			items: [],
			order: config.section?.order,
			path: ''
		});
	}

	sections.sort((a, b) => compareOptionalOrder(a.order, b.order) || a.path.localeCompare(b.path) || a.title.localeCompare(b.title));
	return {
		title: config.title,
		baseHref,
		subtitle: config.subtitle,
		storageKey: config.storageKey,
		sections: sections.map(({ path: _path, order: _order, ...section }) => section)
	};
}

function buildFolderItems<TDocument>(
	folder: FolderRecord<TDocument>,
	config: DocsContentConfig,
	includeChildren = true
): DocsNavNode[] {
	const candidates: NavCandidate[] = [];
	for (const document of folder.documents) {
		if (document.hidden) continue;
		const documentConfig = config.documents?.[document.key.slice(0, -3)] ?? config.documents?.[document.slug];
		candidates.push({
			node: {
				id: documentConfig?.id ?? `page-${stableId(document.slug || 'index')}`,
				title: document.title,
				href: document.href,
				slug: document.slug,
				description: document.description,
				badge: documentConfig?.badge
			},
			order: document.order,
			path: document.slug,
			title: document.title
		});
	}

	if (!includeChildren) return candidates.sort(compareNavCandidates).map((candidate) => candidate.node);

	for (const child of folder.children.values()) {
		if (folderHidden(config, child.path)) continue;
		const index = child.documents.find((document) => document.isIndex && !document.hidden);
		const children = buildFolderItems(child, config).filter((node) => node.slug !== index?.slug);
		if (!index && children.length === 0) continue;
		const folderConfig = config.folders?.[child.path];
		const node: DocsNavNode = {
			id: folderConfig?.id ?? `group-${stableId(child.path)}`,
			title: folderConfig?.title ?? humanize(child.name),
			href: index?.href,
			slug: index?.slug,
			description: folderConfig?.description ?? index?.description,
			badge: folderConfig?.badge,
			defaultOpen: folderConfig?.defaultOpen,
			children: children.length > 0 ? children : undefined
		};
		candidates.push({
			node,
			order: folderConfig?.order ?? index?.order,
			path: child.path,
			title: node.title
		});
	}

	candidates.sort(compareNavCandidates);
	return candidates.map((candidate) => candidate.node);
}

function compareDocuments<TDocument>(a: DocsContentDocument<TDocument>, b: DocsContentDocument<TDocument>): number {
	return compareOptionalOrder(a.order, b.order) || a.href.localeCompare(b.href);
}

function compareNavCandidates(a: NavCandidate, b: NavCandidate): number {
	return compareOptionalOrder(a.order, b.order) || a.path.localeCompare(b.path) || a.title.localeCompare(b.title);
}

function compareOptionalOrder(a: number | undefined, b: number | undefined): number {
	if (a !== undefined && b !== undefined) return a - b;
	if (a !== undefined) return -1;
	if (b !== undefined) return 1;
	return 0;
}

function createFolder<TDocument>(name: string, path: string): FolderRecord<TDocument> {
	return { name, path, children: new Map(), documents: [] };
}

function folderHidden(config: DocsContentConfig, path: string): boolean {
	if (!path) return false;
	return path.split('/').some((_, index, segments) => config.folders?.[segments.slice(0, index + 1).join('/')]?.hidden === true);
}

function sectionId(path: string, sections: readonly { id: string }[]): string {
	const base = `section-${stableId(path)}`;
	if (!sections.some((section) => section.id === base)) return base;
	let suffix = 2;
	while (sections.some((section) => section.id === `${base}-${suffix}`)) suffix += 1;
	return `${base}-${suffix}`;
}

function fallbackTitle(routeSegments: readonly string[], docsTitle: string): string {
	return humanize(routeSegments.at(-1) ?? docsTitle);
}

function humanize(value: string): string {
	const words = value
		.replaceAll(/[-_]+/g, ' ')
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	return words
		.map((word) => {
			const lower = word.toLowerCase();
			return ACRONYMS.has(lower) ? lower.toUpperCase() : `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
		})
		.join(' ');
}

function routeSegment(value: string): string {
	const result = slugify(value);
	if (!result) throw new DocsContentError(`Could not derive a route segment from "${value}".`);
	return result;
}

function normalizeSourceKey(value: string): string {
	return value.replaceAll('\\', '/').replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+/g, '/');
}

function normalizeConfigPath(value: string): string {
	return normalizeSourceKey(value).replace(/\.md$/, '');
}

function absolutePath(value: string): string {
	const normalized = normalizePath(value.trim() || '/');
	return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function joinBaseHref(baseHref: string, slug: string): string {
	if (!slug) return baseHref;
	return baseHref === '/' ? `/${slug}` : `${baseHref}/${slug}`;
}

function normalizeLookup(value: string, baseHref: string): string {
	const path = normalizePath(value);
	if (path === baseHref) return '';
	const prefix = baseHref === '/' ? '/' : `${baseHref}/`;
	if (path.startsWith(prefix)) return path.slice(prefix.length);
	return path.replace(/^\/+/, '');
}

function stringMetadata(metadata: DocsMetadata, key: string): string | undefined {
	const value = metadata[key];
	if (value === undefined || value === null) return undefined;
	if (typeof value !== 'string') throw new DocsContentError(`Docs metadata field "${key}" must be a string.`);
	return value.trim() || undefined;
}

function booleanMetadata(metadata: DocsMetadata, key: string): boolean | undefined {
	const value = metadata[key];
	if (value === undefined || value === null) return undefined;
	if (typeof value !== 'boolean') throw new DocsContentError(`Docs metadata field "${key}" must be a boolean.`);
	return value;
}

function numberMetadata(metadata: DocsMetadata, key: string): number | undefined {
	const value = metadata[key];
	if (value === undefined || value === null) return undefined;
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new DocsContentError(`Docs metadata field "${key}" must be a finite number.`);
	}
	return value;
}
