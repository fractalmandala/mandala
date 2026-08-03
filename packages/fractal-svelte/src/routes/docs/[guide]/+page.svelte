<script lang="ts">
	import Breadcrumbs from '$site/Breadcrumbs.svelte';
	import InstallCommand from '$site/InstallCommand.svelte';
	import TableOfContents from '$site/TableOfContents.svelte';
	let { data } = $props();
	const sections = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'practice', label: 'In practice' },
		{ id: 'next', label: 'Next steps' }
	];
</script>

<svelte:head
	><title>{data.guide.name} — Fractal Svelte guides</title><meta
		name="description"
		content={data.guide.description}
	/><link rel="canonical" href="/docs/{data.guide.slug}" /><meta
		property="og:title"
		content="{data.guide.name} — Fractal Svelte"
	/><meta property="og:description" content={data.guide.description} /><meta
		property="og:type"
		content="article"
	/><meta name="twitter:card" content="summary" /></svelte:head
>
<div class="page-shell">
	<header class="page-header">
		<Breadcrumbs
			items={[{ label: 'Guides', href: '/docs/getting-started' }, { label: data.guide.name }]}
		/>
		<h1>{data.guide.name}</h1>
		<p>{data.guide.description}</p>
	</header>
	<div class="docs-layout">
		<article class="docs-content">
			<section id="overview">
				<h2>Overview</h2>
				{#if data.guide.slug === 'getting-started'}<p>
						Install the package, import a component from its dedicated export, and
						include the shared styles once in your application.
					</p>
					<InstallCommand />{:else if data.guide.slug === 'theming'}<p>
						Fractal Svelte uses semantic CSS custom properties. Set component-facing
						tokens such as <code>--background</code>, <code>--foreground</code>,
						<code>--border</code>, and <code>--ring</code> at your application boundary.
					</p>{:else}<p>
						Components favor semantic HTML, visible focus, keyboard operation,
						reduced-motion behavior, and labels that remain meaningful without visual
						context.
					</p>{/if}
			</section>
			<section id="practice">
				<h2>In practice</h2>
				{#if data.guide.slug === 'getting-started'}<pre><code
							>import '@fractaldesign/fractal-svelte/styles';
import {'{ Button }'} from '@fractaldesign/fractal-svelte/button';</code
						></pre>{:else if data.guide.slug === 'theming'}<p>
						Start with the provided tokens, override only semantic values, and test
						light and dark surfaces together. The documentation shell stores light,
						dark, or system preference under <code>fractal-svelte-theme</code>.
					</p>{:else}<p>
						Keep labels close to controls, preserve focus order, announce asynchronous
						feedback, and avoid motion as the only way to communicate state.
					</p>{/if}
			</section>
			<section id="next">
				<h2>Next steps</h2>
				<p>
					Browse the component catalog to find package exports, examples, source
					manifests, API notes, and composition guidance.
				</p>
				<a href="/components/motion">Explore components →</a>
			</section>
		</article>
		<TableOfContents items={sections} />
	</div>
</div>
