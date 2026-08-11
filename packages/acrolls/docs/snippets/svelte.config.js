import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createAcrollsMdsvexPreprocessor } from '@acrolls/mdsvex';

const acrolls = createAcrollsMdsvexPreprocessor({
	extensions: ['.md', '.svx']
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [vitePreprocess(), acrolls],
	kit: {
		adapter: adapter()
	}
};

export default config;
