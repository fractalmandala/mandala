import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { loadDocsConfig } from './config-file.js';
import { runDocsCli } from './index.js';
import { parseCliArgs, type DocsCliContext } from './runtime.js';

const temporaryRoots: string[] = [];

async function makeProject(config: unknown, files: Record<string, string> = {}): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
	temporaryRoots.push(root);
	await writeFile(join(root, 'docs.config.json'), JSON.stringify(config, null, '\t'), 'utf8');

	for (const [path, content] of Object.entries(files)) {
		const target = join(root, path);
		await mkdir(join(target, '..'), { recursive: true });
		await writeFile(target, content, 'utf8');
	}

	return root;
}

function createContext(cwd: string): DocsCliContext & { out: string[]; err: string[] } {
	const out: string[] = [];
	const err: string[] = [];

	return {
		cwd,
		env: {},
		out,
		err,
		write: (line) => out.push(line),
		writeError: (line) => err.push(line)
	};
}

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('parseCliArgs', () => {
	it('parses positionals, valued options, and boolean flags', () => {
		expect(parseCliArgs(['callout', '--config=docs.config.js', '--source', 'gh', '--json'])).toEqual({
			positional: ['callout'],
			options: { config: 'docs.config.js', source: 'gh', json: true }
		});
	});
});

describe('loadDocsConfig', () => {
	it('applies defaults and reports the resolved path', async () => {
		const root = await makeProject({ site: { title: 'Acme' } });
		const loaded = await loadDocsConfig({ cwd: root });

		expect(loaded.path).toBe(join(root, 'docs.config.json'));
		expect(loaded.config).toMatchObject({
			content: { directory: 'src/lib/docs' },
			routing: { basePath: '/docs', versionPrefix: 'except-current' },
			outDir: '.docs-kit',
			sources: { onConflict: 'error', cacheDir: '.docs-kit/cache/sources' }
		});
	});

	it('rejects invalid and unknown configuration', async () => {
		const missingTitle = await makeProject({ site: {} });
		await expect(loadDocsConfig({ cwd: missingTitle })).rejects.toThrow(/site.title/);

		const unknownField = await makeProject({ site: { title: 'Acme' }, colour: 'red' });
		await expect(loadDocsConfig({ cwd: unknownField })).rejects.toThrow(/Unknown docs configuration/);
	});

	it('explains a missing configuration file', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);

		await expect(loadDocsConfig({ cwd: root })).rejects.toThrow(/No documentation configuration/);
	});
});

describe('docs sync', () => {
	const config = {
		site: { title: 'Acme' },
		sources: {
			entries: [{ id: 'handbook', type: 'local', root: 'handbook' }]
		}
	};

	it('materializes configured sources and reports the result', async () => {
		const root = await makeProject(config, { 'handbook/index.md': '# Handbook' });
		const context = createContext(root);
		const code = await runDocsCli(['sync'], { context });

		expect(code).toBe(0);
		expect(context.out.join('\n')).toContain('fetched  handbook — 1 written');
		expect(
			await readFile(join(root, '.docs-kit/cache/sources/handbook/index.md'), 'utf8')
		).toBe('# Handbook');
	});

	it('emits machine-readable output with --json', async () => {
		const root = await makeProject(config, { 'handbook/index.md': '# Handbook' });
		const context = createContext(root);

		await runDocsCli(['sync', '--json'], { context });

		expect(JSON.parse(context.out.join('\n'))).toMatchObject({
			status: 'ok',
			pages: 1,
			sources: [{ sourceId: 'handbook', status: 'fetched' }]
		});
	});

	it('fails when a requested source is not configured', async () => {
		const root = await makeProject(config, { 'handbook/index.md': '# Handbook' });
		const context = createContext(root);

		expect(await runDocsCli(['sync', '--source', 'missing'], { context })).toBe(1);
		expect(context.err.join('\n')).toContain('No source with id "missing"');
	});

	it('fails when sources conflict', async () => {
		const root = await makeProject(
			{
				site: { title: 'Acme' },
				sources: {
					entries: [
						{ id: 'a', type: 'local', root: 'a' },
						{ id: 'b', type: 'local', root: 'b' }
					]
				}
			},
			{ 'a/install.md': '# A', 'b/install.md': '# B' }
		);
		const context = createContext(root);

		expect(await runDocsCli(['sync'], { context })).toBe(1);
		expect(context.out.join('\n')).toContain('ERROR DUPLICATE_SOURCE_SLUG');
	});
});

describe('cli dispatch', () => {
	it('prints usage and rejects unknown commands', async () => {
		const context = createContext(process.cwd());

		expect(await runDocsCli(['help'], { context })).toBe(0);
		expect(context.out.join('\n')).toContain('Usage: docs <command>');

		expect(await runDocsCli(['nope'], { context })).toBe(1);
		expect(context.err.join('\n')).toContain('Unknown command "nope"');
	});

	it('turns thrown errors into a failing exit code', async () => {
		const context = createContext(process.cwd());

		expect(await runDocsCli(['sync', '--config', 'missing.config.js'], { context })).toBe(1);
		expect(context.err.join('\n')).toContain('Configuration file not found');
	});
});

describe('docs migrate', () => {
	it('runs as a dry run by default and writes only when asked', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'docs'), { recursive: true });
		await writeFile(join(root, 'mkdocs.yml'), 'site_name: Acme\n', 'utf8');
		await writeFile(join(root, 'docs/index.md'), '# Home\n', 'utf8');

		const dryRun = createContext(root);
		expect(await runDocsCli(['migrate'], { context: dryRun })).toBe(0);
		expect(dryRun.out.join('\n')).toContain('Detected MkDocs');
		expect(dryRun.out.join('\n')).toContain('Dry run');
		await expect(readFile(join(root, 'docs-kit-migration/docs.config.json'), 'utf8')).rejects.toThrow();

		const written = createContext(root);
		expect(await runDocsCli(['migrate', '--write', '--out', 'migrated'], { context: written })).toBe(0);
		expect(JSON.parse(await readFile(join(root, 'migrated/docs.config.json'), 'utf8'))).toMatchObject({
			site: { title: 'Acme' }
		});
		expect(await readFile(join(root, 'migrated/MIGRATION-REPORT.md'), 'utf8')).toContain(
			'MkDocs migration report'
		);
	});

	it('rejects an unknown source framework', async () => {
		const context = createContext(process.cwd());

		expect(await runDocsCli(['migrate', '--from', 'gitbook'], { context })).toBe(1);
		expect(context.err.join('\n')).toContain('Unknown migration source "gitbook"');
	});
});

describe('docs add', () => {
	it('lists registry items when no item is requested', async () => {
		const context = createContext(process.cwd());

		expect(await runDocsCli(['add'], { context })).toBe(0);
		expect(context.out.join('\n')).toContain('callout');
		expect(context.out.join('\n')).toContain('Available registry items');
	});

	it('installs an item and reports its files and packages', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		const context = createContext(root);

		expect(await runDocsCli(['add', 'feedback'], { context })).toBe(0);
		expect(await readFile(join(root, 'src/lib/docs-kit/components/Feedback.svelte'), 'utf8')).toContain(
			'Was this page helpful?'
		);
		expect(await readFile(join(root, 'src/routes/api/docs-feedback/+server.ts'), 'utf8')).toContain(
			'RequestHandler'
		);
		expect(context.out.join('\n')).toContain('added     src/lib/docs-kit/components/Feedback.svelte');
	});

	it('supports a dry run and reports unknown items', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		const dry = createContext(root);

		expect(await runDocsCli(['add', 'callout', '--dry-run'], { context: dry })).toBe(0);
		expect(dry.out.join('\n')).toContain('Would install 1 file');
		await expect(readFile(join(root, 'src/lib/docs-kit/components/Callout.svelte'), 'utf8')).rejects.toThrow();

		const unknown = createContext(root);
		expect(await runDocsCli(['add', 'nope'], { context: unknown })).toBe(1);
		expect(unknown.err.join('\n')).toContain('Unknown registry item "nope"');
	});
});

describe('docs create and docs dev', () => {
	it('generates a standalone application', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		const context = createContext(root);

		expect(await runDocsCli(['create', 'site', '--title', 'Acme'], { context })).toBe(0);
		expect(await readFile(join(root, 'site/vite.config.ts'), 'utf8')).toContain('@docs-kit/vite');
		expect(await readFile(join(root, 'site/src/lib/docs/index.md'), 'utf8')).toContain('# Acme');
		expect(context.out.join('\n')).toContain('Next steps:');
	});

	it('requires a directory for create', async () => {
		const context = createContext(process.cwd());

		expect(await runDocsCli(['create'], { context })).toBe(1);
		expect(context.err.join('\n')).toContain('requires a target directory');
	});

	it('prepares a standalone workspace for a content directory without starting a server', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'handbook'), { recursive: true });
		await writeFile(join(root, 'handbook/index.md'), '# Handbook\n', 'utf8');
		const context = createContext(root);

		expect(await runDocsCli(['dev', 'handbook', '--no-run'], { context })).toBe(0);
		expect(await readFile(join(root, '.docs-kit/standalone/vite.config.ts'), 'utf8')).toContain(
			'content: "../../handbook"'
		);
		expect(context.out.join('\n')).toContain('Serving content from handbook');
	});

	it('ejects the generated application when asked', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'handbook'), { recursive: true });
		await writeFile(join(root, 'handbook/index.md'), '# Handbook\n', 'utf8');
		const context = createContext(root);

		expect(await runDocsCli(['dev', 'handbook', '--eject'], { context })).toBe(0);
		expect(await readFile(join(root, 'docs-app/svelte.config.js'), 'utf8')).toContain('mdsvex');
		expect(context.out.join('\n')).toContain('pnpm dev');
	});
});

describe('docs validate', () => {
	const config = { site: { title: 'Acme' }, content: { directory: 'docs' } };

	it('passes a healthy documentation set', async () => {
		const root = await makeProject(config, {
			'docs/index.md': '---\ntitle: Home\n---\n\nSee [install](/docs/install).',
			'docs/install.md': '---\ntitle: Install\n---\n\n## Requirements\n\nBack [home](/docs).'
		});
		const context = createContext(root);

		expect(await runDocsCli(['validate'], { context })).toBe(0);
		expect(context.out.join('\n')).toContain('Checked 2 page(s)');
		expect(context.out.join('\n')).toContain('0 error(s), 0 warning(s)');
	});

	it('reports broken links with location and suggestions, and fails', async () => {
		const root = await makeProject(config, {
			'docs/index.md': '---\ntitle: Home\n---\n\nSee [install](/docs/instal).',
			'docs/install.md': '---\ntitle: Install\n---\n\nBody.'
		});
		const context = createContext(root);

		expect(await runDocsCli(['validate'], { context })).toBe(1);
		const output = context.out.join('\n');
		expect(output).toContain('ERROR BROKEN_INTERNAL_LINK index.md:5');
		expect(output).toContain('Did you mean: /docs/install');
	});

	it('emits machine-readable diagnostics and honours --strict', async () => {
		const root = await makeProject(config, {
			'docs/index.md': '---\ntitle: Home\n---\n\n## Install\n\n## Install'
		});

		const json = createContext(root);
		expect(await runDocsCli(['validate', '--json'], { context: json })).toBe(0);
		expect(JSON.parse(json.out.join('\n'))).toMatchObject({
			checked: 1,
			errors: 0,
			warnings: 1
		});

		const strict = createContext(root);
		expect(await runDocsCli(['validate', '--strict'], { context: strict })).toBe(1);
	});

	it('checks assets when a static directory exists', async () => {
		const root = await makeProject(config, {
			'docs/index.md': '---\ntitle: Home\n---\n\n![x](/img/missing.png)',
			'static/keep.txt': 'placeholder'
		});
		const context = createContext(root);

		expect(await runDocsCli(['validate'], { context })).toBe(1);
		expect(context.out.join('\n')).toContain('MISSING_ASSET');
	});

	it('fails clearly when there is no documentation', async () => {
		const root = await makeProject(config);
		const context = createContext(root);

		expect(await runDocsCli(['validate'], { context })).toBe(1);
		expect(context.err.join('\n')).toContain('No documentation found');
	});
});

describe('docs doctor', () => {
	const healthy = {
		'package.json': JSON.stringify({
			devDependencies: {
				svelte: '^5.49.1',
				'@sveltejs/kit': '^2.50.0',
				vite: '^8.0.0',
				mdsvex: '^0.12.6'
			}
		}),
		'vite.config.ts':
			"import { docs } from '@docs-kit/vite';\nexport default { plugins: [docs({ content: 'docs' }), sveltekit()] };",
		'svelte.config.js':
			"import { docsMarkdown, docsMdsvex } from '@docs-kit/mdsvex';\nexport default { extensions: ['.svelte', '.md'], preprocess: [docsMarkdown(), mdsvex({})] };",
		'.gitignore': 'node_modules\n.docs-kit\n',
		'docs/index.md': '# Home',
		'src/routes/docs/[...slug]/+page.svelte': '<h1>docs</h1>'
	};

	it('passes a correctly wired project', async () => {
		const root = await makeProject({ site: { title: 'Acme' }, content: { directory: 'docs' } }, healthy);
		const context = createContext(root);

		expect(await runDocsCli(['doctor'], { context })).toBe(0);
		expect(context.out.join('\n')).toContain('0 problem(s)');
	});

	it('catches plugin order, missing route, and ignore-rule problems', async () => {
		const root = await makeProject(
			{ site: { title: 'Acme' }, content: { directory: 'docs' } },
			{
				...healthy,
				'.gitignore': 'node_modules\n',
				'vite.config.ts':
					"import { docs } from '@docs-kit/vite';\nexport default { plugins: [sveltekit(), docs({ content: 'docs' })] };",
				'src/routes/+page.svelte': '<h1>home</h1>'
			}
		);
		delete (healthy as Record<string, string>)['unused'];
		const context = createContext(root);
		await rm(join(root, 'src/routes/docs'), { recursive: true, force: true });

		expect(await runDocsCli(['doctor'], { context })).toBe(1);
		const output = context.out.join('\n');
		expect(output).toContain('warn vite plugin');
		expect(output).toContain('docs must come first');
		expect(output).toContain('FAIL route');
		expect(output).toContain('warn gitignore');
	});

	it('reports outdated dependencies and missing configuration', async () => {
		const outdated = await makeProject(
			{ site: { title: 'Acme' }, content: { directory: 'docs' } },
			{ ...healthy, 'package.json': JSON.stringify({ devDependencies: { svelte: '^4.0.0' } }) }
		);
		const context = createContext(outdated);

		expect(await runDocsCli(['doctor'], { context })).toBe(1);
		expect(context.out.join('\n')).toContain('Upgrade to svelte 5 or later.');

		const bare = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(bare);
		const bareContext = createContext(bare);
		expect(await runDocsCli(['doctor'], { context: bareContext })).toBe(1);
		expect(bareContext.out.join('\n')).toContain('FAIL configuration');
	});
});

describe('docs init', () => {
	const existingProject = {
		'package.json': JSON.stringify({ devDependencies: { svelte: '^5.0.0' } }),
		'pnpm-lock.yaml': 'lockfileVersion: 9',
		'vite.config.ts':
			"import { sveltekit } from '@sveltejs/kit/vite';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({\n\tplugins: [sveltekit()]\n});\n",
		'svelte.config.js':
			"import adapter from '@sveltejs/adapter-auto';\nimport { vitePreprocess } from '@sveltejs/vite-plugin-svelte';\n\nconst config = {\n\tpreprocess: [vitePreprocess()],\n\tkit: { adapter: adapter() }\n};\n\nexport default config;\n",
		'.gitignore': 'node_modules\n'
	};

	it('plans without touching the project by default', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		for (const [path, content] of Object.entries(existingProject)) {
			await writeFile(join(root, path), content, 'utf8');
		}
		const context = createContext(root);

		expect(await runDocsCli(['init'], { context })).toBe(0);
		const output = context.out.join('\n');
		expect(output).toContain('nothing was written');
		expect(output).toContain('create  docs.config.js');
		expect(output).toContain('patch   vite.config.ts');
		expect(output).toContain('pnpm add -D @docs-kit/core');
		await expect(readFile(join(root, 'docs.config.js'), 'utf8')).rejects.toThrow();
	});

	it('creates files and patches configuration with --write', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		for (const [path, content] of Object.entries(existingProject)) {
			await writeFile(join(root, path), content, 'utf8');
		}
		const context = createContext(root);

		expect(await runDocsCli(['init', '--write', '--title', 'Acme'], { context })).toBe(0);

		expect(await readFile(join(root, 'docs.config.js'), 'utf8')).toContain('title: "Acme"');
		expect(await readFile(join(root, 'src/lib/docs/index.md'), 'utf8')).toContain('# Acme');
		expect(await readFile(join(root, 'src/routes/docs/[...slug]/+page.svelte'), 'utf8')).toContain(
			'@docs-kit/theme-default'
		);

		const viteConfig = await readFile(join(root, 'vite.config.ts'), 'utf8');
		expect(viteConfig).toContain("import { docs } from '@docs-kit/vite';");
		// The plugin must run before sveltekit().
		expect(viteConfig.indexOf('docs({')).toBeLessThan(viteConfig.indexOf('sveltekit()'));

		const svelteConfig = await readFile(join(root, 'svelte.config.js'), 'utf8');
		expect(svelteConfig).toContain('docsMarkdown()');
		expect(svelteConfig).toContain("extensions: ['.svelte', '.md', '.svx']");
		// mdsvex has to see the Markdown last, and the project's own preprocessor is kept.
		expect(svelteConfig.indexOf('vitePreprocess()')).toBeLessThan(
			svelteConfig.indexOf('docsMarkdown()')
		);
		expect(svelteConfig.indexOf('docsMarkdown()')).toBeLessThan(svelteConfig.indexOf('mdsvex({'));
		expect(svelteConfig).toContain('\t\tvitePreprocess(),\n\t\tdocsMarkdown(),\n\t\tmdsvex({');
		expect(svelteConfig).toContain('kit: { adapter: adapter() }');
		expect(await readFile(join(root, '.gitignore'), 'utf8')).toContain('.docs-kit');
	});

	it('never overwrites existing files or already-wired configuration', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		for (const [path, content] of Object.entries(existingProject)) {
			await writeFile(join(root, path), content, 'utf8');
		}
		await writeFile(join(root, 'docs.config.js'), '// mine\n', 'utf8');
		await runDocsCli(['init', '--write'], { context: createContext(root) });

		expect(await readFile(join(root, 'docs.config.js'), 'utf8')).toBe('// mine\n');

		// A second run leaves the already-patched configuration alone.
		const second = createContext(root);
		await runDocsCli(['init', '--write'], { context: second });
		const output = second.out.join('\n');
		expect(output).toContain('was left unchanged');
		expect((await readFile(join(root, 'vite.config.ts'), 'utf8')).match(/@docs-kit\/vite/g)).toHaveLength(1);
	});

	it('detects the package manager and reports manual steps', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		await writeFile(join(root, 'yarn.lock'), '', 'utf8');
		const context = createContext(root);

		expect(await runDocsCli(['init'], { context })).toBe(0);
		const output = context.out.join('\n');
		expect(output).toContain('yarn add -D');
		expect(output).toContain('vite.config.ts does not exist');
	});

	it('finds the package manager from a workspace root above the project', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-cli-'));
		temporaryRoots.push(root);
		await writeFile(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9', 'utf8');
		const project = join(root, 'apps', 'site');
		await mkdir(project, { recursive: true });
		await writeFile(join(project, 'package.json'), '{"name":"site"}', 'utf8');
		const context = createContext(project);

		expect(await runDocsCli(['init'], { context })).toBe(0);
		expect(context.out.join('\n')).toContain('pnpm add -D');
	});
});

describe('docs generate', () => {
	it('writes the manifest, search records, and discovery artifacts', async () => {
		const root = await makeProject(
			{
				site: { title: 'Acme', url: 'https://acme.com' },
				content: { directory: 'docs' }
			},
			{
				'docs/index.md': '---\ntitle: Home\n---\n\nWelcome.\n\n## Details\n\nMore.',
				'docs/guide.md': '---\ntitle: Guide\n---\n\nBody.'
			}
		);
		const context = createContext(root);

		expect(await runDocsCli(['generate'], { context })).toBe(0);
		expect(context.out.join('\n')).toContain('Generated 2 page(s)');

		const manifest = JSON.parse(await readFile(join(root, '.docs-kit/manifest.json'), 'utf8'));
		expect(manifest.pages).toHaveLength(2);

		const records = JSON.parse(await readFile(join(root, '.docs-kit/search/records.json'), 'utf8'));
		expect(records.length).toBeGreaterThan(2);

		expect(await readFile(join(root, 'static/sitemap.xml'), 'utf8')).toContain('https://acme.com/docs');
		expect(await readFile(join(root, 'static/robots.txt'), 'utf8')).toContain('Sitemap:');
		expect(await readFile(join(root, 'static/og/index.svg'), 'utf8')).toContain('Home');
	});

	it('compiles configured API specifications into pages', async () => {
		const root = await makeProject(
			{
				site: { title: 'Acme' },
				content: { directory: 'docs' },
				openapi: [{ id: 'api', source: 'openapi.json' }]
			},
			{
				'docs/index.md': '---\ntitle: Home\n---\n\nWelcome.',
				'openapi.json': JSON.stringify({
					openapi: '3.1.0',
					info: { title: 'Acme API', version: '1.0.0' },
					paths: {
						'/things': {
							get: { operationId: 'listThings', summary: 'List things', responses: {} }
						}
					}
				})
			}
		);
		const context = createContext(root);

		expect(await runDocsCli(['generate'], { context })).toBe(0);

		const manifest = JSON.parse(await readFile(join(root, '.docs-kit/manifest.json'), 'utf8'));
		const pathnames = manifest.pages.map((page: { pathname: string }) => page.pathname);
		expect(pathnames).toContain('/docs/api/operations/listthings');
		expect(context.out.join('\n')).toContain('site.url is not configured');
	});

	it('fails with a useful message for a malformed specification', async () => {
		const root = await makeProject(
			{
				site: { title: 'Acme' },
				content: { directory: 'docs' },
				openapi: [{ id: 'api', source: 'openapi.json' }]
			},
			{ 'docs/index.md': '# Home', 'openapi.json': '{ "swagger": "2.0" }' }
		);
		const context = createContext(root);

		expect(await runDocsCli(['generate'], { context })).toBe(1);
		expect(context.err.join('\n')).toContain('Swagger 2.0 is not supported');
	});
});

describe('docs clean', () => {
	async function generated() {
		const root = await makeProject(
			{ site: { title: 'Acme', url: 'https://acme.com' }, content: { directory: 'docs' } },
			{ 'docs/index.md': '---\ntitle: Home\n---\n\nWelcome.' }
		);
		await runDocsCli(['generate'], { context: createContext(root) });
		return root;
	}

	it('lists what it would remove without touching anything', async () => {
		const root = await generated();
		const context = createContext(root);

		expect(await runDocsCli(['clean', '--dry-run'], { context })).toBe(0);
		expect(context.out.join('\n')).toContain('Would remove');
		expect(await readFile(join(root, '.docs-kit/manifest.json'), 'utf8')).toBeTruthy();
	});

	it('removes generated state, including cards it wrote', async () => {
		const root = await generated();
		const context = createContext(root);

		expect(await runDocsCli(['clean'], { context })).toBe(0);
		expect(context.out.join('\n')).toContain('Removed');
		await expect(readFile(join(root, '.docs-kit/manifest.json'), 'utf8')).rejects.toThrow();
		await expect(readFile(join(root, 'static/sitemap.xml'), 'utf8')).rejects.toThrow();
		await expect(readFile(join(root, 'static/og/index.svg'), 'utf8')).rejects.toThrow();
		// Source content is never touched.
		expect(await readFile(join(root, 'docs/index.md'), 'utf8')).toContain('Welcome.');
	});

	it('keeps a static directory it did not generate', async () => {
		const root = await generated();
		await rm(join(root, 'static/og'), { recursive: true, force: true });
		await mkdir(join(root, 'static/og'), { recursive: true });
		await writeFile(join(root, 'static/og/hand-made.svg'), '<svg />', 'utf8');

		await runDocsCli(['clean'], { context: createContext(root) });
		expect(await readFile(join(root, 'static/og/hand-made.svg'), 'utf8')).toBe('<svg />');
	});

	it('can keep static artifacts entirely', async () => {
		const root = await generated();
		const context = createContext(root);

		await runDocsCli(['clean', '--keep-static'], { context });
		expect(await readFile(join(root, 'static/sitemap.xml'), 'utf8')).toBeTruthy();
		await expect(readFile(join(root, '.docs-kit/manifest.json'), 'utf8')).rejects.toThrow();
	});
});
