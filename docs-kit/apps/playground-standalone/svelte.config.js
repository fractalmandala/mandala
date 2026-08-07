import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { docsMarkdown, docsMdsvex } from '@docs-kit/mdsvex';
import { mdsvex } from 'mdsvex';

const docsPipeline = docsMdsvex();

/** @type {import('@sveltejs/kit').Config} */
export default {
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [
		vitePreprocess(),
		docsMarkdown(),
		mdsvex({
			extensions: ['.md', '.svx'],
			remarkPlugins: docsPipeline.remarkPlugins,
			rehypePlugins: docsPipeline.rehypePlugins,
			highlight: docsPipeline.highlight
		})
	],
	kit: {
		adapter: adapter({ fallback: '404.html' })
	}
};
