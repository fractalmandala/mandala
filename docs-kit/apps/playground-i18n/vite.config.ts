import { sveltekit } from '@sveltejs/kit/vite';
import { docs } from '@docs-kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		docs({
			content: 'src/lib/docs',
			basePath: '/docs',
			versions: {
				current: 'v2',
				versions: [
					{ id: 'v2', label: 'Latest', source: 'src/lib/docs' },
					{ id: 'v1', label: 'Version 1', source: 'src/lib/docs-v1' }
				]
			},
			i18n: {
				defaultLocale: 'en',
				locales: [
					{ id: 'en', label: 'English' },
					{ id: 'de', label: 'Deutsch' }
				]
			},
			seo: { siteUrl: 'https://example.com', siteName: 'Acme Documentation' }
		}),
		sveltekit()
	]
});
