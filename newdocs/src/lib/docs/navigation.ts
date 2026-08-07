/**
 * Navigation builders — import only from server load modules
 * (+layout.server.ts / +page.server.ts), not from client components.
 */
import { docsConfig } from './config.js';
import { getDocsByDirectory } from './content-list.js';
import { buildNavTree, flattenNav } from './nav-tree.js';
import type { NavItem } from './types.js';

export { buildNavTree, flattenNav } from './nav-tree.js';

export function generateNavigation(): NavItem[] {
	const nav: NavItem[] = [];

	for (const section of docsConfig.sidebar) {
		if (section.autogenerate) {
			const dir = section.autogenerate.directory;
			const docs = getDocsByDirectory(dir);
			const items = buildNavTree(docs, dir);

			nav.push({
				title: section.label,
				items
			});
		} else if (section.items) {
			nav.push({
				title: section.label,
				items: section.items.map((item) => ({
					title: item.label,
					href: item.href
				}))
			});
		}
	}

	return nav;
}

export function getNavigation(): NavItem[] {
	return generateNavigation();
}

export function getPrevNext(currentSlug: string): { prev?: NavItem; next?: NavItem } {
	const flat = flattenNav(getNavigation());
	const href = currentSlug ? `/docs/${currentSlug}` : '/docs';
	const index = flat.findIndex((item) => item.href === href);
	if (index === -1) return {};

	return {
		prev: index > 0 ? flat[index - 1] : undefined,
		next: index < flat.length - 1 ? flat[index + 1] : undefined
	};
}
