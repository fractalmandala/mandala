/**
 * Vault markdown → HTML (not Svelte). Safe for wiki content with `<500`, `{…}`, etc.
 */
import { Marked } from 'marked';
import { rewriteMdHref } from './md-links.js';

function stripFrontmatter(source: string): string {
	const match = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
	return match ? source.slice(match[0].length) : source;
}

/**
 * Render markdown body to HTML, rewriting local .md links to /docs routes.
 * @param source - full file including optional frontmatter
 * @param fromFile - Vite path e.g. `/src/content/projects/INDEX.md`
 */
export function renderMarkdown(source: string, fromFile: string): string {
	const body = stripFrontmatter(source);
	const marked = new Marked();

	marked.use({
		gfm: true,
		breaks: false,
		walkTokens(token) {
			if (
				(token.type === 'link' || token.type === 'image') &&
				typeof (token as { href?: string }).href === 'string'
			) {
				const t = token as { href: string };
				t.href = rewriteMdHref(t.href, fromFile);
			}
		}
	});

	const result = marked.parse(body, { async: false });
	return typeof result === 'string' ? result : '';
}
