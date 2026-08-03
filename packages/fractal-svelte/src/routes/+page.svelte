<script lang="ts">
	import {
		categories,
		getSupportedCatalog,
		getSupportedCatalogByCategory
	} from '$lib/catalog/index.js';
	import ComponentCard from '$site/ComponentCard.svelte';
	import InstallCommand from '$site/InstallCommand.svelte';
	const ready = getSupportedCatalog();
	const recent = ready.slice(-6).reverse();
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareSourceCode',
		name: 'Fractal Svelte',
		programmingLanguage: 'Svelte',
		description: 'Svelte 5 components for motion, agent interfaces, and product workflows.'
	};
</script>

<svelte:head>
	<title>Fractal Svelte — components for expressive Svelte interfaces</title>
	<meta
		name="description"
		content="29 production-ready Svelte 5 motion primitives, agent components, and product blocks."
	/>
	<link rel="canonical" href="/" />
	<meta property="og:title" content="Fractal Svelte" /><meta
		property="og:description"
		content="Components for expressive Svelte interfaces."
	/><meta property="og:type" content="website" /><meta property="og:url" content="/" />
	<meta name="twitter:card" content="summary" /><meta
		name="twitter:title"
		content="Fractal Svelte"
	/><meta name="twitter:description" content="Components for expressive Svelte interfaces." />
	<script type="application/ld+json">
{JSON.stringify(jsonLd)}
	</script>
</svelte:head>

<section class="hero">
	<div class="hero__inner">
		<span class="eyebrow">Svelte 5 component library</span>
		<h1>Build interfaces that feel considered.</h1>
		<p>
			Motion primitives, agent components, and product blocks designed for expressive
			interaction, accessible behavior, and practical composition.
		</p>
		<InstallCommand />
	</div>
</section>
<section class="home-section">
	<div class="section-heading">
		<div>
			<span class="eyebrow">Supported catalog</span>
			<h2>{ready.length} components ready to use</h2>
			<p>
				Every component shown here has a live preview, package export, registry entry, and
				documentation page.
			</p>
		</div>
	</div>
	<div class="component-grid">
		{#each recent as entry}<ComponentCard {entry} />{/each}
	</div>
</section>
{#each categories as category}
	<section class="home-section">
		<div class="section-heading">
			<div>
				<span class="eyebrow"
					>{getSupportedCatalogByCategory(category.slug).length} components</span
				>
				<h2>{category.name}</h2>
				<p>{category.description}</p>
			</div>
			<a href="/components/{category.slug}">Browse {category.name} →</a>
		</div>
		<div class="component-grid">
			{#each getSupportedCatalogByCategory(category.slug) as entry}<ComponentCard
					{entry}
				/>{/each}
		</div>
	</section>
{/each}
