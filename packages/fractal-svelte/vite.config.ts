/// <reference types="vitest/config" />
import path from 'node:path';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		conditions: ['browser']
	},
	esbuild: {
		target: 'esnext'
	},
	build: {
		target: 'esnext'
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'esnext'
		}
	},
	test: {
		include: ['tests/**/*.test.ts'],
		environment: 'jsdom',
		setupFiles: ['tests/setup.ts'],
		server: { deps: { inline: ['svelte'] } },
		alias: {
			'@humanspeak/svelte-motion': path.resolve('tests/mocks/motion.ts')
		}
	}
});
