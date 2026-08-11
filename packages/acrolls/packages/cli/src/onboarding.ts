import { readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Args } from './util.js';
import { exists } from './util.js';
import { detectHost } from './integrate.js';

export type OnboardingOptions = {
	root: string;
	docsDir: string;
	baseHref: string;
	mode: 'foundation' | 'default';
	acrollsRoot?: string;
};

export type OnboardingStep = {
	id: string;
	title: string;
	file?: string;
	action: string;
	command?: string;
	code?: string;
	caution?: string;
	verify: string;
	completed: boolean;
};

export type OnboardingPlan = {
	version: 1;
	root: string;
	host: {
		kind: string;
		hasKit: boolean;
		hasSvelte: boolean;
		hasMdsvex: boolean;
		hasAcrolls: boolean;
		hasDocs: boolean;
	};
	docsDir: string;
	baseHref: string;
	mode: 'foundation' | 'default';
	steps: OnboardingStep[];
};

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

export async function buildOnboardingPlan(options: OnboardingOptions): Promise<OnboardingPlan> {
	const root = resolve(options.root);
	const detectedHost = await detectHost(root);
	const host = 'hasKit' in detectedHost
		? detectedHost
		: {
				...detectedHost,
				hasKit: false,
				hasSvelte: false,
				hasMdsvex: false,
				hasAcrolls: false,
				deps: {},
				svelteConfig: null,
				layout: null
			};
	const docsDir = options.docsDir.replace(/^\.?\//, '').replace(/\\/g, '/').replace(/\/$/, '') || 'docs';
	const baseHref = normalizeBaseHref(options.baseHref);
	const mode = options.mode;
	const docsAbsolute = resolve(root, docsDir);
	const sourceDirectory = resolve(root, 'src/lib/docs');
	const globRoot = toPosix(relative(sourceDirectory, docsAbsolute));
	const contentGlob = globRoot.startsWith('.') ? globRoot : `./${globRoot}`;
	const contentPrefix = `${contentGlob.replace(/^\.\//, '')}/`;
	const configFile = host.svelteConfig ?? 'svelte.config.js';
	const layoutFile = host.layout ?? 'src/routes/+layout.svelte';
	const routeDirectory = baseHref === '/' ? 'src/routes' : `src/routes${baseHref}`;
	const docsLayoutFile = `${routeDirectory}/+layout.svelte`;
	const configSource = await readOptional(resolve(root, configFile));
	const layoutSource = await readOptional(resolve(root, layoutFile));
	const docsLayoutSource = await readOptional(resolve(root, docsLayoutFile));
	const hostDeps = 'deps' in host ? (host.deps as Record<string, string>) : {};
	const hasDocs = Boolean(hostDeps['@acrolls/docs']);
	const localAcrollsRoot = await resolveLocalAcrollsRoot(options.acrollsRoot);
	const nestedHref = baseHref === '/' ? '/<nested-slug>' : `${baseHref}/<nested-slug>`;

	const sourceFile = 'src/lib/docs/source.ts';
	const documentPageFile = 'src/lib/docs/DocumentPage.svelte';
	const rootRouteFile = `${routeDirectory}/+page.svelte`;
	const catchAllSvelteFile = `${routeDirectory}/[...slug]/+page.svelte`;
	const catchAllLoadFile = `${routeDirectory}/[...slug]/+page.ts`;

	const sourceCode = docsSourceSnippet({ contentGlob, contentPrefix, baseHref });
	const docsLayoutCode = docsLayoutSnippet({ baseHref });
	const documentPageCode = documentPageSnippet();
	const catchAllLoadCode = catchAllLoadSnippet();
	const catchAllSvelteCode = catchAllSvelteSnippet();

	const steps: OnboardingStep[] = [
		{
			id: 'install',
			title: 'Install the host dependencies',
			action: 'Run this from the existing SvelteKit project root. The command is read-only until you execute it.',
			command: installCommand(localAcrollsRoot),
			caution:
				'For a local Acrolls clone, do not install @acrolls/sveltekit through file:; it has workspace-internal dependencies. Use @acrolls/mdsvex directly as the next step shows.',
			verify: 'package.json contains @acrolls/mdsvex, @acrolls/svelte, @acrolls/styles, and @acrolls/docs.',
			completed: Boolean(host.hasAcrolls && host.hasMdsvex && host.hasSvelte && hasDocs)
		},
		{
			id: 'preprocessor',
			title: 'Wire the Acrolls Markdown preprocessor',
			file: configFile,
			action:
				'Open this file. Merge the import and preprocessor into the existing config; keep your adapter and kit settings.',
			code: preprocessorSnippet(),
			caution:
				'Use createAcrollsMdsvexPreprocessor from @acrolls/mdsvex. If the config already calls mdsvex(...), replace that call rather than adding a second Markdown preprocessor. Do not replace a complex existing preprocess array blindly. .svx remains executable Svelte and fail-fast.',
			verify:
				'The config has .svelte, .md, and .svx extensions and calls createAcrollsMdsvexPreprocessor() (or the workspace-only SvelteKit wrapper).',
			completed:
				configSource.includes('createAcrollsMdsvexPreprocessor') ||
				configSource.includes('createAcrollsSvelteKitMdsvexPreprocessor')
		},
		{
			id: 'styles',
			title: 'Add the Acrolls style preset',
			file: docsLayoutFile,
			action: `Add this import once to the docs surface. The recommended location is ${docsLayoutFile}; choose the ${mode} preset and do not load both presets.`,
			code: `import '@acrolls/styles/${mode}.css';`,
			caution:
				'Import one Acrolls style preset exactly once per docs/blog surface. If the root layout already owns the preset, leave this line out of the docs layout instead of importing it twice.',
			verify: `The chosen @acrolls/styles/${mode}.css import appears exactly once in the docs surface.`,
			completed:
				layoutSource.includes(`@acrolls/styles/${mode}.css`) ||
				docsLayoutSource.includes(`@acrolls/styles/${mode}.css`)
		},
		{
			id: 'content',
			title: 'Create the first docs content',
			file: `${docsDir}/index.md`,
			action: `Create this file (or use your existing Markdown directory instead of ${docsDir}/).`,
			code: `---\ntitle: Documentation\ndescription: The documentation home\n---\n\n# Documentation\n\nYour first Acrolls documentation page.`,
			caution:
				'Frontmatter is optional in migration mode, but title and description are recommended for navigation, page metadata, and the visible banner. Keep executable Svelte in .svx, not ordinary .md prose.',
			verify: `The file exists and opens as Markdown at ${baseHref}.`,
			completed: await exists(resolve(root, docsDir, 'index.md'))
		},
		{
			id: 'source',
			title: 'Create the generated docs source',
			file: sourceFile,
			action: `Create this file. It maps the ${docsDir}/ corpus into a serializable Acrolls page tree.`,
			code: sourceCode,
			caution:
				'The lazy component glob and eager metadata glob must use the identical pattern. The contentPrefix must match that pattern or every route key will be wrong. Filesystem folders are discovered automatically; add folders only for label/order/presentation overrides. This starter discovers .md only; .svx is intentionally explicit.',
			verify: 'The source exports docs and the two glob patterns are identical.',
			completed: await exists(resolve(root, sourceFile))
		},
		{
			id: 'docs-layout',
			title: 'Add the docs shell layout',
			file: docsLayoutFile,
			action: 'Create this route layout around the docs pages.',
			code: docsLayoutCode,
			caution:
				'DocsShell owns the docs chrome. If your site already owns the outer three-column shell, use DocsSidebar instead and do not nest a second DocsShell inside the center column.',
			verify: `The docs layout renders DocsShell with docs.nav and imports @acrolls/docs/styles.css.`,
			completed: await exists(resolve(root, docsLayoutFile))
		},
		{
			id: 'document-page',
			title: 'Add the document renderer',
			file: documentPageFile,
			action: 'Create this shared page component. It keeps document loading lazy and wraps articles with Publication.',
			code: documentPageCode,
			caution:
				'Keep the Publication wrapper. It mounts code-frame and Mermaid enhancers; CSS alone does not provide those behaviors.',
			verify: 'The component resolves docs.get(slug), awaits document.loader(), and renders <Publication>.',
			completed: await exists(resolve(root, documentPageFile))
		},
		{
			id: 'routes',
			title: 'Add the docs routes',
			file: `${rootRouteFile}, ${catchAllLoadFile}, ${catchAllSvelteFile}`,
			action: 'Create the root page and the nested catch-all route. Copy each snippet into its named file.',
			code: `// ${rootRouteFile}\n${rootRouteSnippet()}\n\n// ${catchAllLoadFile}\n${catchAllLoadCode}\n\n// ${catchAllSvelteFile}\n${catchAllSvelteCode}`,
			caution:
				'The root route handles the empty slug. The catch-all entries must exclude the empty root slug, or the same page will be generated twice.',
			verify: `Both ${baseHref} and a nested ${baseHref}/<slug> route return a page; unknown slugs return 404.`,
			completed:
				(await exists(resolve(root, rootRouteFile))) &&
				(await exists(resolve(root, catchAllLoadFile))) &&
				(await exists(resolve(root, catchAllSvelteFile)))
		},
		{
			id: 'preflight',
			title: 'Preflight the corpus before starting the host',
			action: 'Run this from the host root and fix the report before deployment.',
			command: `acrolls validate ./${docsDir} --mode migration --on-invalid error-page --report ./.acrolls-report.json`,
			caution:
				'Use authored mode or --on-invalid fail for an all-or-nothing corpus. error-page is a visible Markdown fallback, not true import exclusion. Invalid .svx remains fail-fast.',
			verify: 'The summary has no unexpected rejected documents, or every rejected Markdown page is intentionally visible as a diagnostic page.',
			completed: false
		},
		{
			id: 'local-check',
			title: 'Run the local docs check',
			action: 'Start the host, then exercise the root, a nested page, refresh, and an unknown slug.',
			command: 'pnpm dev',
			caution:
				'If the browser shows a compiler avalanche, stop and inspect the first source file in the preflight report. Do not repair dozens of generated Svelte errors one by one.',
			verify: `Open ${baseHref}, ${nestedHref}, refresh both, and confirm the browser console has no runtime errors.`,
			completed: false
		},
		{
			id: 'deploy',
			title: 'Build, deploy, and verify the docs URL',
			action: 'Run the production build, deploy using the host platform, and verify the public docs route.',
			command: 'pnpm build',
			caution:
				'Acrolls does not choose your adapter or deployment provider. Keep the host adapter, environment variables, base path, and SPA/SSR routing rules under host ownership.',
			verify: `After deployment, check ${baseHref}, ${nestedHref}, direct refreshes, code highlighting, Mermaid, navigation, and a deliberate 404.`,
			completed: false
		}
	];

	return {
		version: 1,
		root,
		host: {
			kind: host.kind,
			hasKit: Boolean(host.hasKit),
			hasSvelte: Boolean(host.hasSvelte),
			hasMdsvex: Boolean(host.hasMdsvex),
			hasAcrolls: Boolean(host.hasAcrolls),
			hasDocs
		},
		docsDir,
		baseHref,
		mode,
		steps
	};
}

export function renderOnboardingPlan(plan: OnboardingPlan): string {
	const lines = onboardingHeader(plan);

	for (const [index, step] of plan.steps.entries()) {
		lines.push(...renderStepLines(plan, index, step), '');
	}

	return lines.join('\n');
}

/** Render one checkpoint for the interactive terminal walkthrough. */
export function renderOnboardingStep(plan: OnboardingPlan, index: number, step: OnboardingStep): string {
	return renderStepLines(plan, index, step).join('\n');
}

function onboardingHeader(plan: OnboardingPlan): string[] {
	return [
		'Acrolls onboarding',
		'=================',
		`Host: ${plan.host.kind} at ${plan.root}`,
		`Docs: ${plan.docsDir} → ${plan.baseHref}`,
		`Style mode: ${plan.mode}`,
		'',
		'Run each step in order. This command is guidance-only; it does not edit host files.',
		'Use `acrolls onboard --check` to rescan completed checkpoints or `--json` for a modal/UI client.',
		''
	];
}

function renderStepLines(plan: OnboardingPlan, index: number, step: OnboardingStep): string[] {
	const lines = [`Step ${index + 1} of ${plan.steps.length}`, `[${step.completed ? 'done' : '    '}] ${step.title}`];
	if (step.file) lines.push(`FILE: ${step.file}`);
	lines.push(step.action);
	if (step.command) lines.push(`\nCOMMAND:\n  ${step.command}`);
	if (step.code) lines.push(`\nCODE:\n${indent(step.code)}`);
	if (step.caution) lines.push(`\nWATCH OUT:\n  ${step.caution}`);
	lines.push(`\nCHECK:\n  ${step.verify}`);
	return lines;
}

export async function cmdOnboard(args: Args): Promise<number> {
	const modeValue = String(args.flags.mode ?? 'default');
	if (modeValue !== 'foundation' && modeValue !== 'default') {
		console.error('Invalid --mode. Use foundation or default.');
		return 2;
	}
	const root = process.cwd();
	const plan = await buildOnboardingPlan({
		root,
		docsDir: String(args.flags['docs-dir'] ?? 'docs'),
		baseHref: String(args.flags['base-href'] ?? '/docs'),
		mode: modeValue,
		acrollsRoot: typeof args.flags['acrolls-root'] === 'string' ? String(args.flags['acrolls-root']) : undefined
	});

	if (!plan.host.hasKit) {
		console.error(`Acrolls onboarding expects an existing SvelteKit host; detected ${plan.host.kind}.`);
		console.error('Use the SvelteKit adapter first, then rerun `acrolls onboard`.');
		return 1;
	}

	if (args.flags.json) {
		console.log(JSON.stringify(plan, null, 2));
		return 0;
	}

	const checkOnly = Boolean(args.flags.check);
	const interactive =
		!checkOnly &&
		!args.flags['non-interactive'] &&
		(args.flags.interactive === true || (Boolean(process.stdin.isTTY) && Boolean(process.stdout.isTTY)));

	if (!interactive) {
		console.log(renderOnboardingPlan(plan));
		console.log('Non-interactive mode: complete the steps above, then rerun `acrolls onboard --check`.');
		return 0;
	}

	console.log(onboardingHeader(plan).join('\n'));
	console.log('Interactive mode: one checkpoint at a time. Press Enter or type "next" to move forward; type "q" to pause.');
	const readline = await import('node:readline/promises');
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	try {
		for (const [index, step] of plan.steps.entries()) {
			if (step.completed) continue;
			console.log(`\n${renderOnboardingStep(plan, index, step)}`);
			let answer = await rl.question('\nMove to next? [Enter/next] · [q] pause: ');
			while (!isNextCommand(answer)) {
				if (isQuitCommand(answer)) {
					console.log('Onboarding paused. Rerun `acrolls onboard --check` to resume from the remaining checkpoints.');
					return 0;
				}
				console.log('Please press Enter, type "next", or type "q" to pause.');
				answer = await rl.question('Move to next? [Enter/next] · [q] pause: ');
			}
		}
	} finally {
		rl.close();
	}

	console.log('\nOnboarding walkthrough complete. Run `acrolls onboard --check`, then deploy and verify the docs URL.');
	return 0;
}

function normalizedAnswer(answer: string): string {
	return answer.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isNextCommand(answer: string): boolean {
	const value = normalizedAnswer(answer);
	return value === '' || value === 'n' || value === 'next' || value === 'move to next';
}

function isQuitCommand(answer: string): boolean {
	const value = normalizedAnswer(answer);
	return value === 'q' || value === 'quit' || value === 'exit';
}

function normalizeBaseHref(value: string): string {
	const trimmed = value.trim();
	if (!trimmed || trimmed === '/') return '/';
	return `/${trimmed.replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

async function resolveLocalAcrollsRoot(explicit?: string): Promise<string | undefined> {
	const candidates = [explicit, process.env.ACROLLS_ROOT, PACKAGE_ROOT].filter(
		(value): value is string => Boolean(value)
	);
	for (const candidate of candidates) {
		const root = resolve(candidate);
		if (await exists(join(root, 'packages/mdsvex/package.json'))) return root;
	}
	return undefined;
}

function installCommand(acrollsRoot?: string): string {
	if (acrollsRoot) {
		return [
			`pnpm add file:${acrollsRoot}/packages/mdsvex file:${acrollsRoot}/packages/svelte file:${acrollsRoot}/packages/styles file:${acrollsRoot}/packages/docs`,
			'pnpm add -D mdsvex'
		].join('\n');
	}
	return ['pnpm add @acrolls/mdsvex @acrolls/svelte @acrolls/styles @acrolls/docs', 'pnpm add -D mdsvex'].join('\n');
}

function preprocessorSnippet(): string {
	return `import { createAcrollsMdsvexPreprocessor } from '@acrolls/mdsvex';

const acrolls = createAcrollsMdsvexPreprocessor({
  extensions: ['.md', '.svx'],
  // For an existing corpus only, opt in deliberately:
  // onInvalidDocument: 'error-page'
});

// Merge into the existing config:
preprocess: [vitePreprocess(), acrolls]`;
}

function docsSourceSnippet({
	contentGlob,
	contentPrefix,
	baseHref
}: {
	contentGlob: string;
	contentPrefix: string;
	baseHref: string;
}): string {
	return `import type { Component } from 'svelte';
import {
  createDocsContentSource,
  defineDocsConfig,
  type DocsMetadata
} from '@acrolls/docs/content';

type DocsArticle = Component;
const contentPrefix = '${contentPrefix}';
const modules = import.meta.glob('${contentGlob}/**/*.md', { import: 'default' }) as Record<
  string,
  () => Promise<DocsArticle>
>;
const metadata = import.meta.glob('${contentGlob}/**/*.md', {
  eager: true,
  import: 'metadata'
}) as Record<string, DocsMetadata>;

export const docs = createDocsContentSource({
  documents: Object.entries(modules).map(([key, load]) => ({
    key: key.slice(contentPrefix.length),
    metadata: metadata[key],
    load
  })),
  config: defineDocsConfig({
    title: 'Documentation',
    baseHref: '${baseHref}',
    subtitle: 'Generated from Markdown'
  })
});`;
}

function docsLayoutSnippet({ baseHref }: { baseHref: string }): string {
	return `<script lang="ts">
  import '@acrolls/docs/styles.css';
  import { page } from '$app/state';
  import { DocsShell } from '@acrolls/docs';
  import { docs } from '$lib/docs/source';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
  const isIndex = $derived(page.url.pathname === '${baseHref}' || page.url.pathname === '${baseHref}/');
</script>

<DocsShell nav={docs.nav} pathname={page.url.pathname} showToc={!isIndex} showPager={!isIndex}>
  {@render children()}
</DocsShell>`;
}

function documentPageSnippet(): string {
	return `<script lang="ts">
  import { docs } from '$lib/docs/source';
  import { Publication } from '@acrolls/svelte';

  let { slug }: { slug: string } = $props();
  const document = $derived(docs.get(slug));
</script>

{#if document}
  {#await document.loader() then Article}
    <Publication><Article /></Publication>
  {:catch loadError}
    <p>Could not load this documentation page: {loadError instanceof Error ? loadError.message : String(loadError)}</p>
  {/await}
{:else}
  <p>Documentation page not found.</p>
{/if}`;
}

function rootRouteSnippet(): string {
	return `<script lang="ts">
  import DocumentPage from '$lib/docs/DocumentPage.svelte';
</script>

<DocumentPage slug="" />`;
}

function catchAllLoadSnippet(): string {
	return `import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { docs } from '$lib/docs/source';

export const entries: EntryGenerator = () =>
  docs.documents.filter((document) => document.slug).map((document) => ({ slug: document.slug }));

export const load: PageLoad = ({ params }) => {
  const slug = params.slug ?? '';
  if (!docs.get(slug)) error(404, \`Documentation page "\${slug || 'index'}" not found\`);
  return { slug };
};`;
}

function catchAllSvelteSnippet(): string {
	return `<script lang="ts">
  import DocumentPage from '$lib/docs/DocumentPage.svelte';
  let { data }: { data: { slug: string } } = $props();
</script>

<DocumentPage slug={data.slug} />`;
}

async function readOptional(path: string): Promise<string> {
	try {
		return await readFile(path, 'utf8');
	} catch {
		return '';
	}
}

function indent(value: string): string {
	return value
		.split('\n')
		.map((line) => `  ${line}`)
		.join('\n');
}

function toPosix(value: string): string {
	return value.replaceAll('\\', '/');
}
