/** Shared types and path helpers — safe to import from client (no globs). */

import { parse as parseYaml } from 'yaml';

export const CONTENT_ROOT = '/src/content/';
export const HREF_PREFIX = '/docs';

export type DocMeta = {
	title?: string;
	description?: string;
	tags?: string[];
	order?: number;
	draft?: boolean;
	sidebar?: { label?: string };
	lastUpdated?: string;
	[key: string]: unknown;
};

export type DocListItem = {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	href: string;
	path: string;
	sourcePath: string;
	meta: DocMeta;
};

/** Glob key → repo-relative path (`/src/content/…` → `src/content/…`). */
export function toSourcePath(globPath: string): string {
	return globPath.replace(/^\//, '');
}

/**
 * Vault file path → URL slug.
 * `…/INDEX.md` and `…/index.md` map to the parent folder (or `''` for content root).
 */
export function slugFromPath(path: string): string {
	return path
		.replace(CONTENT_ROOT, '')
		.replace(/^.*\/src\/content\//, '') // also accept absolute disk paths in tests
		.replace(/\.md$/i, '')
		.replace(/(?:^|\/)index$/i, '');
}

export function isIndexPath(path: string): boolean {
	return /\/index\.md$/i.test(path) || /(^|\/)index\.md$/i.test(path);
}

/** Candidate Vite paths for a URL slug (leaf .md then INDEX variants). */
export function candidatePaths(slug: string): string[] {
	if (!slug) {
		return [`${CONTENT_ROOT}INDEX.md`, `${CONTENT_ROOT}index.md`];
	}
	return [
		`${CONTENT_ROOT}${slug}.md`,
		`${CONTENT_ROOT}${slug}/INDEX.md`,
		`${CONTENT_ROOT}${slug}/index.md`
	];
}

/**
 * Parse YAML frontmatter. Falls back to empty object on failure.
 * Supports nested keys, arrays, and multiline scalars via the `yaml` package.
 */
export function parseFrontmatter(source: string): DocMeta {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return {};

	try {
		const parsed = parseYaml(match[1]);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
		return parsed as DocMeta;
	} catch {
		return {};
	}
}

export function titleFromMeta(meta: DocMeta, slug: string): string {
	const sidebarLabel =
		typeof meta.sidebar === 'object' &&
		meta.sidebar &&
		typeof (meta.sidebar as { label?: string }).label === 'string'
			? (meta.sidebar as { label: string }).label
			: '';

	return (
		(typeof meta.title === 'string' && meta.title) ||
		sidebarLabel ||
		slug.split('/').pop() ||
		slug ||
		'Untitled'
	);
}
