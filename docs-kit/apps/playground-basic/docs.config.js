import { defineDocsConfig } from '@docs-kit/core';

export default defineDocsConfig({
	site: {
		title: 'Acme Documentation',
		description: 'The docs-kit playground documentation.',
		url: 'https://example.com'
	},
	collections: [
		{ id: 'default', content: 'src/lib/docs', basePath: '/docs' },
		{ id: 'guide', content: 'src/lib/guide', basePath: '/guide' }
	],
	// Mirrors the `openapi` option passed to the Vite plugin, so `docs generate` produces
	// the same pages outside a bundler run.
	openapi: [{ id: 'api', source: 'openapi.json' }]
});
