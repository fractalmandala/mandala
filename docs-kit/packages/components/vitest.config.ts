import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte()],
	test: {
		environment: 'jsdom',
		// Enables Testing Library's automatic DOM cleanup between tests.
		globals: true,
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/**/*.test.ts'],
		alias: [{ find: /^@docs-kit\/components$/, replacement: new URL('./src/index.js', import.meta.url).pathname }]
	},
	resolve: {
		conditions: ['browser']
	}
});
