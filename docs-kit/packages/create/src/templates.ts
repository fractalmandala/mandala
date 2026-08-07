export interface StandaloneTemplateOptions {
	/** Project name written into `package.json`. */
	name: string;
	/** Content directory the generated app reads, relative to the generated app. */
	contentDirectory: string;
	/** Documentation mount path. */
	basePath: string;
	siteTitle: string;
	siteDescription?: string;
	/** Workspace protocol or published version range for framework packages. */
	dependencyVersion?: string;
	/** Include a starter Markdown page. Defaults to true. */
	starterContent?: boolean;
}

export interface StandaloneFile {
	path: string;
	content: string;
}

const pageLoadModule = `import { createDocsEntries, createDocsLoader } from '@docs-kit/sveltekit';
import { manifest, pageImporters } from 'virtual:docs-kit/manifest';

export const prerender = true;

export const entries = createDocsEntries({ manifest, collection: 'default' });
export const load = createDocsLoader({
	manifest,
	pageImporters,
	collection: 'default',
	site: __DOCS_SITE__
});
`;

const pageComponent = `<script lang="ts">
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
		basePath: __DOCS_BASE_PATH__
	}}
>
	<Content />
</DocsPage>
`;

const appHtml = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
		<script>
			// Applies a stored colour scheme before first paint, matching the theme's themeScript.
			(function () {
				try {
					var v = localStorage.getItem('docs-kit:color-scheme');
					if (v === 'light' || v === 'dark') document.documentElement.setAttribute('data-theme', v);
				} catch (e) {}
			})();
		</script>
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
`;

const appTypes = `/// <reference types="@docs-kit/vite/client" />

declare global {
	namespace App {}
}

export {};
`;

const layoutLoad = `/** Prerender the whole generated site; the docs route supplies its own entries. */
export const prerender = true;
`;

const layout = `<script lang="ts">
	import '@docs-kit/theme-default/tokens.css';
	import '@docs-kit/theme-default/theme.css';
	import '@docs-kit/components/styles.css';

	let { children } = $props();
</script>

{@render children()}
`;

const svelteConfig = `import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { docsMarkdown, docsMdsvex } from '@docs-kit/mdsvex';
import { mdsvex } from 'mdsvex';

const docsPipeline = docsMdsvex();

/** @type {import('@sveltejs/kit').Config} */
export default {
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [
		vitePreprocess(),
		docsMarkdown(),
		mdsvex({
			extensions: ['.md', '.svx'],
			remarkPlugins: docsPipeline.remarkPlugins,
			rehypePlugins: docsPipeline.rehypePlugins,
			highlight: docsPipeline.highlight
		})
	],
	kit: {
		adapter: adapter({ fallback: '404.html' })
	}
};
`;

const tsconfig = `{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
}
`;

const gitignore = `node_modules
.svelte-kit
build
.docs-kit
`;

function slugSegments(basePath: string): string {
	return basePath.split('/').filter(Boolean).join('/');
}

/**
 * Renders a complete, ordinary SvelteKit application.
 *
 * Standalone mode is a generated host application, not a second framework: it wires the
 * same Vite plugin, mdsvex pipeline, and catch-all route an embedded project would write
 * by hand, so ejecting is simply keeping the generated files.
 */
export function createStandaloneTemplate(
	options: StandaloneTemplateOptions
): StandaloneFile[] {
	const dependencyVersion = options.dependencyVersion ?? 'workspace:*';
	const routeDirectory = slugSegments(options.basePath);
	const routeRoot = routeDirectory === '' ? 'src/routes' : `src/routes/${routeDirectory}`;
	// Workspace-linked framework packages expose TypeScript sources, which Node only loads
	// with type stripping. Published versions ship compiled output and need no flag.
	const nodeOptions = dependencyVersion.startsWith('workspace:')
		? 'NODE_OPTIONS=--experimental-strip-types '
		: '';
	const packageJson = {
		name: options.name,
		version: '0.0.0',
		private: true,
		type: 'module',
		scripts: {
			dev: `${nodeOptions}vite dev`,
			build: `${nodeOptions}vite build`,
			preview: `${nodeOptions}vite preview`
		},
		devDependencies: {
			'@docs-kit/components': dependencyVersion,
			'@docs-kit/core': dependencyVersion,
			'@docs-kit/sveltekit': dependencyVersion,
			'@docs-kit/mdsvex': dependencyVersion,
			'@docs-kit/theme-default': dependencyVersion,
			'@docs-kit/vite': dependencyVersion,
			'@sveltejs/adapter-static': '^3.0.0',
			'@sveltejs/kit': '^2.50.0',
			'@sveltejs/vite-plugin-svelte': '^7.2.0',
			mdsvex: '^0.12.6',
			svelte: '^5.49.1',
			typescript: '^6.0.0',
			vite: '^8.0.0'
		}
	};

	const viteConfig = `import { sveltekit } from '@sveltejs/kit/vite';
import { docs } from '@docs-kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		docs({ content: ${JSON.stringify(options.contentDirectory)}, basePath: ${JSON.stringify(options.basePath)} }),
		sveltekit()
	]
});
`;

	const docsConfig = `import { defineDocsConfig } from '@docs-kit/core';

export default defineDocsConfig({
	site: {
		title: ${JSON.stringify(options.siteTitle)}${
			options.siteDescription === undefined
				? ''
				: `,\n\t\tdescription: ${JSON.stringify(options.siteDescription)}`
		}
	},
	content: { directory: ${JSON.stringify(options.contentDirectory)} },
	routing: { basePath: ${JSON.stringify(options.basePath)} }
});
`;

	const files: StandaloneFile[] = [
		{ path: 'package.json', content: `${JSON.stringify(packageJson, null, '\t')}\n` },
		{ path: 'vite.config.ts', content: viteConfig },
		{ path: 'svelte.config.js', content: svelteConfig },
		{ path: 'tsconfig.json', content: tsconfig },
		{ path: 'docs.config.js', content: docsConfig },
		{ path: '.gitignore', content: gitignore },
		{ path: 'src/app.html', content: appHtml },
		{ path: 'src/app.d.ts', content: appTypes },
		{ path: 'src/routes/+layout.svelte', content: layout },
		{ path: 'src/routes/+layout.ts', content: layoutLoad },
		{
			path: `${routeRoot}/[...slug]/+page.ts`,
			content: pageLoadModule.replace(
					'__DOCS_SITE__',
					JSON.stringify({
						title: options.siteTitle,
						...(options.siteDescription === undefined
							? {}
							: { description: options.siteDescription })
					})
				)
		},
		{
			path: `${routeRoot}/[...slug]/+page.svelte`,
			content: pageComponent.replace('__DOCS_BASE_PATH__', JSON.stringify(options.basePath))
		}
	];

	if (routeDirectory !== '') {
		files.push({
			path: 'src/routes/+page.svelte',
			content: `<main>\n\t<h1>${options.siteTitle}</h1>\n\t<p><a href="${options.basePath}">Read the documentation</a></p>\n</main>\n`
		});
	}

	if (options.starterContent !== false) {
		files.push({
			path: `${options.contentDirectory}/index.md`,
			content: `---\ntitle: ${options.siteTitle}\ndescription: Start here.\n---\n\n# ${options.siteTitle}\n\nEdit \`${options.contentDirectory}/index.md\` to replace this page.\n`
		});
	}

	return files.sort((left, right) => left.path.localeCompare(right.path));
}
