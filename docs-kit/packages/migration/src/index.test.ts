import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { convertMarkdown } from './components.js';
import { createMemoryMigrationFileSystem } from './filesystem.js';
import { parseFrontmatter, serializeFrontmatter } from './frontmatter.js';
import { migrateDocs, writeMigration } from './migrate.js';
import { detectDocsMigrator } from './migrators.js';
import { parseMkDocsNavigation, parseSummaryNavigation } from './navigation.js';
import { MigrationReport } from './report.js';

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

/** Fixture projects, one per supported source framework. */
const fixtures = {
	docusaurus: {
		'docusaurus.config.js': `module.exports = { title: 'Acme', tagline: 'Ship docs', url: 'https://acme.com' };`,
		'sidebars.js': 'module.exports = { docs: ["intro"] };',
		'docs/intro.mdx': [
			'---',
			'title: Introduction',
			'sidebar_label: Intro',
			'sidebar_position: 2',
			'sidebar_class_name: green',
			'---',
			'',
			"import Tabs from '@theme/Tabs';",
			'',
			'# Introduction',
			'',
			':::tip Pro tip',
			'Read the docs.',
			':::',
			'',
			'<Tabs>',
			'<TabItem value="npm">npm install acme</TabItem>',
			'<TabItem value="pnpm">pnpm add acme</TabItem>',
			'</Tabs>'
		].join('\n')
	},
	mkdocs: {
		'mkdocs.yml': [
			'site_name: Acme',
			'site_url: https://acme.com',
			'nav:',
			'  - Home: index.md',
			'  - Guides:',
			'    - Deploy: guides/deploy.md'
		].join('\n'),
		'docs/index.md': '# Home\n\n!!! warning "Careful"\n    Back up your files.\n',
		'docs/guides/deploy.md': '# Deploy\n'
	},
	mdbook: {
		'book.toml': '[book]\ntitle = "Acme Book"\ndescription = "The book"\n',
		'src/SUMMARY.md': '# Summary\n\n- [Intro](./intro.md)\n  - [Deep dive](./deep.md)\n',
		'src/intro.md': '# Intro\n\n{{#include ./snippet.md}}\n',
		'src/deep.md': '# Deep dive\n'
	},
	starlight: {
		'astro.config.mjs': "export default { integrations: [starlight({ title: 'Acme' })] };",
		'src/content/docs/index.md': [
			'---',
			'title: Home',
			'hero: welcome',
			'---',
			'',
			'<Aside type="caution" title="Heads up">Mind the gap.</Aside>'
		].join('\n')
	},
	fumadocs: {
		'source.config.ts': 'export default {};',
		'package.json': '{"name":"acme-docs"}',
		'content/docs/meta.json': '{"title":"Docs","pages":["index","install"]}',
		'content/docs/index.mdx': '---\ntitle: Home\nicon: house\n---\n\n<Callout type="warn">Careful.</Callout>',
		'content/docs/install.mdx': '---\ntitle: Install\n---\n\n<Steps>\n<Step title="Add">Install it.</Step>\n</Steps>'
	},
	vitepress: {
		'.vitepress/config.ts': "export default { title: 'Acme', description: 'Docs' };",
		'docs/index.md': '---\ntitle: Home\noutline: deep\n---\n\n::: warning\nBe careful.\n:::'
	},
	blume: {
		'blume.config.ts': "export default { title: 'Acme', url: 'https://acme.com' };",
		'content/index.md': '---\ntitle: Home\nicon: home\n---\n\n# Home'
	},
	svocs: {
		'svocs.config.ts': "export default { title: 'Acme', description: 'Docs' };",
		'src/docs/index.md': '---\ntitle: Home\nsidebar: Start\n---\n\n# Home'
	}
} as const;

function fsFor(name: keyof typeof fixtures) {
	return createMemoryMigrationFileSystem({ ...fixtures[name] });
}

describe('parseFrontmatter', () => {
	it('parses scalars, arrays, and one level of nesting', () => {
		const { data, body } = parseFrontmatter(
			[
				'---',
				'title: Install',
				'order: 3',
				'draft: true',
				'tags: [a, b]',
				'authors:',
				'  - ada',
				'  - grace',
				'sidebar:',
				'  label: Install',
				'---',
				'',
				'# Install'
			].join('\n')
		);

		expect(data).toEqual({
			title: 'Install',
			order: 3,
			draft: true,
			tags: ['a', 'b'],
			authors: ['ada', 'grace'],
			sidebar: { label: 'Install' }
		});
		expect(body.trim()).toBe('# Install');
	});

	it('reports lines it cannot parse instead of dropping them silently', () => {
		const { unparsed } = parseFrontmatter('---\ntitle: A\n?weird: [\n---\n\nbody');

		expect(unparsed).toEqual([{ line: 2, text: '?weird: [' }]);
	});

	it('round-trips through serialization with stable ordering', () => {
		expect(serializeFrontmatter({ title: "Ada's guide", order: 2, tags: ['a'] })).toBe(
			"---\ntitle: 'Ada''s guide'\norder: 2\ntags: [a]\n---\n"
		);
	});
});

describe('convertMarkdown', () => {
	it('converts component syntaxes into directives', () => {
		const report = new MigrationReport();
		const output = convertMarkdown(
			[
				'<Callout type="warn" title="Careful">Back up.</Callout>',
				'',
				'<Tabs>',
				'<Tab label="npm">npm i</Tab>',
				'</Tabs>',
				'',
				'<Cards>',
				'<Card title="Install" href="/docs/install">Get going.</Card>',
				'</Cards>'
			].join('\n'),
			{ file: 'a.mdx', report }
		);

		expect(output).toContain(':::warning{title="Careful"}');
		expect(output).toContain(':::tabs');
		expect(output).toContain('@tab npm');
		expect(output).toContain('::card{title="Install" href="/docs/install"}');
	});

	it('flags unconverted components with a file and line', () => {
		const report = new MigrationReport();
		convertMarkdown('# Title\n\n<MyWidget prop="a" />\n', { file: 'guide.mdx', report });

		expect(report.warnings[0]).toMatchObject({
			code: 'UNSUPPORTED_SYNTAX',
			file: 'guide.mdx',
			line: 3,
			snippet: '<MyWidget prop="a" />'
		});
	});
});

describe('navigation parsing', () => {
	it('parses mdBook summaries and MkDocs nav blocks', () => {
		expect(parseSummaryNavigation(fixtures.mdbook['src/SUMMARY.md'])).toEqual([
			{
				label: 'Intro',
				path: './intro',
				children: [{ label: 'Deep dive', path: './deep' }]
			}
		]);
		expect(parseMkDocsNavigation(fixtures.mkdocs['mkdocs.yml'])).toEqual([
			{ label: 'Home', path: 'index' },
			{ label: 'Guides', children: [{ label: 'Deploy', path: 'guides/deploy' }] }
		]);
	});
});

describe('detectDocsMigrator', () => {
	it('identifies every supported framework from its marker files', async () => {
		for (const name of Object.keys(fixtures) as Array<keyof typeof fixtures>) {
			expect((await detectDocsMigrator(fsFor(name)))?.id).toBe(name);
		}
	});

	it('fails with an actionable message when nothing matches', async () => {
		await expect(
			migrateDocs({ fs: createMemoryMigrationFileSystem({ 'readme.md': '# Hi' }) })
		).rejects.toThrow(/Could not detect the documentation framework/);
	});
});

describe('migrateDocs', () => {
	it('migrates a Docusaurus project end to end', async () => {
		const result = await migrateDocs({ fs: fsFor('docusaurus') });
		const page = result.files.find((file) => file.path === 'src/lib/docs/intro.md');

		expect(result.source).toBe('docusaurus');
		expect(result.config.site).toMatchObject({
			title: 'Acme',
			description: 'Ship docs',
			url: 'https://acme.com'
		});
		expect(page?.content).toContain('label: Intro');
		expect(page?.content).toContain('order: 2');
		expect(page?.content).toContain(':::tip{title="Pro tip"}');
		expect(page?.content).toContain('@tab npm');
		expect(page?.content).not.toContain("import Tabs from '@theme/Tabs'");
		expect(result.diagnostics.some((entry) => entry.code === 'FRONTMATTER_UNMAPPED')).toBe(true);
		expect(result.reviewReport).toContain('# Docusaurus migration report');
	});

	it('migrates MkDocs admonitions and navigation', async () => {
		const result = await migrateDocs({ fs: fsFor('mkdocs') });

		expect(result.config.site).toMatchObject({ title: 'Acme', url: 'https://acme.com' });
		expect(result.files.find((file) => file.path === 'src/lib/docs/index.md')?.content).toContain(
			':::warning{title="Careful"}'
		);
		expect(result.navigation).toHaveLength(2);
		expect(result.files.some((file) => file.path === 'navigation.json')).toBe(true);
	});

	it('migrates mdBook and flags preprocessor directives', async () => {
		const result = await migrateDocs({ fs: fsFor('mdbook') });

		expect(result.config.site.title).toBe('Acme Book');
		expect(result.navigation[0]?.children).toHaveLength(1);
		expect(
			result.diagnostics.find((entry) => entry.snippet?.includes('{{#include'))
		).toMatchObject({ code: 'UNSUPPORTED_SYNTAX', file: 'src/intro.md' });
	});

	it('migrates every other supported framework into valid output', async () => {
		for (const name of ['starlight', 'fumadocs', 'vitepress', 'blume', 'svocs'] as const) {
			const result = await migrateDocs({ fs: fsFor(name) });

			expect(result.source).toBe(name);
			expect(result.files.some((file) => file.path.endsWith('.md'))).toBe(true);
			expect(result.files.some((file) => file.path === 'docs.config.json')).toBe(true);
			expect(result.diagnostics.some((entry) => entry.severity === 'error')).toBe(false);
		}
	});

	it('converts Starlight asides and Fumadocs steps', async () => {
		const starlight = await migrateDocs({ fs: fsFor('starlight') });
		const fumadocs = await migrateDocs({ fs: fsFor('fumadocs') });

		expect(starlight.files.find((file) => file.path.endsWith('index.md'))?.content).toContain(
			':::warning{title="Heads up"}'
		);
		expect(fumadocs.files.find((file) => file.path.endsWith('install.md'))?.content).toContain(
			':::steps'
		);
	});

	it('reports a missing content directory as an error instead of writing nothing quietly', async () => {
		const result = await migrateDocs({
			fs: createMemoryMigrationFileSystem({ 'mkdocs.yml': 'site_name: Empty' })
		});

		expect(result.diagnostics[0]).toMatchObject({ code: 'SOURCE_NOT_DETECTED', severity: 'error' });
	});
});

describe('writeMigration', () => {
	it('writes into a new directory and leaves the source project untouched', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-migration-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'docs'), { recursive: true });
		await writeFile(join(root, 'mkdocs.yml'), 'site_name: Acme\n', 'utf8');
		await writeFile(join(root, 'docs/index.md'), '# Home\n', 'utf8');

		const result = await migrateDocs({ cwd: root });
		const summary = await writeMigration(result, { cwd: root, outDir: 'migrated' });

		expect(summary.written).toContain('src/lib/docs/index.md');
		expect(await readFile(join(root, 'migrated/src/lib/docs/index.md'), 'utf8')).toContain('# Home');
		expect(await readFile(join(root, 'docs/index.md'), 'utf8')).toBe('# Home\n');
	});

	it('never overwrites existing output without force', async () => {
		const root = await mkdtemp(join(tmpdir(), 'docs-kit-migration-'));
		temporaryRoots.push(root);
		await mkdir(join(root, 'docs'), { recursive: true });
		await writeFile(join(root, 'mkdocs.yml'), 'site_name: Acme\n', 'utf8');
		await writeFile(join(root, 'docs/index.md'), '# Home\n', 'utf8');

		const result = await migrateDocs({ cwd: root });
		await writeMigration(result, { cwd: root, outDir: 'migrated' });
		await writeFile(join(root, 'migrated/src/lib/docs/index.md'), '# Edited\n', 'utf8');

		const second = await writeMigration(result, { cwd: root, outDir: 'migrated' });
		expect(second.skipped).toContain('src/lib/docs/index.md');
		expect(await readFile(join(root, 'migrated/src/lib/docs/index.md'), 'utf8')).toBe('# Edited\n');

		const forced = await writeMigration(result, { cwd: root, outDir: 'migrated', force: true });
		expect(forced.written).toContain('src/lib/docs/index.md');
	});
});
