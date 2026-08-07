import { slugifyHeading } from '@docs-kit/core';

interface HastNode {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
}

const headingTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function textOf(node: HastNode): string {
	if (node.type === 'text') {
		return node.value ?? '';
	}

	return (node.children ?? []).map(textOf).join('');
}

function visit(node: HastNode, visitor: (node: HastNode) => void): void {
	visitor(node);
	for (const child of node.children ?? []) {
		visit(child, visitor);
	}
}

export interface DocsHeadingOptions {
	/** Add a permalink anchor inside each heading. Defaults to true. */
	anchors?: boolean;
	/** Heading depths that receive ids. Defaults to 2–4. */
	depths?: number[];
	/** Accessible label for the permalink, with `%s` replaced by the heading text. */
	anchorLabel?: string;
}

/**
 * Rehype plugin adding stable heading ids and permalink anchors.
 *
 * Ids are produced by the same `slugifyHeading` the compiler uses for the table of
 * contents, so an anchor in the page and a link from search always agree.
 */
export function rehypeDocsHeadings(options: DocsHeadingOptions = {}) {
	const depths = new Set(options.depths ?? [2, 3, 4]);
	const anchorLabel = options.anchorLabel ?? 'Link to %s';

	return function transformer(tree: HastNode): void {
		const used = new Set<string>();

		visit(tree, (node) => {
			if (node.type !== 'element' || !node.tagName || !headingTags.has(node.tagName)) {
				return;
			}

			const depth = Number(node.tagName.slice(1));
			const text = textOf(node);
			const properties = (node.properties ??= {});
			let id = typeof properties['id'] === 'string' ? properties['id'] : slugifyHeading(text);

			if (used.has(id)) {
				let counter = 1;
				while (used.has(`${id}-${counter}`)) {
					counter += 1;
				}
				id = `${id}-${counter}`;
			}
			used.add(id);
			properties['id'] = id;

			if (options.anchors === false || !depths.has(depth)) {
				return;
			}

			node.children = [
				...(node.children ?? []),
				{
					type: 'element',
					tagName: 'a',
					properties: {
						href: `#${id}`,
						class: 'docs-heading-anchor',
						'aria-label': anchorLabel.replace('%s', text)
					},
					children: [{ type: 'text', value: '#' }]
				}
			];
		});
	};
}
