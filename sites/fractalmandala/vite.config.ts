import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fractalsStyler } from 'fractals-styler';

export default defineConfig({
	plugins: [
		fractalsStyler(),
		sveltekit()
	],
	optimizeDeps: {
		exclude: ['fractals-styler']
	},
	ssr: {
		noExternal: ['@lucide/svelte']
	}
});