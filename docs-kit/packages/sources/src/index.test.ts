import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createDocsSource } from './factory.js';
import { githubReleasesSource } from './github-releases.js';
import { githubSource } from './github.js';
import { assertSafeUrl, fetchText, DocsSourceFetchError, type DocsFetch } from './http.js';
import { localSource } from './local.js';
import { notionBlocksToMarkdown, notionSource } from './notion.js';
import { remoteMarkdownSource } from './remote-markdown.js';
import { sanitizeRemoteMarkdown, toMarkdownPath } from './sanitize.js';
import { sanitySource } from './sanity.js';
import { syncDocsSources } from './sync.js';

const temporaryRoots: string[] = [];

async function makeTemporaryDirectory(): Promise<string> {
	const directory = await mkdtemp(join(tmpdir(), 'docs-kit-sources-'));
	temporaryRoots.push(directory);
	return directory;
}

function jsonResponse(body: unknown, init: { status?: number } = {}): Response {
	return new Response(JSON.stringify(body), {
		status: init.status ?? 200,
		headers: { 'content-type': 'application/json' }
	});
}

function routedFetch(routes: Record<string, () => Response>): { fetch: DocsFetch; calls: string[] } {
	const calls: string[] = [];
	const fetch: DocsFetch = async (url) => {
		calls.push(url);
		const route = Object.entries(routes).find(([pattern]) => url.includes(pattern));
		return route ? route[1]() : new Response('not found', { status: 404 });
	};

	return { fetch, calls };
}

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('sanitizeRemoteMarkdown', () => {
	it('removes executable markup and neutralizes expressions outside code', () => {
		const sanitized = sanitizeRemoteMarkdown(
			[
				'<script>fetch("/steal")</script>',
				'<svelte:head><title>x</title></svelte:head>',
				'Hello {name} and `{code}`.',
				'',
				'```js',
				'const value = { a: 1 };',
				'```',
				''
			].join('\n')
		);

		expect(sanitized).not.toContain('<script');
		expect(sanitized).not.toContain('<svelte:');
		expect(sanitized).toContain('Hello &#123;name&#125; and `{code}`.');
		expect(sanitized).toContain('const value = { a: 1 };');
	});

	it('forces a Markdown extension so remote documents are never compiled as modules', () => {
		expect(toMarkdownPath('guides/deploy.svx')).toBe('guides/deploy.md');
		expect(toMarkdownPath('guides/deploy')).toBe('guides/deploy.md');
	});
});

describe('http safety', () => {
	it('refuses non-HTTPS URLs unless loopback is explicitly allowed', () => {
		expect(() => assertSafeUrl('http://example.com/a.md')).toThrow(/must use HTTPS/);
		expect(() => assertSafeUrl('file:///etc/passwd')).toThrow(/must use HTTPS/);
		expect(
			assertSafeUrl('http://localhost:5173/a.md', { allowInsecureHttp: true }).hostname
		).toBe('localhost');
	});

	it('enforces the response size limit', async () => {
		const fetch: DocsFetch = async () => new Response('x'.repeat(50));

		await expect(fetchText('https://example.com/a.md', { fetch, maxBytes: 10 })).rejects.toThrow(
			/exceeds the 10 byte limit/
		);
	});

	it('reports upstream status codes', async () => {
		const fetch: DocsFetch = async () => new Response('nope', { status: 503 });

		await expect(fetchText('https://example.com/a.md', { fetch })).rejects.toMatchObject({
			name: 'DocsSourceFetchError',
			status: 503
		});
	});

	it('times out slow responses', async () => {
		const fetch: DocsFetch = (_url, init) =>
			new Promise((_resolve, reject) => {
				init?.signal?.addEventListener('abort', () => {
					reject(init.signal?.reason ?? new Error('aborted'));
				});
			});

		await expect(fetchText('https://example.com/a.md', { fetch, timeoutMs: 5 })).rejects.toBeInstanceOf(
			DocsSourceFetchError
		);
	});
});

describe('local source', () => {
	it('loads Markdown and mdsvex documents with their original extensions', async () => {
		const root = await makeTemporaryDirectory();
		await mkdir(join(root, 'guides'), { recursive: true });
		await writeFile(join(root, 'index.md'), '# Home', 'utf8');
		await writeFile(join(root, 'guides', 'deploy.svx'), '# Deploy {value}', 'utf8');

		const documents = await localSource({ root }).load({ cwd: root });

		expect(documents.map((document) => document.relativePath)).toEqual([
			'guides/deploy.svx',
			'index.md'
		]);
		expect(documents[0]?.content).toBe('# Deploy {value}');
	});
});

describe('remote markdown source', () => {
	it('sanitizes fetched documents and records provenance', async () => {
		const { fetch } = routedFetch({
			'guide.md': () => new Response('# Guide {expr}<script>evil()</script>')
		});
		const documents = await remoteMarkdownSource({
			documents: [{ url: 'https://example.com/guide.md', path: 'guide' }],
			fetch
		}).load({ cwd: '/tmp' });

		expect(documents[0]).toMatchObject({
			relativePath: 'guide.md',
			origin: { url: 'https://example.com/guide.md' }
		});
		expect(documents[0]?.content).toBe('# Guide &#123;expr&#125;');
	});
});

describe('github source', () => {
	it('imports the configured directory from a repository tree', async () => {
		const { fetch, calls } = routedFetch({
			'git/trees': () =>
				jsonResponse({
					tree: [
						{ type: 'blob', path: 'docs/index.md' },
						{ type: 'blob', path: 'docs/guides/deploy.svx' },
						{ type: 'blob', path: 'docs/logo.png' },
						{ type: 'blob', path: 'README.md' },
						{ type: 'tree', path: 'docs/guides' }
					]
				}),
			'raw.githubusercontent.com': () => new Response('# From GitHub')
		});

		const documents = await githubSource({
			repository: 'acme/product',
			ref: 'v2',
			token: 'secret-token',
			fetch
		}).load({ cwd: '/tmp' });

		expect(documents.map((document) => document.relativePath)).toEqual([
			'guides/deploy.md',
			'index.md'
		]);
		expect(documents[0]?.origin).toMatchObject({
			repository: 'acme/product',
			ref: 'v2',
			path: 'docs/guides/deploy.svx'
		});
		expect(calls[0]).toContain('/repos/acme/product/git/trees/v2?recursive=1');
	});

	it('fails loudly on truncated trees and invalid repositories', async () => {
		const { fetch } = routedFetch({ 'git/trees': () => jsonResponse({ truncated: true, tree: [] }) });

		expect(() => githubSource({ repository: 'not-a-repo' })).toThrow(/owner\/name/);
		await expect(githubSource({ repository: 'acme/product', fetch }).load({ cwd: '/tmp' })).rejects.toThrow(
			/truncated/
		);
	});
});

describe('github releases source', () => {
	it('generates release pages and an index, skipping unpublished releases', async () => {
		const { fetch } = routedFetch({
			'/releases': () =>
				jsonResponse([
					{
						tag_name: 'v2.1.0',
						name: 'Version 2.1',
						body: 'Adds {things}',
						published_at: '2026-07-01T10:00:00Z',
						html_url: 'https://github.com/acme/product/releases/tag/v2.1.0'
					},
					{ tag_name: 'v2.2.0-rc.1', prerelease: true, body: 'Preview' }
				])
		});

		const documents = await githubReleasesSource({ repository: 'acme/product', fetch }).load({
			cwd: '/tmp'
		});

		expect(documents.map((document) => document.relativePath)).toEqual([
			'releases/index.md',
			'releases/v2.1.0.md'
		]);
		expect(documents[1]?.content).toContain("title: 'Version 2.1'");
		expect(documents[1]?.content).toContain('Adds &#123;things&#125;');
		expect(documents[0]?.content).toContain('- [Version 2.1](/releases/v2.1.0) — 2026-07-01');
	});
});

describe('notion source', () => {
	it('converts blocks to Markdown', () => {
		const markdown = notionBlocksToMarkdown([
			{ type: 'heading_1', heading_1: { rich_text: [{ plain_text: 'Title' }] } },
			{
				type: 'paragraph',
				paragraph: { rich_text: [{ plain_text: 'bold', annotations: { bold: true } }] }
			},
			{ type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ plain_text: 'one' }] } },
			{ type: 'code', code: { language: 'ts', rich_text: [{ plain_text: 'const a = 1;' }] } },
			{ type: 'divider', divider: {} }
		] as never);

		expect(markdown).toBe('# Title\n\n**bold**\n\n- one\n```ts\nconst a = 1;\n```\n\n---\n');
	});

	it('maps database pages to sanitized documents', async () => {
		const { fetch } = routedFetch({
			'/databases/': () =>
				jsonResponse({
					results: [
						{
							id: 'page-1',
							url: 'https://notion.so/page-1',
							last_edited_time: '2026-08-01T00:00:00Z',
							properties: {
								Name: { type: 'title', title: [{ plain_text: 'Install' }] },
								Slug: { type: 'rich_text', rich_text: [{ plain_text: 'install' }] }
							}
						}
					]
				}),
			'/blocks/': () =>
				jsonResponse({
					results: [{ type: 'paragraph', paragraph: { rich_text: [{ plain_text: 'Run {cmd}' }] } }]
				})
		});

		const documents = await notionSource({
			token: 'secret',
			databaseId: 'db-1',
			directory: 'notion',
			fetch
		}).load({ cwd: '/tmp' });

		expect(documents[0]?.relativePath).toBe('notion/install.md');
		expect(documents[0]?.content).toContain("title: 'Install'");
		expect(documents[0]?.content).toContain('Run &#123;cmd&#125;');
	});

	it('requires a database or explicit pages', () => {
		expect(() => notionSource({ token: 'secret' })).toThrow(/databaseId/);
	});
});

describe('sanity source', () => {
	it('maps query results using configurable fields', async () => {
		const { fetch, calls } = routedFetch({
			'apicdn.sanity.io': () =>
				jsonResponse({
					result: [
						{
							_id: 'doc-1',
							_updatedAt: '2026-08-02T00:00:00Z',
							title: 'Overview',
							slug: { current: 'overview' },
							body: 'Body {expr}',
							locale: 'de'
						},
						{ title: 'Skipped', body: 'no slug' }
					]
				})
		});

		const documents = await sanitySource({ projectId: 'p1', dataset: 'production', fetch }).load({
			cwd: '/tmp'
		});

		expect(documents).toHaveLength(1);
		expect(documents[0]).toMatchObject({ relativePath: 'overview.md', locale: 'de' });
		expect(documents[0]?.content).toContain('Body &#123;expr&#125;');
		expect(calls[0]).toContain('https://p1.apicdn.sanity.io/v2024-10-01/data/query/production?query=');
	});
});

describe('createDocsSource', () => {
	it('resolves credentials from the environment', () => {
		const source = createDocsSource(
			{ id: 'gh', type: 'github', repository: 'acme/product', tokenEnv: 'GH_TOKEN' },
			{ env: { GH_TOKEN: 'secret' } }
		);

		expect(source).toMatchObject({ id: 'gh', type: 'github' });
		expect(JSON.stringify(source)).not.toContain('secret');
	});

	it('fails when a configured credential is missing or a type is unknown', () => {
		expect(() =>
			createDocsSource({ id: 'gh', type: 'github', repository: 'a/b', tokenEnv: 'MISSING' }, { env: {} })
		).toThrow(/MISSING, which is not set/);
		expect(() => createDocsSource({ id: 'x', type: 'ftp' }, { env: {} })).toThrow(/Unknown docs source type/);
	});
});

describe('syncDocsSources', () => {
	it('materializes local and remote content side by side', async () => {
		const project = await makeTemporaryDirectory();
		const contentRoot = join(project, 'src/lib/docs');
		await mkdir(contentRoot, { recursive: true });
		await writeFile(join(contentRoot, 'index.md'), '# Local', 'utf8');

		const { fetch } = routedFetch({ 'remote.md': () => new Response('# Remote') });
		const report = await syncDocsSources({
			cwd: project,
			cacheDir: '.docs-kit/cache/sources',
			now: () => '2026-08-06T00:00:00.000Z',
			sources: [
				localSource({ root: 'src/lib/docs' }),
				remoteMarkdownSource({
					id: 'handbook',
					documents: [{ url: 'https://example.com/remote.md', path: 'handbook/remote' }],
					fetch
				})
			]
		});

		expect(report.status).toBe('ok');
		expect(report.diagnostics).toEqual([]);
		expect(report.content.map((entry) => entry.pathname)).toEqual(['/handbook/remote', '/']);
		expect(
			await readFile(join(project, '.docs-kit/cache/sources/handbook/handbook/remote.md'), 'utf8')
		).toBe('# Remote');

		const index = JSON.parse(
			await readFile(join(project, '.docs-kit/cache/sources/index.json'), 'utf8')
		);
		expect(index.sources.map((source: { sourceId: string }) => source.sourceId)).toEqual([
			'handbook',
			'local'
		]);
	});

	it('rewrites only changed files, prunes removed ones, and reports conflicts', async () => {
		const project = await makeTemporaryDirectory();
		const cacheDir = '.docs-kit/cache/sources';
		let pages = ['a', 'b'];
		const fetch: DocsFetch = async (url) => new Response(`# ${url.split('/').pop()}`);
		const source = () =>
			remoteMarkdownSource({
				id: 'remote',
				documents: pages.map((page) => ({ url: `https://example.com/${page}.md`, path: page })),
				fetch
			});

		await syncDocsSources({ cwd: project, cacheDir, sources: [source()] });
		pages = ['a', 'c'];
		const second = await syncDocsSources({ cwd: project, cacheDir, sources: [source()] });

		expect(second.sources[0]).toMatchObject({
			unchanged: ['a.md'],
			written: ['c.md'],
			deleted: ['b.md']
		});
		await expect(readFile(join(project, cacheDir, 'remote/b.md'), 'utf8')).rejects.toThrow();
	});

	it('degrades to cached content when a source fails', async () => {
		const project = await makeTemporaryDirectory();
		const cacheDir = '.docs-kit/cache/sources';
		let online = true;
		const fetch: DocsFetch = async () =>
			online ? new Response('# Guide') : new Response('down', { status: 503 });
		const source = () =>
			remoteMarkdownSource({
				id: 'remote',
				documents: [{ url: 'https://example.com/guide.md', path: 'guide' }],
				fetch
			});

		await syncDocsSources({ cwd: project, cacheDir, sources: [source()] });
		online = false;
		const degraded = await syncDocsSources({ cwd: project, cacheDir, sources: [source()] });

		expect(degraded.status).toBe('degraded');
		expect(degraded.sources[0]?.error).toContain('HTTP 503');
		expect(degraded.content.map((entry) => entry.slug)).toEqual(['guide']);
	});

	it('reports a hard failure when a source has never been cached', async () => {
		const project = await makeTemporaryDirectory();
		const fetch: DocsFetch = async () => new Response('down', { status: 500 });
		const report = await syncDocsSources({
			cwd: project,
			cacheDir: '.docs-kit/cache/sources',
			sources: [
				remoteMarkdownSource({
					id: 'remote',
					documents: [{ url: 'https://example.com/guide.md', path: 'guide' }],
					fetch
				})
			]
		});

		expect(report.status).toBe('failed');
		expect(report.content).toEqual([]);
	});

	it('surfaces cross-source slug conflicts', async () => {
		const project = await makeTemporaryDirectory();
		const contentRoot = join(project, 'docs');
		await mkdir(contentRoot, { recursive: true });
		await writeFile(join(contentRoot, 'install.md'), '# Local install', 'utf8');
		const fetch: DocsFetch = async () => new Response('# Remote install');

		const report = await syncDocsSources({
			cwd: project,
			cacheDir: '.docs-kit/cache/sources',
			sources: [
				localSource({ root: 'docs' }),
				remoteMarkdownSource({
					id: 'remote',
					documents: [{ url: 'https://example.com/install.md', path: 'install' }],
					fetch
				})
			]
		});

		expect(report.diagnostics[0]).toMatchObject({
			code: 'DUPLICATE_SOURCE_SLUG',
			sources: ['local', 'remote']
		});

		const namespaced = await syncDocsSources({
			cwd: project,
			cacheDir: '.docs-kit/cache/sources',
			onConflict: 'namespace',
			sources: [
				localSource({ root: 'docs' }),
				remoteMarkdownSource({
					id: 'remote',
					documents: [{ url: 'https://example.com/install.md', path: 'install' }],
					fetch
				})
			]
		});

		expect(namespaced.content.map((entry) => entry.slug)).toEqual([
			'local/install',
			'remote/install'
		]);
		expect(namespaced.content.map((entry) => entry.sourcePath)).toEqual([
			join(project, '.docs-kit/cache/sources/local/local/install.md'),
			join(project, '.docs-kit/cache/sources/remote/remote/install.md')
		]);
		expect(
			await readFile(join(project, '.docs-kit/cache/sources/remote/remote/install.md'), 'utf8')
		).toBe('# Remote install');
	});
});
