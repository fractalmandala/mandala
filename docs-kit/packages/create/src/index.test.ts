import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
	planStandaloneProject,
	prepareStandaloneWorkspace,
	scaffoldStandaloneProject
} from './scaffold.js';
import { createStandaloneTemplate } from './templates.js';

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function temporaryDirectory(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'docs-kit-create-'));
	temporaryRoots.push(root);
	return root;
}

describe('createStandaloneTemplate', () => {
	it('renders an ordinary SvelteKit application wired to the framework', () => {
		const files = createStandaloneTemplate({
			name: 'acme-docs',
			siteTitle: 'Acme',
			contentDirectory: 'src/lib/docs',
			basePath: '/docs'
		});
		const paths = files.map((file) => file.path);

		expect(paths).toContain('package.json');
		expect(paths).toContain('svelte.config.js');
		expect(paths).toContain('vite.config.ts');
		expect(paths).toContain('src/routes/docs/[...slug]/+page.ts');
		expect(paths).toContain('src/routes/docs/[...slug]/+page.svelte');
		expect(paths).toContain('src/lib/docs/index.md');

		const viteConfig = files.find((file) => file.path === 'vite.config.ts')?.content ?? '';
		expect(viteConfig).toContain("docs({ content: \"src/lib/docs\", basePath: \"/docs\" })");
		expect(viteConfig).toContain('sveltekit()');

		const packageJson = JSON.parse(
			files.find((file) => file.path === 'package.json')?.content ?? '{}'
		);
		expect(packageJson.devDependencies['@docs-kit/vite']).toBe('workspace:*');
		// Workspace links expose TypeScript sources, so generated scripts enable type stripping.
		expect(packageJson.scripts.dev).toBe('NODE_OPTIONS=--experimental-strip-types vite dev');
		expect(paths).toContain('src/routes/+layout.ts');
	});

	it('mounts the docs route at a custom base path', () => {
		const files = createStandaloneTemplate({
			name: 'acme',
			siteTitle: 'Acme',
			contentDirectory: 'content',
			basePath: '/handbook',
			dependencyVersion: '^0.1.0'
		});

		expect(files.map((file) => file.path)).toContain('src/routes/handbook/[...slug]/+page.ts');
		expect(files.find((file) => file.path.endsWith('[...slug]/+page.ts'))?.content).toContain(
			"createDocsLoader({"
		);
		const packageJson = JSON.parse(
			files.find((file) => file.path === 'package.json')?.content ?? '{}'
		);
		expect(packageJson.devDependencies['@docs-kit/core']).toBe('^0.1.0');
		expect(packageJson.devDependencies['@docs-kit/sveltekit']).toBe('^0.1.0');
		// Published packages ship compiled output, so no Node flag is generated.
		expect(packageJson.scripts.build).toBe('vite build');
	});

	it('omits starter content when asked', () => {
		const files = createStandaloneTemplate({
			name: 'acme',
			siteTitle: 'Acme',
			contentDirectory: 'content',
			basePath: '/docs',
			starterContent: false
		});

		expect(files.some((file) => file.path.endsWith('index.md'))).toBe(false);
	});
});

describe('scaffoldStandaloneProject', () => {
	it('writes a runnable project and reports what it created', async () => {
		const root = await temporaryDirectory();
		const summary = await scaffoldStandaloneProject({ cwd: root, directory: 'my-docs' });

		expect(summary.written).toEqual(planStandaloneProject({ directory: 'my-docs' }).map((file) => file.path));
		expect(summary.intoExistingProject).toBe(false);
		expect(await readFile(join(root, 'my-docs/src/lib/docs/index.md'), 'utf8')).toContain('# my-docs');
		expect(await readFile(join(root, 'my-docs/.gitignore'), 'utf8')).toContain('.svelte-kit');
	});

	it('never overwrites existing files unless forced', async () => {
		const root = await temporaryDirectory();
		await scaffoldStandaloneProject({ cwd: root, directory: 'my-docs' });
		await writeFile(join(root, 'my-docs/src/lib/docs/index.md'), '# Mine\n', 'utf8');

		const second = await scaffoldStandaloneProject({ cwd: root, directory: 'my-docs' });
		expect(second.written).toEqual([]);
		expect(second.intoExistingProject).toBe(true);
		expect(await readFile(join(root, 'my-docs/src/lib/docs/index.md'), 'utf8')).toBe('# Mine\n');

		const forced = await scaffoldStandaloneProject({ cwd: root, directory: 'my-docs', force: true });
		expect(forced.written.length).toBeGreaterThan(0);
	});
});

describe('prepareStandaloneWorkspace', () => {
	it('points the generated application at content that stays where it is', async () => {
		const root = await temporaryDirectory();
		await mkdir(join(root, 'handbook'), { recursive: true });
		await writeFile(join(root, 'handbook/index.md'), '# Handbook\n', 'utf8');

		const summary = await prepareStandaloneWorkspace({ cwd: root, content: 'handbook' });
		const viteConfig = await readFile(join(summary.directory, 'vite.config.ts'), 'utf8');

		expect(summary.directory).toBe(join(root, '.docs-kit/standalone'));
		expect(viteConfig).toContain('content: "../../handbook"');
		expect(await readFile(join(root, 'handbook/index.md'), 'utf8')).toBe('# Handbook\n');
		expect(summary.files.some((file) => file.path.endsWith('index.md'))).toBe(false);
	});
});

describe('generated theming', () => {
	it('wires the default theme, components, and Markdown pipeline', () => {
		const files = createStandaloneTemplate({
			name: 'acme',
			siteTitle: 'Acme',
			contentDirectory: 'src/lib/docs',
			basePath: '/docs'
		});
		const read = (path: string) => files.find((file) => file.path === path)?.content ?? '';

		expect(read('svelte.config.js')).toContain('docsMarkdown()');
		expect(read('svelte.config.js')).toContain('highlight: docsPipeline.highlight');
		expect(read('src/routes/+layout.svelte')).toContain("@docs-kit/theme-default/tokens.css");
		expect(read('src/routes/docs/[...slug]/+page.svelte')).toContain(
			"import { DocsPage } from '@docs-kit/theme-default';"
		);
		expect(read('src/routes/docs/[...slug]/+page.ts')).toContain('createDocsLoader');
		expect(read('src/routes/docs/[...slug]/+page.ts')).toContain('"title":"Acme"');
		expect(read('src/app.html')).toContain('docs-kit:color-scheme');

		const packageJson = JSON.parse(read('package.json'));
		expect(Object.keys(packageJson.devDependencies)).toEqual(
			expect.arrayContaining(['@docs-kit/components', '@docs-kit/theme-default'])
		);
	});
});
