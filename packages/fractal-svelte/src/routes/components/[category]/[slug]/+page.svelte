<script lang="ts">
	import Breadcrumbs from '$site/Breadcrumbs.svelte';
	import CodeBlock from '$site/CodeBlock.svelte';
	import ComponentCard from '$site/ComponentCard.svelte';
	import ExamplesTabs from '$site/ExamplesTabs.svelte';
	import ExplicitPreview from '$site/ExplicitPreview.svelte';
	import InstallCommand from '$site/InstallCommand.svelte';
	import PreviewFrame from '$site/PreviewFrame.svelte';
	import PropsTable from '$site/PropsTable.svelte';
	import TableOfContents from '$site/TableOfContents.svelte';
	import { categoryFor, componentPath } from '$site/content.js';
	import { api } from '$site/api.js';
	import { previewSlugs } from '$site/preview-registry.js';
	import { exampleSources } from '$examples/index.js';
	let { data } = $props();
	const entry = $derived(data.entry);
	const category = $derived(categoryFor(entry.category));
	const supported = $derived(previewSlugs.includes(entry.slug as (typeof previewSlugs)[number]));
	const code = $derived(exampleSources[entry.slug as keyof typeof exampleSources] ?? '');
	const sections = $derived([
		{ id: 'installation', label: 'Installation' },
		{ id: 'usage', label: 'Usage' },
		...(supported ? [{ id: 'examples', label: 'Examples' }] : []),
		{ id: 'source', label: 'Source' },
		{ id: 'api', label: 'API' },
		{ id: 'theming', label: 'Theming' },
		{ id: 'composition', label: entry.status === 'ready' ? 'Composition' : 'How it works' },
		{ id: 'related', label: 'Related' }
	]);
	const install = $derived(
		entry.exportPath
			? `pnpm add @fractaldesign/fractal-svelte`
			: 'pnpm add @fractaldesign/fractal-svelte'
	);
	const sourceManifest = $derived(
		entry.files.length
			? entry.files.join('\n')
			: 'Implementation files will be listed when the port is ready.'
	);
	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'TechArticle',
		headline: entry.name,
		description: entry.description,
		articleSection: category.name
	});
</script>

<svelte:head>
	<title>{entry.name} — {category.name} — Fractal Svelte</title><meta
		name="description"
		content={entry.description}
	/><link rel="canonical" href={componentPath(entry)} />
	<meta property="og:title" content="{entry.name} — Fractal Svelte" /><meta
		property="og:description"
		content={entry.description}
	/><meta property="og:type" content="article" /><meta
		property="og:url"
		content={componentPath(entry)}
	/>
	<meta name="twitter:card" content="summary" /><meta
		name="twitter:title"
		content="{entry.name} — Fractal Svelte"
	/><meta name="twitter:description" content={entry.description} />
	<script type="application/ld+json">
{JSON.stringify(jsonLd)}
	</script>
</svelte:head>

<div class="page-shell">
	<header class="page-header">
		<Breadcrumbs
			items={[
				{ label: 'Components', href: '/' },
				{ label: category.name, href: `/components/${entry.category}` },
				{ label: entry.name }
			]}
		/>
		<div><span class="status" data-status={entry.status}>{entry.status}</span></div>
		<h1>{entry.name}</h1>
		<p>{entry.description}</p>
	</header>
	<div class="docs-layout">
		<article class="docs-content">
			<PreviewFrame><ExplicitPreview slug={entry.slug} /></PreviewFrame>
			<section id="installation">
				<h2>Installation</h2>
				<p>Add the package with your preferred package manager.</p>
				<InstallCommand command={install} />{#if entry.exportPath}<p>
						Import from <code
							>@fractaldesign/fractal-svelte/{entry.exportPath.replace(
								'./',
								''
							)}</code
						>.
					</p>{/if}
			</section>
			<section id="usage">
				<h2>Usage</h2>
				<CodeBlock {code} label="Basic usage" />
			</section>
			<section id="examples">
				<h2>Examples</h2>
				<p>
					Switch between the interactive, keyboard-accessible preview and its complete
					source.
				</p>
				<ExamplesTabs slug={entry.slug} {code} />
			</section>
			<section id="source">
				<h2>Source</h2>
				<p>These implementation files are included in the package and registry entry.</p>
				<CodeBlock code={sourceManifest} label="Source manifest" />
			</section>
			<section id="api">
				<h2>API</h2>
				{#if api[entry.slug]}<PropsTable props={api[entry.slug]} />{:else}<p>
						Use the exported TypeScript definitions for the complete API. The component
						accepts the public props represented by its typed Svelte contract.
					</p>{/if}
			</section>
			<section id="theming">
				<h2>Theming</h2>
				<p>
					Style this component through the library’s semantic tokens. Keep foreground,
					surface, border, and focus values aligned with your application theme, and
					preserve reduced-motion behavior.
				</p>
			</section>
			<section id="composition">
				<h2>{entry.status === 'ready' ? 'Composition' : 'How it works'}</h2>
				<p>
					{entry.status === 'ready'
						? `${entry.name} is designed to compose with other ${category.name.toLowerCase()} components. Keep application state outside the visual primitive when practical and use the typed callbacks for integration.`
						: `${entry.name} is planned as ${entry.description.charAt(0).toLowerCase()}${entry.description.slice(1)} Implementation and API details will be added only after the port is validated.`}
				</p>
			</section>
			<section id="related">
				<h2>Related</h2>
				<div class="component-grid">
					{#each data.related as related}<ComponentCard entry={related} />{/each}
				</div>
			</section>
			<nav class="pager" aria-label="Component pagination">
				{#if data.previous}<a href={componentPath(data.previous)}
						><span>Previous</span><strong>← {data.previous.name}</strong></a
					>{:else}<span></span>{/if}{#if data.next}<a href={componentPath(data.next)}
						><span>Next</span><strong>{data.next.name} →</strong></a
					>{/if}
			</nav>
		</article>
		<TableOfContents items={sections} />
	</div>
</div>
