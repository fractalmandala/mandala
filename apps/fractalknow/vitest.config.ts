import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		conditions: ['browser'],
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
			'$app/environment': fileURLToPath(new URL('./src/test/app-environment.ts', import.meta.url)),
		},
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['src/test/setup.ts'],
	},
});
