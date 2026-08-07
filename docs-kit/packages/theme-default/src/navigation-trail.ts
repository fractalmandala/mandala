import type { DocsNavigationNode } from '@docs-kit/core';

export interface DocsTrailEntry {
	label: string;
	pathname?: string;
}

/** Returns the section/page trail leading to `pathname`, outermost first. */
export function findNavigationTrail(
	nodes: readonly DocsNavigationNode[],
	pathname: string
): DocsTrailEntry[] {
	for (const node of nodes) {
		if (node.type === 'link') {
			continue;
		}

		if (node.type === 'page') {
			if (node.pathname === pathname) {
				return [{ label: node.label, pathname: node.pathname }];
			}

			const nested = findNavigationTrail(node.children ?? [], pathname);
			if (nested.length > 0) {
				return [{ label: node.label, pathname: node.pathname }, ...nested];
			}
			continue;
		}

		const nested = findNavigationTrail(node.children, pathname);
		if (nested.length > 0) {
			return [{ label: node.label }, ...nested];
		}
	}

	return [];
}
