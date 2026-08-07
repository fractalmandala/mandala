/**
 * Server-side wiki store.
 *
 * Single source of truth: the repowiki content on disk at `<repo>/repowiki/`.
 * We build the docs tree, tag index, prev/next and lookups with
 * `svelte-docs-scaffold`, then project them into small serializable "view"
 * shapes so layout/page load data stays lean (no rendered HTML, no
 * components, no node:fs leaking into the client).
 *
 * Markdown *rendering* is handled separately by mdsvex via `$lib/wiki/modules`.
 */
import { createDocs, loadFromFs, buildTagIndex, flattenDocs, type DocNode, type DocPage } from 'svelte-docs-scaffold';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { sanitizeFrontmatter } from '../../../lib/frontmatter.mjs';

/**
 * Path to the wiki content. Defaults to `<repo root>/repowiki` (two levels
 * up from the app: experiments/scaffolded-wiki → mandala). Resolved from
 * `process.cwd()` because dev/build/preview always run with the app root as
 * cwd — `import.meta.url` would point into the bundled chunk at build time.
 * Override with `REPOWIKI_ROOT`.
 */
export const WIKI_ROOT = process.env.REPOWIKI_ROOT ?? resolve(process.cwd(), '../../repowiki');

if (!existsSync(WIKI_ROOT)) {
	throw new Error(
		`[scaffolded-wiki] Wiki content not found at ${WIKI_ROOT}. ` +
			'Point REPOWIKI_ROOT at a repowiki folder or run the app from experiments/scaffolded-wiki.'
	);
}

// Tooling folders and generated files that are part of the wiki project but
// not wiki content.
const EXCLUDED_ROOTS = new Set(['scripts', 'meta', 'commands']);

function isContentFile(rel: string): boolean {
	const root = rel.split('/')[0] ?? '';
	if (EXCLUDED_ROOTS.has(root)) return false;
	if (rel === 'wiki/TAGINDEX.md') return false; // replaced by the /tags page
	return true;
}

export const wiki = createDocs({
	// Sanitize generated-YAML quirks (see lib/frontmatter.mjs) before the
	// package's gray-matter parser sees the content.
	files: loadFromFs(WIKI_ROOT)
		.map((f) => ({ rel: f.rel, content: sanitizeFrontmatter(f.content) }))
		.filter((f) => isContentFile(f.rel)),
	config: { base: '/' }
});

/* ------------------------------------------------------------------ */
/* Serializable views                                                 */
/* ------------------------------------------------------------------ */

export interface TreeItem {
	kind: 'section' | 'doc';
	title: string;
	slug: string;
	path: string;
	/** Docs under a section (includes nested). */
	count?: number;
	children?: TreeItem[];
}

export interface TagView {
	tag: string;
	slug: string;
	count: number;
}

export interface DocMetaView {
	path: string;
	slug: string;
	title: string;
	description: string;
	section: string;
	tags: string[];
	type?: string;
}

export interface DocMetaStrip {
	type?: string;
	module?: string;
	source?: string;
	created?: string;
	updated?: string;
}

/**
 * Server-side page data for the catch-all doc route. SvelteKit 2.70's
 * generated `PageData` omits `PageServerData` when a route also has a
 * universal `+page.ts`, so the component intersects it explicitly.
 */
export interface CatchAllPageData {
	path: string;
	page: DocMetaView;
	meta: DocMetaStrip;
	isLanding: boolean;
	section: string;
	breadcrumbs: { label: string; href: string }[];
	prev?: DocMetaView;
	next?: DocMetaView;
	sectionTags: TagView[];
	/** Set when the path is a folder with no INDEX.md (auto-generated landing). */
	landing?: SectionLandingView;
}

export interface SectionLandingView {
	title: string;
	path: string;
	description: string;
	children: DocMetaView[];
	tags: TagView[];
}

/**
 * Auto-generated landing for a section (folder) that has child docs but no
 * INDEX.md — lists its children and their tags so the sidebar links to a
 * real page instead of a 404.
 */
export function sectionLandingView(path: string): SectionLandingView | undefined {
	const node = findNode(wiki.tree, path);
	if (!node || node.kind !== 'section') return undefined;
	const docs = flattenDocs(node.children);
	return {
		title: node.title,
		path: node.path,
		description: `${docs.length} page${docs.length === 1 ? '' : 's'} in this section`,
		children: docs.map(docMetaView),
		tags: buildTagIndex(docs).map((t) => ({ tag: t.tag, slug: t.slug, count: t.pages.length }))
	};
}

/** Server-side page data for the home route. */
export interface HomePageData {
	landing?: DocMetaView;
	sectionCards: { title: string; path: string; count: number; description: string }[];
	rootDocs: DocMetaView[];
	cloud: TagView[];
	counts: { docs: number; tags: number; sections: number };
}

function countDocs(nodes: DocNode[]): number {
	let n = 0;
	for (const node of nodes) {
		if (node.kind === 'doc') n++;
		else n += countDocs(node.children);
	}
	return n;
}

export function pruneTree(nodes: DocNode[]): TreeItem[] {
	return nodes.map((node) => {
		if (node.kind === 'doc') {
			return { kind: 'doc', title: node.title, slug: node.slug, path: node.path };
		}
		return {
			kind: 'section',
			title: node.title,
			slug: node.slug,
			path: node.path,
			count: countDocs(node.children),
			children: pruneTree(node.children)
		};
	});
}

export function tagView(): TagView[] {
	return wiki.tags.map((t) => ({ tag: t.tag, slug: t.slug, count: t.pages.length }));
}

export function docMetaView(page: DocPage): DocMetaView {
	return {
		path: page.path,
		slug: page.slug,
		title: page.title,
		description: page.description,
		section: page.section,
		tags: page.tags,
		type: typeof page.meta.type === 'string' ? page.meta.type : undefined
	};
}

const iso = (v: unknown): string | undefined =>
	v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'string' ? v.slice(0, 10) : undefined;

export function stripMeta(meta: DocPage['meta']): DocMetaStrip {
	return {
		type: typeof meta.type === 'string' ? meta.type : undefined,
		module: typeof meta.module === 'string' ? meta.module : undefined,
		source: typeof meta.path === 'string' ? meta.path : undefined,
		created: iso(meta.created),
		updated: iso(meta.updated)
	};
}

function findNode(nodes: DocNode[], path: string): DocNode | undefined {
	for (const node of nodes) {
		if (node.path === path) return node;
		if (node.kind === 'section') {
			const found = findNode(node.children, path);
			if (found) return found;
		}
	}
	return undefined;
}

/**
 * Tags used under a subtree (a section landing page at any depth), with
 * counts — for the "tags in this section" block on landing pages.
 */
export function sectionTagView(path: string): TagView[] {
	const node = findNode(wiki.tree, path);
	if (!node || node.kind !== 'section') return [];
	return buildTagIndex(flattenDocs(node.children)).map((t) => ({
		tag: t.tag,
		slug: t.slug,
		count: t.pages.length
	}));
}
