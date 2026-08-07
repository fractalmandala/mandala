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
		// Production builds use a separate generated directory so an active dev server
		// cannot race Vite while both clean/write `.svelte-kit/output`.
		outDir: process.env.FRACTALENGINE_BUILD_OUT_DIR || '.svelte-kit',
		adapter: adapter({
			// Named distinctly from index.html — the real prerendered root page — to avoid
			// the adapter overwriting it with the SPA fallback shell during build. Tauri's
			// frontendDist loads build/index.html directly and has no server-side routing
			// that would need this fallback file at all; it only exists for parity with
			// browser-hosted static deploys.
			fallback: 'app-fallback.html'
		})
	}
};

export default config;
