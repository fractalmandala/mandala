/**
 * Single-page load — client-safe.
 * Lazy raw globs only (no mdsvex / Svelte compile of vault files).
 * Resolves INDEX.md via candidate paths; renders HTML with `marked`.
 */
import {
	candidatePaths,
	parseFrontmatter,
	toSourcePath,
	type DocMeta
} from './content-shared.js';
import { renderMarkdown } from './render-markdown.js';

const rawModules = import.meta.glob<string>('/src/content/**/*.md', {
	query: '?raw',
	import: 'default'
});

export type DocLoadResult =
	| {
			ok: true;
			/** Rendered HTML body (no frontmatter). */
			html: string;
			raw: string;
			meta: DocMeta;
			slug: string;
			path: string;
			sourcePath: string;
	  }
	| {
			ok: false;
			html: string;
			raw: string;
			meta: DocMeta;
			slug: string;
			path: string;
			sourcePath: string;
			error: unknown;
	  };

export async function getDoc(slug: string): Promise<DocLoadResult | null> {
	for (const path of candidatePaths(slug)) {
		const loader = rawModules[path];
		if (!loader) continue;

		const sourcePath = toSourcePath(path);

		try {
			const source = await loader();
			const meta = parseFrontmatter(source);
			const html = renderMarkdown(source, path);
			return {
				ok: true,
				html,
				raw: source,
				meta,
				slug,
				path,
				sourcePath
			};
		} catch (e) {
			console.error(`Failed to render ${path}`, e);
			let source = '';
			try {
				source = await loader();
			} catch {
				/* ignore */
			}
			return {
				ok: false,
				html: '',
				raw: source,
				meta: source ? parseFrontmatter(source) : {},
				slug,
				path,
				sourcePath,
				error: e
			};
		}
	}

	return null;
}
