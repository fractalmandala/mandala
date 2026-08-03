<script lang="ts">
	import Breadcrumbs from '$site/Breadcrumbs.svelte';
	import ComponentCard from '$site/ComponentCard.svelte';
	let { data } = $props();
	const ready = $derived(data.entries);
</script>

<svelte:head
	><title>{data.category.name} components — Fractal Svelte</title><meta
		name="description"
		content={data.category.description}
	/><link rel="canonical" href="/components/{data.category.slug}" /><meta
		property="og:title"
		content="{data.category.name} components — Fractal Svelte"
	/><meta property="og:description" content={data.category.description} /><meta
		property="og:type"
		content="website"
	/><meta property="og:url" content="/components/{data.category.slug}" /><meta
		name="twitter:card"
		content="summary"
	/></svelte:head
>
<div class="page-shell">
	<header class="page-header">
		<Breadcrumbs items={[{ label: 'Components', href: '/' }, { label: data.category.name }]} />
		<h1>{data.category.name}</h1>
		<p>{data.category.description}</p>
	</header>
	<section>
		<div class="section-heading">
			<h2>
				Available now <span class="status" data-status="ready">{ready.length} ready</span>
			</h2>
		</div>
		<div class="component-grid">
			{#each ready as entry}<ComponentCard {entry} />{/each}
		</div>
	</section>
</div>
