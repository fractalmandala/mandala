import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import fractalsStyler from 'fractals-styler';
import { defineConfig } from 'vite';

/**
 * Vault markdown is NOT compiled as Svelte/mdsvex — it is loaded as raw text and
 * rendered with `marked` (see content-page.ts). That avoids Svelte parse failures
 * on wiki content (`<500`, `{…}`, angle brackets in prose, etc.).
 */
export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			prerender: {
				// Start crawl from home + docs index; slug pages also come from entries()
				entries: ['/', '/docs'],
				// Skip-link hashes / rare vault cross-links / dynamic remainder
				handleMissingId: 'warn',
				handleHttpError: 'warn',
				handleUnseenRoutes: 'warn'
			}
		}),
		fractalsStyler({
			// Scan app shell + docs UI for JIT utility classes (gapN, padN, …)
			content: [
				'src/**/*.{svelte,html,js,ts}',
				'src/lib/**/*.{svelte,ts}'
			]
		})
	]
});
