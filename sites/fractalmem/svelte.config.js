import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import remarkGfm from 'remark-gfm';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'],
			remarkPlugins: [remarkGfm]
		})
	],
	extensions: ['.svelte', '.md', '.svx'],
	kit: {
		adapter: adapter({
			runtime: 'nodejs24.x'
		})
	}
};

export default config;
