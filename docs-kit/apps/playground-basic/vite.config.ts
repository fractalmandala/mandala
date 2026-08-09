import { sveltekit } from '@sveltejs/kit/vite';
import { docs } from '@docs-kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		docs({
			collections: [
				{ id: 'default', content: 'src/lib/docs', basePath: '/docs' },
				{ id: 'guide', content: 'src/lib/guide', basePath: '/guide' }
			],
			openapi: [{ id: 'api', source: 'openapi.json' }],
			seo: { siteUrl: 'https://example.com', siteName: 'Acme Documentation' }
		}),
		sveltekit()
	]
});
