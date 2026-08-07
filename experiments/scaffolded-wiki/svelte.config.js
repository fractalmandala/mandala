import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { parseFrontmatter, escapeBracesRemark } from './lib/frontmatter.mjs';
import { shikiHighlighter } from './lib/highlight.mjs';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Markdown is compiled to Svelte components via mdsvex (same setup as
	// sites/fractalmandala). The repowiki `.md` files are imported through the
	// `$wiki` alias defined in vite.config.ts and rendered as components.
	// A custom frontmatter parser keeps rendering tolerant of the generated
	// content's YAML quirks (trailing/embedded colons, leading `- `).
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'],
			frontmatter: {
				type: 'yaml',
				marker: '-',
				parse: (fm) => parseFrontmatter(fm)
			},
			// Escape literal braces in prose at the MDAST level (after markdown
			// parsing) so Svelte never parses `{{key}}` / `{ ... }` examples in
			// the wiki content as template expressions.
			remarkPlugins: [escapeBracesRemark],
			// Shiki syntax highlighting (replaces mdsvex's default Prism).
			highlight: {
				highlighter: shikiHighlighter,
				optimise: true
			}
		})
	],
	extensions: ['.svelte', '.md', '.svx'],
	kit: {
		adapter: adapter()
	}
};

export default config;
