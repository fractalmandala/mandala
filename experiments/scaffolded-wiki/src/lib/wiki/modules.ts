/**
 * Universal (client-safe) access to the raw markdown modules.
 *
 * Every `.md` file under `repowiki/` is imported lazily through Vite's
 * `import.meta.glob` — mdsvex compiles each one into a Svelte component whose
 * frontmatter is exposed as `metadata`. The content is reached through the
 * `src/content` symlink (→ `../../repowiki`) because Vite glob patterns must
 * stay inside the project root and cannot use aliases. Lazy, so the compiled
 * markdown is split into per-file chunks loaded only when a page actually
 * renders it (the same pattern sites/fractalmandala ships with).
 */
import type { Component } from 'svelte';

export interface WikiModule {
	default: Component;
	metadata: Record<string, unknown>;
}

const CONTENT_ROOT = '/src/content';

// Tooling folders and the generated tag index are not wiki content — keep
// them out of the component graph entirely.
// Vite 8 (rolldown) dropped the `exclude` glob option; use negative glob
// patterns to keep tooling folders and the generated tag index out of the
// component graph.
export const wikiModules = import.meta.glob([
	'/src/content/**/*.md',
	'!/src/content/commands/**',
	'!/src/content/scripts/**',
	'!/src/content/meta/**',
	'!/src/content/wiki/TAGINDEX.md'
]) as Record<string, () => Promise<WikiModule>>;

/** True when a markdown file exists at `rel` (e.g. `repo/vault.md`). */
export function hasModule(rel: string): boolean {
	return `${CONTENT_ROOT}/${rel}` in wikiModules;
}

/** Load a markdown module by its content-relative path, or undefined. */
export async function loadMdModule(rel: string): Promise<WikiModule | undefined> {
	const loader = wikiModules[`${CONTENT_ROOT}/${rel}`];
	if (!loader) return undefined;
	return loader();
}

/** Slugify a tag name for `/tag/<slug>` routes (mirrors the package's scheme). */
export function tagSlug(tag: string): string {
	return tag
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
}
