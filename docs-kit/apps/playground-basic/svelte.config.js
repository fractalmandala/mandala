import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { docsMarkdown, docsMdsvex } from '@docs-kit/mdsvex';
import { mdsvex } from 'mdsvex';

const docsPipeline = docsMdsvex();

/** @type {import('@sveltejs/kit').Config} */
const config = {
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
		adapter: adapter()
	}
};

export default config;
