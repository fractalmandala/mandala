import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'@': 'src/lib',
			'$site': 'src/site',
			'$examples': 'src/examples',
			'@fractaldesign/fractal-svelte': 'src/lib'
		}
	}
};
export default config;
