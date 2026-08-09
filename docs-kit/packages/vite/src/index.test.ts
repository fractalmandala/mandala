import { EventEmitter } from 'node:events';
import { mkdtemp, mkdir, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { docs, findDocsRouteConflicts, virtualManifestId } from './index.js';

import type { Plugin, PluginContext, ResolvedConfig, ViteDevServer } from 'vite';

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { force: true, recursive: true })));
});

function hook<T>(plugin: Plugin, name: keyof Plugin): T {
	return plugin[name] as T;
}

async function configuredPlugin(root: string): Promise<Plugin> {
	const plugin = docs({ content: 'src/lib/docs' });
	const configResolved = hook<(config: ResolvedConfig) => void>(plugin, 'configResolved');
	configResolved({ root } as ResolvedConfig);
	return plugin;
}

async function flushWatcher(): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 0));
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('docs', () => {
	it('discovers core content and registers the content root and sources during builds', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		const contentRoot = join(root, 'src/lib/docs');
		await mkdir(join(contentRoot, 'guides'), { recursive: true });
		await writeFile(join(contentRoot, 'index.md'), '# Home');
		await writeFile(join(contentRoot, 'guides/intro.svx'), '# Intro');

		const plugin = await configuredPlugin(root);
		const watchedPaths: string[] = [];
		const buildStart = hook<(this: PluginContext) => Promise<void>>(plugin, 'buildStart');
		await buildStart.call({ addWatchFile: (file) => watchedPaths.push(file) } as PluginContext);

		expect(watchedPaths).toEqual([
			contentRoot,
			join(contentRoot, 'guides/intro.svx'),
			join(contentRoot, 'index.md')
		]);
	});

	it('resolves the typed virtual manifest with safe serializable data and explicit lazy importers', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		const contentRoot = join(root, 'src/lib/docs');
		const sourcePath = join(contentRoot, 'getting-started.md');
		const guidePath = join(contentRoot, 'guides/intro.svx');
		await mkdir(contentRoot, { recursive: true });
		await writeFile(sourcePath, '# Getting started');
		await mkdir(join(contentRoot, 'guides'), { recursive: true });
		await writeFile(guidePath, '# Guide intro');

		const plugin = await configuredPlugin(root);
		const resolveId = hook<(id: string) => string | undefined>(plugin, 'resolveId');
		const load = hook<(id: string) => Promise<string | undefined>>(plugin, 'load');

		expect(resolveId(virtualManifestId)).toBe(`\0${virtualManifestId}`);
		expect(resolveId('virtual:docs-kit/other')).toBeUndefined();

		const code = await load(`\0${virtualManifestId}`);
		expect(code).toContain(`"getting-started": () => import(${JSON.stringify(sourcePath)})`);
		expect(code).toContain(`"guides/intro": () => import(${JSON.stringify(guidePath)})`);
		expect(code).not.toContain('import * as');
		expect(code).not.toContain('pageModules');
		expect(code).not.toContain('sourcePath');

		const manifestJson = code?.match(/export const manifest = ([\s\S]+?);/)?.[1];
		expect(manifestJson).toBeDefined();
		const generatedManifest = JSON.parse(manifestJson ?? '') as { configHash: string; pages: unknown[] };
		expect(generatedManifest.configHash).toEqual(expect.any(String));
		expect(generatedManifest.pages).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: 'getting-started.md',
					source: { relativePath: 'getting-started.md', extension: '.md' },
					slug: 'getting-started',
					slugSegments: ['getting-started'],
					pathname: '/getting-started',
					title: 'Getting started',
					label: 'Getting started',
					headings: [{ id: 'getting-started', text: 'Getting started', depth: 1, line: 1 }]
				}),
				expect.objectContaining({
					id: 'guides/intro.svx',
					source: { relativePath: 'guides/intro.svx', extension: '.svx' },
					slug: 'guides/intro',
					slugSegments: ['guides', 'intro'],
					pathname: '/guides/intro',
					title: 'Guide intro'
				})
			])
		);
	});

	it('discovers version and locale source matrices without colliding importer keys', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		const sourceRoots = ['docs-v2/en', 'docs-v2/de', 'docs-v1/en', 'docs-v1/de'];
		for (const sourceRoot of sourceRoots) {
			await mkdir(join(root, 'src/lib', sourceRoot), { recursive: true });
			await writeFile(join(root, 'src/lib', sourceRoot, 'intro.md'), `# ${sourceRoot}`);
		}

		const plugin = docs({
			content: 'src/lib/docs',
			versions: {
				current: 'v2',
				versions: [
					{ id: 'v2', label: 'Latest', source: 'src/lib/docs-v2' },
					{ id: 'v1', label: 'Version 1', source: 'src/lib/docs-v1' }
				]
			},
			i18n: {
				defaultLocale: 'en',
				locales: ['en', 'de']
			},
			basePath: '/docs'
		});
		const configResolved = hook<(config: ResolvedConfig) => void>(plugin, 'configResolved');
		configResolved({ root } as ResolvedConfig);
		const load = hook<(id: string) => Promise<string | undefined>>(plugin, 'load');
		const code = await load(`\0${virtualManifestId}`);
		const manifestJson = code?.match(/export const manifest = ([\s\S]+?);/)?.[1];
		const generatedManifest = JSON.parse(manifestJson ?? '') as {
			pages: Array<{ id: string; pathname: string; version?: string; locale?: string }>;
			versions: unknown[];
			locales: unknown[];
		};

		expect(generatedManifest.pages).toHaveLength(4);
		expect(generatedManifest.pages.map((entry) => entry.id)).toEqual([
			'v1/de/intro.md',
			'v1/en/intro.md',
			'v2/de/intro.md',
			'v2/en/intro.md'
		]);
		expect(generatedManifest.pages.map((entry) => entry.pathname)).toEqual([
			'/docs/v1/de/intro',
			'/docs/v1/intro',
			'/docs/de/intro',
			'/docs/intro'
		]);
		expect(generatedManifest.versions).toHaveLength(2);
		expect(generatedManifest.locales).toHaveLength(2);
		expect(code).toContain(
			`"v2/en/intro.md": () => import(${JSON.stringify(join(root, 'src/lib/docs-v2/en/intro.md'))})`
		);
	});

	it('refreshes add, change, and unlink events before invalidating modules and reloading', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		const contentRoot = join(root, 'src/lib/docs');
		const sourcePath = join(contentRoot, 'getting-started.md');
		const addedSourcePath = join(contentRoot, 'guide.md');
		await mkdir(contentRoot, { recursive: true });
		await writeFile(sourcePath, '# Getting started');

		const watcher = new EventEmitter() as EventEmitter & { add(path: string): void };
		const watchedDirectories: string[] = [];
		watcher.add = (path) => watchedDirectories.push(path);
		const httpServer = new EventEmitter();
		const contentModule = {};
		const virtualModule = {};
		const invalidated: unknown[] = [];
		const messages: unknown[] = [];
		const server = {
			watcher,
			httpServer,
			moduleGraph: {
				getModulesByFile: (file: string) => (file === sourcePath ? new Set([contentModule]) : undefined),
				getModuleById: (id: string) => (id === `\0${virtualManifestId}` ? virtualModule : undefined),
				invalidateModule: (candidate: unknown) => invalidated.push(candidate)
			},
			ws: {
				send: (message: unknown) => messages.push(message)
			}
		} as unknown as ViteDevServer;

		const plugin = await configuredPlugin(root);
		const configureServer = hook<(server: ViteDevServer) => void>(plugin, 'configureServer');
		configureServer(server);
		configureServer(server);

		await writeFile(addedSourcePath, '# Guide');
		watcher.emit('add', addedSourcePath);
		await flushWatcher();
		await writeFile(sourcePath, '# Updated getting started');
		watcher.emit('change', sourcePath);
		await flushWatcher();
		await unlink(sourcePath);
		watcher.emit('unlink', sourcePath);
		await flushWatcher();
		watcher.emit('change', join(contentRoot, 'image.png'));
		watcher.emit('unlink', join(root, 'outside.md'));

		expect(watchedDirectories).toEqual([contentRoot]);
		expect(invalidated).toEqual([
			virtualModule,
			contentModule,
			virtualModule,
			contentModule,
			virtualModule
		]);
		expect(messages).toEqual([
			{ type: 'full-reload', path: '*' },
			{ type: 'full-reload', path: '*' },
			{ type: 'full-reload', path: '*' }
		]);

		httpServer.emit('close');
		expect(watcher.listenerCount('add')).toBe(0);
		expect(watcher.listenerCount('change')).toBe(0);
		expect(watcher.listenerCount('unlink')).toBe(0);
	});

	it('rejects absolute content directories to keep resolution anchored to the Vite root', () => {
		const plugin = docs({ content: '/outside/docs' });
		const configResolved = hook<(config: ResolvedConfig) => void>(plugin, 'configResolved');

		expect(() => configResolved({ root: '/project' } as ResolvedConfig)).toThrow(
			'@docs-kit/vite expects `content` to be relative to the Vite root.'
		);
	});
});

describe('docs with synced content sources', () => {
	async function projectWithCache(): Promise<{ root: string; cacheDir: string }> {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		const contentRoot = join(root, 'src/lib/docs');
		const cacheDir = join(root, '.docs-kit/cache/sources');
		await mkdir(join(contentRoot, 'en'), { recursive: true });
		await mkdir(join(contentRoot, 'de'), { recursive: true });
		await writeFile(join(contentRoot, 'en/index.md'), '# Home');
		await writeFile(join(contentRoot, 'de/index.md'), '# Start');
		await mkdir(join(cacheDir, 'handbook/team'), { recursive: true });
		await writeFile(join(cacheDir, 'handbook/team/onboarding.md'), '# Onboarding');
		await writeFile(
			join(cacheDir, 'index.json'),
			JSON.stringify({
				version: 1,
				sources: [
					{
						sourceId: 'handbook',
						status: 'fetched',
						entries: [
							{
								relativePath: 'team/onboarding.md',
								contentHash: 'fnv1a-00000000',
								origin: { type: 'github' },
								locale: 'de'
							}
						]
					}
				]
			})
		);

		return { root, cacheDir };
	}

	it('compiles cached remote documents alongside local content with their dimensions', async () => {
		const { root } = await projectWithCache();
		const plugin = docs({
			content: 'src/lib/docs',
			sourceCacheDir: '.docs-kit/cache/sources',
			i18n: { defaultLocale: 'en', locales: ['en', 'de'] }
		});
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root } as ResolvedConfig);

		const load = hook<(id: string) => Promise<string>>(plugin, 'load');
		const code = await load.call({} as PluginContext, `\0${virtualManifestId}`);
		const manifest = JSON.parse(
			code.slice(code.indexOf('{'), code.lastIndexOf('};\n\nexport const pageImporters') + 1)
		);

		expect(manifest.pages.map((page: { pathname: string }) => page.pathname).sort()).toEqual([
			'/',
			'/de',
			'/de/team/onboarding'
		]);
		expect(code).toContain('team/onboarding.md');
	});

	it('ignores a source cache directory that has not been synced yet', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'src/lib/docs'), { recursive: true });
		await writeFile(join(root, 'src/lib/docs/index.md'), '# Home');

		const plugin = docs({ content: 'src/lib/docs', sourceCacheDir: '.docs-kit/cache/sources' });
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root } as ResolvedConfig);
		const load = hook<(id: string) => Promise<string>>(plugin, 'load');

		expect(await load.call({} as PluginContext, `\0${virtualManifestId}`)).toContain('index.md');
	});
});

describe('docs search records', () => {
	it('exposes a virtual search module built from the same manifest', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		const contentRoot = join(root, 'src/lib/docs');
		await mkdir(join(contentRoot, 'guides'), { recursive: true });
		await writeFile(
			join(contentRoot, 'index.md'),
			'---\ntitle: Home\n---\n\n# Home\n\nWelcome.\n\n## Details\n\nMore text.'
		);
		await writeFile(join(contentRoot, 'guides/draft.md'), '---\ntitle: Draft\ndraft: true\n---\n\nHidden.');

		const plugin = docs({ content: 'src/lib/docs', basePath: '/docs' });
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root } as ResolvedConfig);
		const load = hook<(id: string) => Promise<string>>(plugin, 'load');

		const code = await load.call({} as PluginContext, '\0virtual:docs-kit/search');
		const records = JSON.parse(code.slice(code.indexOf('['), code.lastIndexOf(']') + 1));

		expect(records.map((record: { pathname: string }) => record.pathname)).toEqual([
			'/docs',
			'/docs#details'
		]);
		expect(records[0].body).toContain('Welcome.');
	});

	it('can be turned off', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'src/lib/docs'), { recursive: true });
		await writeFile(join(root, 'src/lib/docs/index.md'), '# Home');

		const plugin = docs({ content: 'src/lib/docs', search: false });
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root } as ResolvedConfig);
		const load = hook<(id: string) => Promise<string>>(plugin, 'load');

		expect(await load.call({} as PluginContext, '\0virtual:docs-kit/search')).toContain(
			'searchRecords = []'
		);
	});
});

describe('docs seo artifacts', () => {
	it('writes sitemap, robots, and Open Graph cards into the static directory', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		const contentRoot = join(root, 'src/lib/docs');
		await mkdir(join(contentRoot, 'guides'), { recursive: true });
		await writeFile(join(contentRoot, 'index.md'), '---\ntitle: Home\n---\n\n# Home');
		await writeFile(join(contentRoot, 'guides/deploy.md'), '---\ntitle: Deploy\n---\n\n# Deploy');
		await writeFile(join(contentRoot, 'guides/draft.md'), '---\ntitle: Draft\ndraft: true\n---\n\nx');

		const plugin = docs({
			content: 'src/lib/docs',
			basePath: '/docs',
			seo: { siteUrl: 'https://acme.com', siteName: 'Acme' }
		});
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root } as ResolvedConfig);
		const buildStart = hook<(this: PluginContext) => Promise<void>>(plugin, 'buildStart');
		await buildStart.call({ addWatchFile: () => {} } as unknown as PluginContext);

		const sitemap = await readFile(join(root, 'static/sitemap.xml'), 'utf8');
		expect(sitemap).toContain('<loc>https://acme.com/docs</loc>');
		expect(sitemap).toContain('<loc>https://acme.com/docs/guides/deploy</loc>');
		expect(sitemap).not.toContain('draft');

		expect(await readFile(join(root, 'static/robots.txt'), 'utf8')).toContain(
			'Sitemap: https://acme.com/sitemap.xml'
		);
		expect(await readFile(join(root, 'static/og/guides-deploy.svg'), 'utf8')).toContain('Deploy');
	});

	it('writes nothing when seo is not configured', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'src/lib/docs'), { recursive: true });
		await writeFile(join(root, 'src/lib/docs/index.md'), '# Home');

		const plugin = docs({ content: 'src/lib/docs' });
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root } as ResolvedConfig);
		const buildStart = hook<(this: PluginContext) => Promise<void>>(plugin, 'buildStart');
		await buildStart.call({ addWatchFile: () => {} } as unknown as PluginContext);

		await expect(readFile(join(root, 'static/sitemap.xml'), 'utf8')).rejects.toThrow();
	});
});

describe('docs raw sources', () => {
	it('exposes raw Markdown keyed by page id', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'src/lib/docs'), { recursive: true });
		await writeFile(join(root, 'src/lib/docs/index.md'), '---\ntitle: Home\n---\n\n# Home');

		const plugin = docs({ content: 'src/lib/docs', basePath: '/docs' });
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root } as ResolvedConfig);
		const load = hook<(id: string) => Promise<string>>(plugin, 'load');

		const code = await load.call({} as PluginContext, '\0virtual:docs-kit/raw');
		const sources = JSON.parse(code.slice(code.indexOf('{'), code.lastIndexOf('}') + 1));

		expect(sources['index.md']).toContain('# Home');
		expect(
			await load.call({} as PluginContext, '\0virtual:docs-kit/raw')
		).toBe(code);
	});

	it('can be turned off', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'src/lib/docs'), { recursive: true });
		await writeFile(join(root, 'src/lib/docs/index.md'), '# Home');

		const plugin = docs({ content: 'src/lib/docs', raw: false });
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root } as ResolvedConfig);
		const load = hook<(id: string) => Promise<string>>(plugin, 'load');

		expect(await load.call({} as PluginContext, '\0virtual:docs-kit/raw')).toBe(
			'export const rawSources = {};\n'
		);
	});
});

describe('collection route conflicts', () => {
	it('discovers static and dynamic route overlaps but excludes intended collection catch-alls', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-routes-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'docs/[...slug]'), { recursive: true });
		await mkdir(join(root, 'docs/api'), { recursive: true });
		await mkdir(join(root, 'guide/[id]'), { recursive: true });
		await mkdir(join(root, '(marketing)/about'), { recursive: true });
		await writeFile(join(root, 'docs/[...slug]/+page.svelte'), '<h1>Docs</h1>');
		await writeFile(join(root, 'docs/api/+page.svelte'), '<h1>Conflict</h1>');
		await writeFile(join(root, 'guide/[id]/+page.svelte'), '<h1>Dynamic conflict</h1>');
		await writeFile(join(root, '(marketing)/about/+page.svelte'), '<h1>Host</h1>');

		const conflicts = findDocsRouteConflicts(root, [
			{ id: 'default', content: 'src/lib/docs', basePath: '/docs' },
			{ id: 'guide', content: 'src/lib/guide', basePath: '/guide' }
		]);

		expect(conflicts.map((conflict) => [conflict.collection, conflict.route, conflict.dynamic])).toEqual([
			['default', '/docs/api', false],
			['guide', '/guide', true]
		]);
	});

	it('matches physical route mounts case-insensitively', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-case-routes-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'Docs/reference'), { recursive: true });
		await writeFile(join(root, 'Docs/reference/+page.svelte'), '<h1>Case conflict</h1>');

		expect(findDocsRouteConflicts(root, [
			{ id: 'default', content: 'src/lib/docs', basePath: '/docs' }
		])).toEqual([
			expect.objectContaining({ collection: 'default', route: '/Docs/reference', dynamic: false })
		]);
	});

	it('does not exempt a differently cased configured mount from a catch-all conflict', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-case-catchall-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'docs/[...slug]'), { recursive: true });
		await writeFile(join(root, 'docs/[...slug]/+page.svelte'), '<h1>Docs</h1>');

		expect(findDocsRouteConflicts(root, [
			{ id: 'default', content: 'src/lib/docs', basePath: '/Docs' }
		])).toEqual([
			expect.objectContaining({ collection: 'default', route: '/docs', dynamic: true })
		]);
	});

	it('rejects case-variant collection mount paths during plugin normalization', () => {
		const plugin = docs({
			collections: [
				{ id: 'docs', content: 'src/lib/docs', basePath: '/docs' },
				{ id: 'guide', content: 'src/lib/guide', basePath: '/Docs' }
			]
		});
		expect(() => hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root: '/project' } as ResolvedConfig)).toThrow(
			'duplicate collection base path'
		);
	});
});

describe('docs openapi', () => {
	const spec = {
		openapi: '3.1.0',
		info: { title: 'Petstore', version: '1.0.0', description: 'A tiny API.' },
		tags: [{ name: 'pets' }],
		paths: {
			'/pets': {
				get: {
					operationId: 'listPets',
					summary: 'List pets',
					tags: ['pets'],
					responses: { '200': { description: 'ok' } }
				}
			}
		}
	};

	async function project(): Promise<string> {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-vite-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'src/lib/docs'), { recursive: true });
		await writeFile(join(root, 'src/lib/docs/index.md'), '---\ntitle: Home\n---\n\n# Home');
		await writeFile(join(root, 'openapi.json'), JSON.stringify(spec));
		return root;
	}

	it('compiles a specification into ordinary manifest pages', async () => {
		const root = await project();
		const plugin = docs({
			content: 'src/lib/docs',
			basePath: '/docs',
			openapi: [{ id: 'api', source: 'openapi.json' }]
		});
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root } as ResolvedConfig);

		const load = hook<(id: string) => Promise<string>>(plugin, 'load');
		const code = await load.call({} as PluginContext, `\0${virtualManifestId}`);
		const manifest = JSON.parse(
			code.slice(code.indexOf('{'), code.lastIndexOf('};\n\nexport const pageImporters') + 1)
		);
		const pathnames = manifest.pages.map((page: { pathname: string }) => page.pathname).sort();

		expect(pathnames).toContain('/docs/api');
		expect(pathnames).toContain('/docs/api/operations/listpets');
		expect(pathnames).toContain('/docs/api/pets');

		// API pages participate in navigation like any other page.
		const navigation = JSON.stringify(manifest.navigation);
		expect(navigation).toContain('Petstore');
		expect(navigation).toContain('List pets');
	});

	it('includes API pages in search records and the sitemap', async () => {
		const root = await project();
		const plugin = docs({
			content: 'src/lib/docs',
			basePath: '/docs',
			openapi: [{ id: 'api', source: 'openapi.json' }],
			seo: { siteUrl: 'https://acme.com' }
		});
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({ root } as ResolvedConfig);

		const load = hook<(id: string) => Promise<string>>(plugin, 'load');
		const search = await load.call({} as PluginContext, `\0virtual:docs-kit/search`);
		expect(search).toContain('/docs/api/operations/listpets');

		const buildStart = hook<(this: PluginContext) => Promise<void>>(plugin, 'buildStart');
		await buildStart.call({ addWatchFile: () => {} } as unknown as PluginContext);
		expect(await readFile(join(root, 'static/sitemap.xml'), 'utf8')).toContain(
			'https://acme.com/docs/api/operations/listpets'
		);
	});

	it('fails the build with a useful message for a malformed specification', async () => {
		const root = await project();
		await writeFile(join(root, 'openapi.json'), JSON.stringify({ swagger: '2.0' }));

		const plugin = docs({
			content: 'src/lib/docs',
			openapi: [{ id: 'api', source: 'openapi.json' }]
		});
		hook<(config: ResolvedConfig) => void>(plugin, 'configResolved')({
			root,
			logger: { warn: () => {} }
		} as unknown as ResolvedConfig);

		const load = hook<(id: string) => Promise<string>>(plugin, 'load');
		await expect(load.call({} as PluginContext, `\0${virtualManifestId}`)).rejects.toThrow(
			/Swagger 2.0 is not supported/
		);
	});
});
