/**
 * Rewrite vault-relative markdown links to site routes.
 * Pure helpers + remark plugin for mdsvex.
 */

import { HREF_PREFIX, slugFromPath } from './content-shared.js';

const CONTENT_MARKER = '/src/content/';

/**
 * Convert a .md href (relative or content-absolute) to a /docs slug path.
 * @param href - link target from markdown
 * @param fromFile - Vite/mdsvex file path, e.g. `/abs/.../src/content/projects/INDEX.md`
 */
export function rewriteMdHref(href: string, fromFile = ''): string {
	if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
		return href;
	}
	if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
		// absolute URL (http, https, …)
		return href;
	}
	if (href.startsWith('//')) return href;

	const hashIndex = href.indexOf('#');
	const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
	let pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href;

	// Already a site route
	if (pathPart.startsWith('/docs')) {
		return pathPart.replace(/\.md$/i, '').replace(/\/index$/i, '') + hash;
	}
	if (pathPart.startsWith('/') && !pathPart.startsWith('/src/')) {
		// other absolute site paths — leave alone
		return href;
	}

	// Only rewrite markdown targets (and bare paths that clearly point at vault files)
	const looksLikeMd =
		/\.md$/i.test(pathPart) ||
		/\/index$/i.test(pathPart) ||
		pathPart.endsWith('/') ||
		// relative path without extension used in some wikis — only if from a content file
		(fromFile.includes(CONTENT_MARKER) && !pathPart.includes('.') && pathPart.length > 0);

	if (!looksLikeMd && !/\.md$/i.test(pathPart)) {
		return href;
	}

	pathPart = pathPart.replace(/\.md$/i, '');

	// Resolve relative to current content file directory
	let absoluteContentPath: string;
	if (pathPart.startsWith('/src/content/')) {
		absoluteContentPath = pathPart;
	} else if (pathPart.startsWith('/')) {
		// treat as under content root
		absoluteContentPath = `${CONTENT_MARKER}${pathPart.replace(/^\//, '')}`;
	} else {
		const from = fromFile.replace(/\\/g, '/');
		const contentIdx = from.indexOf(CONTENT_MARKER);
		const relFrom =
			contentIdx >= 0
				? from.slice(contentIdx + CONTENT_MARKER.length)
				: from.replace(/^.*\/src\/content\//, '');
		const dir = relFrom.includes('/') ? relFrom.replace(/\/[^/]+$/, '') : '';
		const joined = dir ? `${dir}/${pathPart}` : pathPart;
		// normalize ./ and ../
		const parts: string[] = [];
		for (const seg of joined.split('/')) {
			if (!seg || seg === '.') continue;
			if (seg === '..') parts.pop();
			else parts.push(seg);
		}
		absoluteContentPath = `${CONTENT_MARKER}${parts.join('/')}`;
	}

	const cleanSlug = slugFromPath(
		/\.md$/i.test(absoluteContentPath)
			? absoluteContentPath
			: absoluteContentPath.endsWith('/')
				? `${absoluteContentPath}INDEX.md`
				: `${absoluteContentPath}.md`
	);

	return (cleanSlug ? `${HREF_PREFIX}/${cleanSlug}` : HREF_PREFIX) + hash;
}

type MdastNode = {
	type?: string;
	url?: string;
	children?: MdastNode[];
	[key: string]: unknown;
};

function walk(node: MdastNode, visit: (n: MdastNode) => void) {
	visit(node);
	if (Array.isArray(node.children)) {
		for (const child of node.children) walk(child, visit);
	}
}

/**
 * mdsvex / unified remark plugin — rewrites local .md links to /docs routes.
 */
export function remarkRewriteMdLinks() {
	return (tree: MdastNode, file?: { path?: string; history?: string[]; filename?: string }) => {
		const fromFile =
			file?.filename ||
			file?.path ||
			(Array.isArray(file?.history) ? file.history[file.history.length - 1] : '') ||
			'';

		walk(tree, (node) => {
			if ((node.type === 'link' || node.type === 'definition') && typeof node.url === 'string') {
				node.url = rewriteMdHref(node.url, fromFile);
			}
		});
	};
}
