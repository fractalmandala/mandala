import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createDocsAiDocument } from '@docs-kit/ai';
import { resolveDocsConfig } from '@docs-kit/core';

import { loadDocsMcpDocuments } from './load.js';
import { createDocsMcpServer, type JsonRpcRequest } from './server.js';
import { serveDocsMcpOverStdio } from './stdio.js';

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const documents = [
	createDocsAiDocument({
		id: 'install.md',
		pathname: '/docs/install',
		source: '# Installation\n\nRun the installer.\n\n## Deployment\n\nDeploy to Vercel.',
		siteUrl: 'https://acme.com',
		version: 'v2',
		locale: 'en'
	}),
	createDocsAiDocument({
		id: 'legacy.md',
		pathname: '/docs/v1/install',
		source: '# Installation\n\nLegacy deployment steps for Vercel.',
		version: 'v1',
		locale: 'en'
	}),
	createDocsAiDocument({
		id: 'private.md',
		pathname: '/docs/private',
		source: '# Private\n\nInternal deployment secrets.',
		audiences: ['staff']
	})
];

const server = createDocsMcpServer({
	documents,
	site: { title: 'Acme', url: 'https://acme.com' },
	versions: [
		{ id: 'v2', label: 'Latest', current: true },
		{ id: 'v1', label: 'Version 1', current: false }
	],
	locales: [{ id: 'en', label: 'English', default: true }]
});

async function call(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
	return server.callTool(name, args);
}

function request(method: string, params?: Record<string, unknown>): JsonRpcRequest {
	return { jsonrpc: '2.0', id: 1, method, ...(params === undefined ? {} : { params }) };
}

describe('createDocsMcpServer', () => {
	it('advertises its tools during initialization', async () => {
		const initialize = await server.handle(request('initialize'));

		expect(initialize?.result).toMatchObject({
			protocolVersion: '2024-11-05',
			serverInfo: { name: 'Acme' }
		});
		expect((await server.handle(request('tools/list')))?.result).toMatchObject({
			tools: expect.arrayContaining([expect.objectContaining({ name: 'search_docs' })])
		});
		expect(server.tools.map((tool) => tool.name)).toEqual([
			'list_pages',
			'search_docs',
			'read_page',
			'read_section',
			'list_versions',
			'list_locales'
		]);
	});

	it('lists pages and filters them by version', async () => {
		expect((await call('list_pages')) as unknown[]).toHaveLength(2);
		expect(((await call('list_pages', { version: 'v1' })) as { id: string }[]).map((page) => page.id)).toEqual([
			'legacy.md'
		]);
	});

	it('excludes access-restricted pages from every surface', async () => {
		const pages = (await call('list_pages')) as { id: string }[];
		const results = (await call('search_docs', { query: 'deployment secrets' })) as unknown[];

		expect(pages.map((page) => page.id)).not.toContain('private.md');
		expect(JSON.stringify(results)).not.toContain('secrets');
		await expect(call('read_page', { pathname: '/docs/private' })).rejects.toThrow(/No documentation page/);
	});

	it('searches with citable anchors and honours filters', async () => {
		const results = (await call('search_docs', { query: 'deploy vercel', limit: 3 })) as {
			pathname: string;
			url?: string;
		}[];

		expect(results[0]).toMatchObject({
			pathname: '/docs/install#deployment',
			url: 'https://acme.com/docs/install#deployment'
		});

		const legacy = (await call('search_docs', { query: 'vercel', version: 'v1' })) as {
			pathname: string;
		}[];
		expect(legacy.every((result) => result.pathname.startsWith('/docs/v1'))).toBe(true);
	});

	it('reads whole pages and single sections', async () => {
		expect(await call('read_page', { pathname: '/docs/install' })).toMatchObject({
			title: 'Installation',
			markdown: expect.stringContaining('Run the installer.')
		});
		expect(await call('read_section', { pathname: '/docs/install', anchor: 'deployment' })).toMatchObject({
			pathname: '/docs/install#deployment',
			url: 'https://acme.com/docs/install#deployment',
			heading: 'Deployment',
			markdown: expect.stringContaining('Deploy to Vercel.')
		});
		await expect(call('read_section', { pathname: '/docs/install', anchor: 'nope' })).rejects.toThrow(
			/no section anchored/
		);
	});

	it('lists versions and locales', async () => {
		expect(await call('list_versions')).toHaveLength(2);
		expect(await call('list_locales')).toEqual([{ id: 'en', label: 'English', default: true }]);
	});

	it('reports tool failures and unknown methods as JSON-RPC errors', async () => {
		const failure = await server.handle(
			request('tools/call', { name: 'read_page', arguments: { pathname: '/nope' } })
		);
		expect(failure?.error).toMatchObject({ code: -32000 });

		const unknown = await server.handle(request('resources/list'));
		expect(unknown?.error).toMatchObject({ code: -32601 });
		expect(await server.handle({ jsonrpc: '2.0', method: 'notifications/initialized' })).toBeUndefined();
	});

	it('returns tool results as MCP text content', async () => {
		const response = await server.handle(
			request('tools/call', { name: 'list_versions', arguments: {} })
		);

		expect(response?.result).toMatchObject({
			content: [{ type: 'text', text: expect.stringContaining('Latest') }]
		});
	});

	it('lets a host pin the caller\'s audience', async () => {
		const staffServer = createDocsMcpServer({
			documents,
			authorize: (filter) => ({ ...filter, audiences: ['staff'] })
		});

		expect(((await staffServer.callTool('list_pages', {})) as { id: string }[]).map((page) => page.id)).toContain(
			'private.md'
		);
	});
});

describe('serveDocsMcpOverStdio', () => {
	it('handles newline-framed JSON-RPC and reports parse errors', async () => {
		const written: string[] = [];
		async function* input(): AsyncIterable<string> {
			yield '{"jsonrpc":"2.0","id":1,"method":"ping"}\nnot json\n';
			yield '{"jsonrpc":"2.0","id":2,"method":"tools/list"}';
		}

		await serveDocsMcpOverStdio(server, { input: input(), write: (line) => written.push(line) });

		expect(JSON.parse(written[0] ?? '{}')).toMatchObject({ id: 1, result: {} });
		expect(JSON.parse(written[1] ?? '{}')).toMatchObject({ error: { code: -32700 } });
		expect(JSON.parse(written[2] ?? '{}').result.tools).toHaveLength(6);
	});
});

describe('loadDocsMcpDocuments', () => {
	it('reads the same pages and pathnames the website routes', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-mcp-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'src/lib/docs/en/guides'), { recursive: true });
		await mkdir(join(root, 'src/lib/docs/de'), { recursive: true });
		await writeFile(join(root, 'src/lib/docs/en/index.md'), '# Home', 'utf8');
		await writeFile(join(root, 'src/lib/docs/en/guides/deploy.md'), '# Deploy', 'utf8');
		await writeFile(join(root, 'src/lib/docs/de/index.md'), '# Start', 'utf8');

		const config = resolveDocsConfig({
			site: { title: 'Acme', url: 'https://acme.com' },
			i18n: { defaultLocale: 'en', locales: ['en', 'de'] }
		});
		const loaded = await loadDocsMcpDocuments({ config, cwd: root });

		expect(loaded.map((document) => document.pathname).sort()).toEqual([
			'/docs',
			'/docs/de',
			'/docs/guides/deploy'
		]);
		expect(loaded.find((document) => document.pathname === '/docs')?.url).toBe(
			'https://acme.com/docs'
		);
	});
});
