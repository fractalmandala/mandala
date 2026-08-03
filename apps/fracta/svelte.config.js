import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: ({ filename }) =>
			filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter({
			// Named distinctly from index.html — the real prerendered root page — so the
			// adapter cannot overwrite it with the SPA fallback shell during build. Tauri
			// loads build/index.html directly and has no server-side routing that would
			// need this fallback; it exists only for parity with static web deploys.
			fallback: 'app-fallback.html'
		})
	}
};

export default config;
