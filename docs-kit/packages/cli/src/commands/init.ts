import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { booleanOption, report, stringOption, type DocsCliCommand } from '../runtime.js';

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

/**
 * Detects the package manager from lockfiles, falling back to npm.
 *
 * Directories are searched from `cwd` upwards, because in a monorepo the lockfile sits at
 * the workspace root while `docs init` runs inside one package.
 */
export async function detectPackageManager(cwd: string): Promise<PackageManager> {
	const lockfiles: Array<[string, PackageManager]> = [
		['pnpm-lock.yaml', 'pnpm'],
		['bun.lockb', 'bun'],
		['bun.lock', 'bun'],
		['yarn.lock', 'yarn'],
		['package-lock.json', 'npm']
	];

	let directory = resolve(cwd);

	for (;;) {
		for (const [file, manager] of lockfiles) {
			if (existsSync(join(directory, file))) {
				return manager;
			}
		}

		try {
			const packageJson = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8')) as {
				packageManager?: string;
			};
			const declared = packageJson.packageManager?.split('@')[0];
			if (declared === 'pnpm' || declared === 'yarn' || declared === 'bun' || declared === 'npm') {
				return declared;
			}
		} catch {
			// No package.json at this level is fine; the search continues upwards.
		}

		const parent = dirname(directory);
		if (parent === directory) {
			return 'npm';
		}
		directory = parent;
	}
}

export function installCommand(manager: PackageManager, packages: readonly string[]): string {
	const args = packages.join(' ');
	return manager === 'npm'
		? `npm install -D ${args}`
		: manager === 'yarn'
			? `yarn add -D ${args}`
			: `${manager} add -D ${args}`;
}

export interface DocsInitFile {
	path: string;
	content: string;
	/** Why the file is needed, shown in the plan. */
	purpose: string;
}

export interface DocsInitPatch {
	path: string;
	/** Applied only when the file matches the expected shape. */
	apply: (source: string) => string | undefined;
	/** What to do by hand when the patch cannot be applied safely. */
	manual: string;
	purpose: string;
}

export interface DocsInitPlanOptions {
	basePath: string;
	contentDirectory: string;
	siteTitle: string;
	outDir: string;
}

const requiredPackages = [
	'@docs-kit/core',
	'@docs-kit/vite',
	'@docs-kit/mdsvex',
	'@docs-kit/components',
	'@docs-kit/theme-default',
	'mdsvex'
];

function routeLoad(options: DocsInitPlanOptions): string {
	return `import { error } from '@sveltejs/kit';
import {
	findManifestPage,
	getDocsManifestPageKey,
	getDocsNavigation,
	parseDocsPath,
	type DocsRoutingOptions
} from '@docs-kit/core';
import { manifest, pageImporters } from 'virtual:docs-kit/manifest';

import type { EntryGenerator, PageLoad } from './$types';

const basePath = ${JSON.stringify(options.basePath)};
const routing: DocsRoutingOptions = { basePath };

export const prerender = true;

/** Prerender entries come from the manifest, so a catch-all route needs no crawlable links. */
export const entries: EntryGenerator = () => manifest.pages.map((page) => ({ slug: page.slug }));

export const load: PageLoad = async ({ params }) => {
	const target = parseDocsPath(\`\${basePath}/\${params.slug ?? ''}\`, routing) ?? {
		slug: params.slug ?? ''
	};
	const page = findManifestPage(manifest, target.slug);

	if (!page) {
		error(404, \`No documentation page matches "\${target.slug}".\`);
	}

	const importer = pageImporters[getDocsManifestPageKey(page)];

	if (!importer) {
		error(404, \`No compiled module exists for "\${page.slug}".\`);
	}

	const module = await importer();

	return {
		page,
		basePath,
		navigation: getDocsNavigation(manifest),
		content: module.default,
		site: { title: ${JSON.stringify(options.siteTitle)} }
	};
};
`;
}

const routeComponent = `<script lang="ts">
	import { DocsPage } from '@docs-kit/theme-default';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const Content = $derived(data.content);
</script>

<DocsPage
	data={{
		page: data.page,
		navigation: data.navigation,
		site: data.site,
		basePath: data.basePath
	}}
>
	<Content />
</DocsPage>
`;

/**
 * Appends entries to the array literal that `key` opens, keeping the existing ones.
 *
 * A regular expression cannot find the array's end once its entries contain brackets of
 * their own, so the closing bracket is located by counting depth. Returns the source
 * unchanged when the key is absent or the literal never closes, which is the signal the
 * caller uses to fall back to a manual instruction.
 */
function appendToArrayLiteral(source: string, key: string, entries: readonly string[]): string {
	const opening = new RegExp(`${key}\\s*:\\s*\\[`).exec(source);

	if (!opening) {
		return source;
	}

	const start = opening.index + opening[0].length;
	let depth = 1;
	let end = -1;

	for (let index = start; index < source.length; index += 1) {
		const character = source[index];
		if (character === '[') {
			depth += 1;
		} else if (character === ']') {
			depth -= 1;
			if (depth === 0) {
				end = index;
				break;
			}
		}
	}

	if (end === -1) {
		return source;
	}

	// Reuse the indentation of the line the key sits on, so the result matches the file.
	const lineStart = source.lastIndexOf('\n', opening.index) + 1;
	const indent = /^[\t ]*/.exec(source.slice(lineStart, opening.index))?.[0] ?? '';
	const item = `${indent}\t`;
	const existing = source
		.slice(start, end)
		.split(/,(?![^([{]*[)\]}])/)
		.map((entry) => entry.trim())
		.filter(Boolean);
	const all = [...existing, ...entries].map((entry) => `${item}${entry.replace(/\n/g, `\n${item}`)}`);

	return `${source.slice(0, start)}\n${all.join(',\n')}\n${indent}${source.slice(end)}`;
}

/** Inserts statements after the last top-level import, or at the top when there is none. */
function insertAfterImports(source: string, statements: string): string {
	const imports = [...source.matchAll(/^import\s[^\n]*?;?\s*$/gm)];
	const last = imports.at(-1);

	if (!last) {
		return `${statements}\n${source}`;
	}

	const end = last.index + last[0].length;
	return `${source.slice(0, end)}\n${statements}${source.slice(end)}`;
}

/** Files and patches `docs init` would apply, without touching the project. */
export function createDocsInitPlan(options: DocsInitPlanOptions): {
	files: DocsInitFile[];
	patches: DocsInitPatch[];
} {
	const routeRoot = `src/routes${options.basePath}`;

	const files: DocsInitFile[] = [
		{
			path: 'docs.config.js',
			purpose: 'Documentation configuration, read by the CLI.',
			content: `import { defineDocsConfig } from '@docs-kit/core';

export default defineDocsConfig({
	site: { title: ${JSON.stringify(options.siteTitle)} },
	content: { directory: ${JSON.stringify(options.contentDirectory)} },
	routing: { basePath: ${JSON.stringify(options.basePath)} }
});
`
		},
		{
			path: `${routeRoot}/[...slug]/+page.ts`,
			purpose: 'Catch-all route loader.',
			content: routeLoad(options)
		},
		{
			path: `${routeRoot}/[...slug]/+page.svelte`,
			purpose: 'Catch-all route component.',
			content: routeComponent
		},
		{
			path: `${options.contentDirectory}/index.md`,
			purpose: 'Starter documentation page.',
			content: `---
title: ${options.siteTitle}
description: Start here.
---

# ${options.siteTitle}

Edit \`${options.contentDirectory}/index.md\` to replace this page.

:::tip{title="Next steps"}
Add more Markdown files beside this one; navigation follows the file tree.
:::
`
		}
	];

	const patches: DocsInitPatch[] = [
		{
			path: 'vite.config.ts',
			purpose: 'Register the documentation plugin before sveltekit().',
			manual: `Add the plugin before sveltekit(): plugins: [docs({ content: '${options.contentDirectory}', basePath: '${options.basePath}' }), sveltekit()]`,
			apply(source) {
				if (source.includes('@docs-kit/vite')) {
					return undefined;
				}

				// The plugin runs before sveltekit(), so it leads the array rather than trailing it.
				const plugin = `docs({ content: ${JSON.stringify(options.contentDirectory)}, basePath: ${JSON.stringify(options.basePath)} })`;
				const withPlugin = source.replace(
					/(plugins\s*:\s*\[)(\s*)/,
					(match, open: string, space: string) => `${open}${space}${plugin},${space || ' '}`
				);

				return withPlugin === source
					? undefined
					: insertAfterImports(withPlugin, "import { docs } from '@docs-kit/vite';\n");
			}
		},
		{
			path: 'svelte.config.js',
			purpose: 'Compile Markdown through the documentation pipeline.',
			manual:
				"Add extensions: ['.svelte', '.md', '.svx'] and preprocess: [vitePreprocess(), docsMarkdown(), mdsvex({ extensions: ['.md', '.svx'], remarkPlugins: docsPipeline.remarkPlugins, rehypePlugins: docsPipeline.rehypePlugins, highlight: docsPipeline.highlight })]",
			apply(source) {
				if (source.includes('@docs-kit/mdsvex')) {
					return undefined;
				}

				// Checked against the original source: the inserted mdsvex() call declares its
				// own `extensions`, which must not be mistaken for the config's.
				const hasExtensions = /^\s*extensions\s*:/m.test(source);

				// The documentation preprocessors are appended so they run after whatever the
				// project already has, matching mdsvex's requirement to see the Markdown last.
				const withPreprocess = appendToArrayLiteral(source, 'preprocess', [
					'docsMarkdown()',
					"mdsvex({\n\textensions: ['.md', '.svx'],\n\tremarkPlugins: docsPipeline.remarkPlugins,\n\trehypePlugins: docsPipeline.rehypePlugins,\n\thighlight: docsPipeline.highlight\n})"
				]);

				if (withPreprocess === source) {
					return undefined;
				}

				const withExtensions = hasExtensions
					? withPreprocess
					: withPreprocess.replace(
							/(const config\s*=\s*\{|export default \{)/,
							"$1\n\textensions: ['.svelte', '.md', '.svx'],"
						);

				return insertAfterImports(
					withExtensions,
					"import { docsMarkdown, docsMdsvex } from '@docs-kit/mdsvex';\nimport { mdsvex } from 'mdsvex';\n\nconst docsPipeline = docsMdsvex();\n"
				);
			}
		},
		{
			path: '.gitignore',
			purpose: 'Keep generated artifacts out of version control.',
			manual: `Add "${options.outDir}" to .gitignore.`,
			apply(source) {
				return source.split('\n').some((line) => line.trim() === options.outDir)
					? undefined
					: `${source.replace(/\n*$/, '\n')}${options.outDir}\n`;
			}
		}
	];

	return { files, patches };
}

async function writeFileAtomic(path: string, content: string): Promise<void> {
	await mkdir(dirname(path), { recursive: true });
	const temporaryPath = `${path}.tmp`;
	await writeFile(temporaryPath, content, 'utf8');
	await rename(temporaryPath, path);
}

/**
 * `docs init` — adds the framework to an existing SvelteKit application.
 *
 * It prints a plan by default and only touches the project with `--write`. Existing files
 * are never overwritten without `--force`, and a configuration file that does not match the
 * expected shape is left alone with instructions instead of being rewritten.
 */
export const initCommand: DocsCliCommand = {
	name: 'init',
	summary: 'Add docs-kit to an existing SvelteKit project.',
	usage:
		'docs init [--base-path /docs] [--content src/lib/docs] [--title <name>] [--write] [--force] [--json]',
	async run(args, context) {
		const options: DocsInitPlanOptions = {
			basePath: `/${(stringOption(args, 'base-path') ?? '/docs').split('/').filter(Boolean).join('/')}`,
			contentDirectory: stringOption(args, 'content') ?? 'src/lib/docs',
			siteTitle: stringOption(args, 'title') ?? 'Documentation',
			outDir: stringOption(args, 'out-dir') ?? '.docs-kit'
		};
		const write = booleanOption(args, 'write');
		const force = booleanOption(args, 'force');
		const { files, patches } = createDocsInitPlan(options);
		const manager = await detectPackageManager(context.cwd);

		const created: string[] = [];
		const skipped: string[] = [];
		const patched: string[] = [];
		const manual: string[] = [];

		for (const file of files) {
			const target = resolve(context.cwd, file.path);
			const exists = existsSync(target);

			if (exists && !force) {
				skipped.push(file.path);
				continue;
			}

			if (write) {
				await writeFileAtomic(target, file.content);
			}
			created.push(file.path);
		}

		for (const patch of patches) {
			const target = resolve(context.cwd, patch.path);

			if (!existsSync(target)) {
				manual.push(`${patch.path} does not exist. ${patch.manual}`);
				continue;
			}

			const source = await readFile(target, 'utf8');
			const next = patch.apply(source);

			if (next === undefined) {
				manual.push(`${patch.path} was left unchanged. ${patch.manual}`);
				continue;
			}

			if (write) {
				await writeFileAtomic(target, next);
			}
			patched.push(patch.path);
		}

		report(
			context,
			args,
			{
				write,
				created,
				skipped,
				patched,
				manual,
				install: installCommand(manager, requiredPackages),
				packageManager: manager
			},
			[
				write ? 'Applied docs-kit setup:' : 'Planned docs-kit setup (nothing was written):',
				...created.map((path) => `  ${write ? 'created' : 'create'}  ${path}`),
				...patched.map((path) => `  ${write ? 'patched' : 'patch'}   ${path}`),
				...skipped.map((path) => `  skipped  ${path} (already exists; pass --force to replace)`),
				...(manual.length > 0 ? ['', 'Needs a manual step:'] : []),
				...manual.map((entry) => `  ${entry}`),
				'',
				`Install the packages: ${installCommand(manager, requiredPackages)}`,
				...(write ? [] : ['', 'Re-run with --write to apply.'])
			]
		);

		return 0;
	}
};
