/** A framework-neutral navigation entry recovered from a source project. */
export interface MigratedNavigationNode {
	label: string;
	/** Destination path relative to the documentation root, without an extension. */
	path?: string;
	children?: MigratedNavigationNode[];
}

/** Parses an mdBook `SUMMARY.md` into a nested navigation tree. */
export function parseSummaryNavigation(source: string): MigratedNavigationNode[] {
	const root: MigratedNavigationNode[] = [];
	const stack: Array<{ indent: number; children: MigratedNavigationNode[] }> = [
		{ indent: -1, children: root }
	];

	for (const line of source.split('\n')) {
		const entry = /^(\s*)[-*]\s*\[([^\]]*)\]\(([^)]*)\)/.exec(line);
		if (!entry) {
			continue;
		}

		const indent = (entry[1] ?? '').length;
		const node: MigratedNavigationNode = {
			label: entry[2] ?? '',
			path: (entry[3] ?? '').replace(/\.(md|markdown)$/i, '')
		};

		while (stack.length > 1 && (stack.at(-1) as { indent: number }).indent >= indent) {
			stack.pop();
		}

		const parent = stack.at(-1) as { children: MigratedNavigationNode[] };
		parent.children.push(node);
		node.children = [];
		stack.push({ indent, children: node.children });
	}

	const prune = (nodes: MigratedNavigationNode[]): MigratedNavigationNode[] =>
		nodes.map((node) => {
			const children = node.children ? prune(node.children) : [];
			return children.length > 0 ? { ...node, children } : { label: node.label, ...(node.path === undefined ? {} : { path: node.path }) };
		});

	return prune(root);
}

/**
 * Parses the `nav:` block of an `mkdocs.yml`.
 * Only the list form documentation projects use is understood; anything else is left to
 * the report rather than guessed at.
 */
export function parseMkDocsNavigation(source: string): MigratedNavigationNode[] {
	const lines = source.split('\n');
	const navIndex = lines.findIndex((line) => /^nav\s*:\s*$/.test(line));
	if (navIndex === -1) {
		return [];
	}

	const root: MigratedNavigationNode[] = [];
	const stack: Array<{ indent: number; children: MigratedNavigationNode[] }> = [
		{ indent: -1, children: root }
	];

	for (const line of lines.slice(navIndex + 1)) {
		if (line.trim() === '') {
			continue;
		}
		if (!/^\s/.test(line)) {
			break;
		}

		const entry = /^(\s*)-\s*(?:(?:"([^"]*)"|'([^']*)'|([^:]+?))\s*:\s*)?(.*)$/.exec(line);
		if (!entry) {
			continue;
		}

		const indent = (entry[1] ?? '').length;
		const label = (entry[2] ?? entry[3] ?? entry[4] ?? '').trim();
		const target = (entry[5] ?? '').trim().replace(/^['"]|['"]$/g, '');

		while (stack.length > 1 && (stack.at(-1) as { indent: number }).indent >= indent) {
			stack.pop();
		}

		const parent = stack.at(-1) as { children: MigratedNavigationNode[] };
		const node: MigratedNavigationNode =
			target === ''
				? { label, children: [] }
				: {
						label: label === '' ? target.replace(/\.(md|markdown)$/i, '') : label,
						path: target.replace(/\.(md|markdown)$/i, '')
					};

		parent.children.push(node);
		if (node.children) {
			stack.push({ indent, children: node.children });
		}
	}

	return root;
}

/** Parses a Fumadocs-style `meta.json` / `_meta.json` ordering file. */
export function parseMetaNavigation(source: string): MigratedNavigationNode[] {
	let parsed: unknown;
	try {
		parsed = JSON.parse(source);
	} catch {
		return [];
	}

	if (parsed === null || typeof parsed !== 'object') {
		return [];
	}

	const meta = parsed as { title?: string; pages?: unknown };
	const pages = Array.isArray(meta.pages) ? meta.pages : [];
	const children = pages
		.filter((page): page is string => typeof page === 'string')
		.map((page) => ({ label: page, path: page }));

	return meta.title ? [{ label: meta.title, children }] : children;
}
