// Build a docs navigation tree from route file paths (import.meta.glob keys).
// Numeric prefixes (01-, 10-) drive ordering and are stripped from titles.

export interface DocNavItem {
	title: string;
	href?: string;
	/** raw segment used for ordering */
	order: string;
	items: DocNavItem[];
}

function titleize(segment: string): string {
	return segment
		.replace(/\.md$/, '')
		.replace(/^\d+[-.]?/, '')
		.replace(/[-_]/g, ' ')
		.replace(/\$/g, '')
		.trim()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * @param globKeys  keys from import.meta.glob (e.g. "/src/routes/sveltekit/svelte/01-introduction/01-overview.md")
 * @param baseRoute the section root route (e.g. "/sveltekit")
 */
export function buildNav(globKeys: string[], baseRoute: string): DocNavItem[] {
	const root: DocNavItem[] = [];

	for (const key of globKeys) {
		// "/src/routes/sveltekit/svelte/01-introduction/01-overview.md"
		const routePath = key.replace(/^\/src\/routes/, '').replace(/\.md$/, '');
		// drop hidden/generated segments
		if (routePath.includes('/.generated/') || /\/\./.test(routePath)) continue;

		const rel = routePath.slice(baseRoute.length).replace(/^\//, ''); // "svelte/01-introduction/01-overview"
		if (!rel) continue;
		const segments = rel.split('/');
		const isIndex = segments[segments.length - 1] === 'index';
		const branchSegments = isIndex ? segments.slice(0, -1) : segments;

		let level = root;
		let accHref = baseRoute;

		branchSegments.forEach((seg, i) => {
			accHref += '/' + seg;
			const isLeaf = i === branchSegments.length - 1;
			let node = level.find((n) => n.order === seg);
			if (!node) {
				node = { title: titleize(seg), order: seg, items: [] };
				level.push(node);
			}
			if (isLeaf) {
				// leaf .md, or an index.md that is its folder's landing page
				node.href = accHref;
			}
			level = node.items;
		});
	}

	const sortRec = (items: DocNavItem[]): DocNavItem[] => {
		items.sort((a, b) => a.order.localeCompare(b.order, undefined, { numeric: true }));
		for (const it of items) sortRec(it.items);
		return items;
	};

	return sortRec(root);
}
