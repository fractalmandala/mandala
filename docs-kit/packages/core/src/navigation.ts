import type { DocsPageMeta } from '@docs-kit/core/page';

/** Folder metadata file name, read from beside the documents it orders. */
export const sectionMetaFileName = 'meta.json';

/** Folder metadata, authored as `meta.json` beside the documents it orders. */
export interface DocsSectionMeta {
	title?: string;
	label?: string;
	icon?: string;
	/** Explicit child order, by slug segment. Unlisted children follow, sorted normally. */
	order?: string[];
	/** Sort weight of the section itself among its siblings. */
	weight?: number;
	collapsible?: boolean;
	collapsed?: boolean;
	hidden?: boolean;
}

/** A folder metadata record located at a directory path relative to the content root. */
export interface DiscoveredSection {
	/** Directory path relative to the content root; `''` is the root itself. */
	directory: string;
	meta: DocsSectionMeta;
	version?: string;
	locale?: string;
	collection?: string;
}

export type DocsNavigationNode =
	| DocsNavigationSection
	| DocsNavigationPage
	| DocsNavigationLink;

export interface DocsNavigationSection {
	type: 'section';
	id: string;
	label: string;
	icon?: string;
	collapsible: boolean;
	collapsed: boolean;
	children: DocsNavigationNode[];
}

export interface DocsNavigationPage {
	type: 'page';
	id: string;
	label: string;
	pathname: string;
	icon?: string;
	badge?: string;
	children?: DocsNavigationNode[];
}

export interface DocsNavigationLink {
	type: 'link';
	id: string;
	label: string;
	href: string;
	external: boolean;
	icon?: string;
}

/** The minimum a page must expose to take part in navigation. */
export interface DocsNavigablePage {
	id: string;
	slug: string;
	slugSegments: string[];
	pathname: string;
	title: string;
	label: string;
	icon?: string;
	badge?: string;
	order?: number;
	hidden?: boolean;
	draft?: boolean;
}

export interface BuildDocsNavigationOptions {
	sections?: readonly DiscoveredSection[];
	/** Include hidden and draft pages. Defaults to false. */
	includeHidden?: boolean;
	/** Extra links appended to the root level, for example a repository link. */
	links?: readonly Omit<DocsNavigationLink, 'type' | 'external'>[];
	/** Explicit navigation, which replaces file-tree generation when supplied. */
	navigation?: readonly DocsNavigationInput[];
}

/** Hand-authored navigation, resolved against real pages. */
export type DocsNavigationInput =
	| { type: 'page'; id: string; label?: string }
	| { type: 'section'; label: string; icon?: string; collapsed?: boolean; children: DocsNavigationInput[] }
	| { type: 'link'; label: string; href: string; icon?: string };

interface TreeNode {
	segment: string;
	directory: string;
	page?: DocsNavigablePage;
	children: Map<string, TreeNode>;
}

function isVisible(page: DocsNavigablePage, includeHidden: boolean): boolean {
	return includeHidden || (!page.hidden && !page.draft);
}

function sectionLabel(directory: string, meta: DocsSectionMeta | undefined): string {
	if (meta?.label) {
		return meta.label;
	}
	if (meta?.title) {
		return meta.title;
	}

	const segment = directory.split('/').filter(Boolean).at(-1) ?? directory;
	return segment
		.replace(/[-_]+/g, ' ')
		.trim()
		.replace(/^\p{Letter}/u, (character) => character.toUpperCase());
}

interface SortableEntry {
	order: number | undefined;
	segment: string;
	explicit: number;
}

function compareEntries(left: SortableEntry, right: SortableEntry): number {
	if (left.explicit !== right.explicit) {
		return left.explicit - right.explicit;
	}
	if ((left.order ?? Number.POSITIVE_INFINITY) !== (right.order ?? Number.POSITIVE_INFINITY)) {
		return (left.order ?? Number.POSITIVE_INFINITY) - (right.order ?? Number.POSITIVE_INFINITY);
	}

	return left.segment.localeCompare(right.segment);
}

function buildTree(pages: readonly DocsNavigablePage[]): TreeNode {
	const root: TreeNode = { segment: '', directory: '', children: new Map() };

	for (const page of pages) {
		if (page.slugSegments.length === 0) {
			root.page = page;
			continue;
		}

		let current = root;
		page.slugSegments.forEach((segment, index) => {
			const existing = current.children.get(segment);
			const directory = page.slugSegments.slice(0, index + 1).join('/');
			const next: TreeNode = existing ?? { segment, directory, children: new Map() };
			if (!existing) {
				current.children.set(segment, next);
			}
			if (index === page.slugSegments.length - 1) {
				next.page = page;
			}
			current = next;
		});
	}

	return root;
}

function toNodes(
	node: TreeNode,
	sections: Map<string, DocsSectionMeta>,
	includeHidden: boolean
): DocsNavigationNode[] {
	const meta = sections.get(node.directory);
	const explicitOrder = meta?.order ?? [];

	const entries = [...node.children.values()]
		.map((child) => {
			const childMeta = sections.get(child.directory);
			const explicitIndex = explicitOrder.indexOf(child.segment);
			const isSection = child.children.size > 0;

			return {
				child,
				childMeta,
				isSection,
				order: isSection ? childMeta?.weight ?? child.page?.order : child.page?.order,
				label: child.page ? child.page.label : sectionLabel(child.directory, childMeta),
				segment: child.segment,
				explicit: explicitIndex === -1 ? explicitOrder.length : explicitIndex
			};
		})
		.filter((entry) => {
			if (entry.childMeta?.hidden && !includeHidden) {
				return false;
			}
			if (entry.child.page && !isVisible(entry.child.page, includeHidden)) {
				return entry.child.children.size > 0;
			}
			return true;
		})
		.sort(compareEntries);

	return entries.map((entry): DocsNavigationNode => {
		const children = toNodes(entry.child, sections, includeHidden);
		const page = entry.child.page;

		if (page && isVisible(page, includeHidden)) {
			return {
				type: 'page',
				id: page.id,
				label: page.label,
				pathname: page.pathname,
				...(page.icon === undefined ? {} : { icon: page.icon }),
				...(page.badge === undefined ? {} : { badge: page.badge }),
				...(children.length === 0 ? {} : { children })
			};
		}

		return {
			type: 'section',
			id: entry.child.directory,
			label: entry.label,
			...(entry.childMeta?.icon === undefined ? {} : { icon: entry.childMeta.icon }),
			collapsible: entry.childMeta?.collapsible ?? true,
			collapsed: entry.childMeta?.collapsed ?? false,
			children
		};
	});
}

function resolveExplicit(
	inputs: readonly DocsNavigationInput[],
	byId: Map<string, DocsNavigablePage>,
	bySlug: Map<string, DocsNavigablePage>
): DocsNavigationNode[] {
	return inputs.flatMap((input): DocsNavigationNode[] => {
		if (input.type === 'link') {
			return [
				{
					type: 'link',
					id: input.href,
					label: input.label,
					href: input.href,
					external: /^https?:\/\//.test(input.href),
					...(input.icon === undefined ? {} : { icon: input.icon })
				}
			];
		}

		if (input.type === 'section') {
			return [
				{
					type: 'section',
					id: input.label,
					label: input.label,
					...(input.icon === undefined ? {} : { icon: input.icon }),
					collapsible: true,
					collapsed: input.collapsed ?? false,
					children: resolveExplicit(input.children, byId, bySlug)
				}
			];
		}

		const page = byId.get(input.id) ?? bySlug.get(input.id);
		if (!page) {
			throw new Error(`Explicit navigation references unknown page "${input.id}".`);
		}

		return [
			{
				type: 'page',
				id: page.id,
				label: input.label ?? page.label,
				pathname: page.pathname,
				...(page.icon === undefined ? {} : { icon: page.icon }),
				...(page.badge === undefined ? {} : { badge: page.badge })
			}
		];
	});
}

/**
 * Builds a navigation tree from the file tree, honouring folder metadata and page order.
 *
 * The root index page is deliberately included as the first entry so a documentation home
 * page is reachable from the sidebar.
 */
export function buildDocsNavigation(
	pages: readonly DocsNavigablePage[],
	options: BuildDocsNavigationOptions = {}
): DocsNavigationNode[] {
	const includeHidden = options.includeHidden ?? false;

	if (options.navigation !== undefined) {
		return resolveExplicit(
			options.navigation,
			new Map(pages.map((page) => [page.id, page])),
			new Map(pages.map((page) => [page.slug, page]))
		);
	}

	const sections = new Map(
		(options.sections ?? []).map((section) => [section.directory, section.meta])
	);
	const tree = buildTree(pages);
	const nodes = toNodes(tree, sections, includeHidden);

	if (tree.page && isVisible(tree.page, includeHidden)) {
		nodes.unshift({
			type: 'page',
			id: tree.page.id,
			label: tree.page.label,
			pathname: tree.page.pathname,
			...(tree.page.icon === undefined ? {} : { icon: tree.page.icon }),
			...(tree.page.badge === undefined ? {} : { badge: tree.page.badge })
		});
	}

	for (const link of options.links ?? []) {
		nodes.push({
			type: 'link',
			id: link.id,
			label: link.label,
			href: link.href,
			external: /^https?:\/\//.test(link.href),
			...(link.icon === undefined ? {} : { icon: link.icon })
		});
	}

	return nodes;
}

/** Flattens navigation into the visible reading order used for previous/next links. */
export function flattenDocsNavigation(
	nodes: readonly DocsNavigationNode[]
): DocsNavigationPage[] {
	return nodes.flatMap((node): DocsNavigationPage[] => {
		if (node.type === 'link') {
			return [];
		}
		if (node.type === 'section') {
			return flattenDocsNavigation(node.children);
		}

		return [node, ...flattenDocsNavigation(node.children ?? [])];
	});
}

export interface DocsPageReference {
	id: string;
	label: string;
	pathname: string;
}

/** Returns the previous and next page for every page in navigation order. */
export function createDocsPagination(
	nodes: readonly DocsNavigationNode[]
): Map<string, { previous?: DocsPageReference; next?: DocsPageReference }> {
	const order = flattenDocsNavigation(nodes);
	const pagination = new Map<string, { previous?: DocsPageReference; next?: DocsPageReference }>();

	order.forEach((page, index) => {
		const previous = order[index - 1];
		const next = order[index + 1];

		pagination.set(page.id, {
			...(previous === undefined
				? {}
				: { previous: { id: previous.id, label: previous.label, pathname: previous.pathname } }),
			...(next === undefined
				? {}
				: { next: { id: next.id, label: next.label, pathname: next.pathname } })
		});
	});

	return pagination;
}

/** Deterministic key identifying one navigation tree in the manifest. */
export function getDocsNavigationKey(
	dimensions: { collection?: string; version?: string; locale?: string } = {}
): string {
	// Preserve legacy keys for the implicit/default collection so existing manifests remain usable.
	return dimensions.collection === undefined || dimensions.collection === 'default'
		? `${dimensions.version ?? ''}|${dimensions.locale ?? ''}`
		: `${dimensions.collection}|${dimensions.version ?? ''}|${dimensions.locale ?? ''}`;
}
