import { sveltekit } from '@sveltejs/kit/vite';
import { docs } from '@docs-kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		docs({ content: "src/lib/docs", basePath: "/docs" }),
		sveltekit()
	]
});
