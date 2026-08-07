/**
 * Pure nav tree builders (no content globs) — safe for unit tests.
 */
import type { DocListItem } from './content-shared.js';
import type { NavItem } from './types.js';

function docNavTitle(doc: {
	title: string;
	meta: { sidebar?: { label?: string }; title?: string };
}): string {
	return doc.meta.sidebar?.label ?? doc.title;
}

type TreeNode = {
	title: string;
	href?: string;
	order: number;
	children: Map<string, TreeNode>;
};

function humanizeSegment(seg: string): string {
	return seg.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Build a nested NavItem tree from flat docs under a content directory.
 * e.g. slug `projects/sites/foo` under root `projects` → sites → foo
 */
export function buildNavTree(docs: DocListItem[], rootDirectory: string): NavItem[] {
	const rootPrefix = rootDirectory.replace(/^\/+|\/+$/g, '');
	const root: TreeNode = { title: rootPrefix, order: 0, children: new Map() };

	for (const doc of docs) {
		let rel = doc.slug;
		if (rel === rootPrefix) {
			root.href = doc.href;
			root.order = doc.meta.order ?? root.order;
			root.title = docNavTitle(doc);
			continue;
		}
		if (rel.startsWith(rootPrefix + '/')) {
			rel = rel.slice(rootPrefix.length + 1);
		}

		const segments = rel.split('/').filter(Boolean);
		if (segments.length === 0) continue;

		let node = root;
		for (let i = 0; i < segments.length; i++) {
			const seg = segments[i];
			const isLeaf = i === segments.length - 1;
			let child = node.children.get(seg);
			if (!child) {
				child = {
					title: isLeaf ? docNavTitle(doc) : humanizeSegment(seg),
					order: isLeaf ? (doc.meta.order ?? 999) : 999,
					children: new Map()
				};
				node.children.set(seg, child);
			}
			if (isLeaf) {
				child.href = doc.href;
				child.title = docNavTitle(doc);
				child.order = doc.meta.order ?? child.order;
			}
			node = child;
		}
	}

	return sortTreeChildren(root);
}

function sortTreeChildren(node: TreeNode): NavItem[] {
	return [...node.children.values()]
		.map((child) => treeNodeToNavItem(child))
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
}

function treeNodeToNavItem(node: TreeNode): NavItem {
	const children = sortTreeChildren(node);
	const item: NavItem = {
		title: node.title,
		href: node.href,
		order: node.order
	};
	if (children.length > 0) {
		item.items = children;
	}
	return item;
}

/** Depth-first flatten of nav tree for prev/next. */
export function flattenNav(nav: NavItem[]): NavItem[] {
	const out: NavItem[] = [];
	const walk = (items: NavItem[]) => {
		for (const item of items) {
			if (item.href) out.push({ title: item.title, href: item.href });
			if (item.items?.length) walk(item.items);
		}
	};
	walk(nav);
	return out;
}
