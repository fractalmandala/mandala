import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createAcrollsMdsvexOptions } from '@acrolls/mdsvex';

const acrolls = createAcrollsMdsvexOptions({
  // no default layout — you wrap with Publication in the page/layout
  extensions: ['.md', '.svx']
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [
		vitePreprocess(),
		mdsvex(acrolls)
	],
	kit: {
		adapter: adapter({
			runtime: 'nodejs24.x'
		})
	}
};

export default config;
