import { sveltekit } from '@sveltejs/kit/vite';
import { fractalsStyler } from 'fractals-styler';
import { defineConfig } from 'vite';

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