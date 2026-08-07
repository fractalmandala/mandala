import { describe, expect, it } from 'vitest';

import { resolveDocsConfig } from './config.js';

describe('collection configuration', () => {
	it('normalizes legacy content into the default collection without changing its route', () => {
		const config = resolveDocsConfig({
			site: { title: 'Docs' },
			content: { directory: 'src/lib/docs' },
			routing: { basePath: '/docs/' }
		});
		expect(config.collections).toEqual([
			{ id: 'default', content: 'src/lib/docs', basePath: '/docs' }
		]);
		expect(config.content.directory).toBe('src/lib/docs');
	});

	it('accepts deterministic multiple collection records and rejects ambiguous configurations', () => {
		const config = resolveDocsConfig({
			site: { title: 'Docs' },
			collections: [
				{ id: 'guide', content: 'src/lib/guide', basePath: '/guide' },
				{ id: 'product', content: 'src/lib/docs', basePath: '/docs' }
			]
		});
		expect(config.collections.map((collection) => collection.id)).toEqual(['guide', 'product']);

		expect(() => resolveDocsConfig({
			site: { title: 'Docs' },
			content: { directory: 'src/lib/docs' },
			collections: [{ id: 'guide', content: 'src/lib/guide', basePath: '/guide' }]
		})).toThrow('either legacy `content` + `routing.basePath` or `collections`');
		expect(() => resolveDocsConfig({
			site: { title: 'Docs' },
			collections: [
				{ id: 'guide', content: 'src/lib/guide', basePath: '/guide' },
				{ id: 'other', content: 'src/lib/other', basePath: '/guide/reference' }
			]
		})).toThrow('Overlapping docs collection base paths');
		expect(() => resolveDocsConfig({
			site: { title: 'Docs' },
			collections: [{ id: 'Guide!', content: '/outside', basePath: 'guide' }]
		})).toThrow('must match');
	});

	it('rejects unknown nested fields and invalid runtime values before consumers use them', () => {
		const resolve = (config: unknown) => resolveDocsConfig(config as Parameters<typeof resolveDocsConfig>[0]);
		expect(() => resolve({ site: { title: 'Docs', slogan: 'Unknown' } })).toThrow('in "site": slogan');
		expect(() => resolve({ site: { title: 'Docs' }, routing: { basePath: '/docs', trailingSlash: 'always' } })).toThrow('in "routing": trailingSlash');
		expect(() => resolve({ site: { title: 'Docs' }, routing: { versionPrefix: 'sometimes' } })).toThrow('routing.versionPrefix');
		expect(() => resolve({ site: { title: 'Docs', url: '/relative' } })).toThrow('site.url');
		expect(() => resolve({ site: { title: 'Docs' }, i18n: { defaultLocale: 'en', locales: [{ id: 'en', dir: 'sideways' }] } })).toThrow('i18n.locales[0].dir');
		expect(() => resolve({ site: { title: 'Docs' }, sources: { onConflict: 'merge' } })).toThrow('sources.onConflict');
		expect(() => resolve({ site: { title: 'Docs' }, sources: { entries: [{ id: 'local', type: 'local', root: 'docs', surprise: true }] } })).toThrow('sources.entries[0]');
		expect(() => resolve({ site: { title: 'Docs' }, sources: { entries: [{ id: 'local', type: 'local', root: 'docs', priority: 'high' }] } })).toThrow('priority');
	});

	it('validates required options for every configured source discriminator', () => {
		const resolve = (entries: unknown[]) =>
			resolveDocsConfig({ site: { title: 'Docs' }, sources: { entries } } as Parameters<typeof resolveDocsConfig>[0]);
		expect(() => resolve([{ id: 'local', type: 'local' }])).toThrow('entries[0].root');
		expect(() => resolve([{ id: 'remote', type: 'remote-markdown' }])).toThrow('entries[0].documents');
		expect(() => resolve([{ id: 'github', type: 'github' }])).toThrow('entries[0].repository');
		expect(() => resolve([{ id: 'releases', type: 'github-releases' }])).toThrow('entries[0].repository');
		expect(() => resolve([{ id: 'notion', type: 'notion' }])).toThrow('requires a "tokenEnv" or "token"');
		expect(() => resolve([{ id: 'sanity', type: 'sanity', projectId: 'project' }])).toThrow('entries[0].dataset');

		expect(resolve([
			{ id: 'local', type: 'local', root: 'docs' },
			{ id: 'remote', type: 'remote-markdown', documents: [{ url: 'https://example.com/guide.md', path: 'guide.md' }] },
			{ id: 'github', type: 'github', repository: 'acme/docs' },
			{ id: 'releases', type: 'github-releases', repository: 'acme/docs' },
			{ id: 'notion', type: 'notion', tokenEnv: 'NOTION_TOKEN' },
			{ id: 'sanity', type: 'sanity', projectId: 'project', dataset: 'production' }
		]).sources.entries).toHaveLength(6);
	});

	it('treats collection mount paths as case-insensitive for uniqueness and overlap checks', () => {
		expect(() => resolveDocsConfig({
			site: { title: 'Docs' },
			collections: [
				{ id: 'docs', content: 'docs', basePath: '/docs' },
				{ id: 'guide', content: 'guide', basePath: '/Docs' }
			]
		})).toThrow('Duplicate docs collection base path');
		expect(() => resolveDocsConfig({
			site: { title: 'Docs' },
			collections: [
				{ id: 'docs', content: 'docs', basePath: '/Docs' },
				{ id: 'guide', content: 'guide', basePath: '/docs/reference' }
			]
		})).toThrow('Overlapping docs collection base paths');
	});
});
