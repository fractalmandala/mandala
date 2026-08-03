<script lang="ts">
	import CatalogFilter from '$lib/components/CatalogFilter.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Agents · Fractal Agentic</title>
</svelte:head>

<div class="reference-page reference-page--catalog reference-page--agents">
	<header class="page-head">
		<p class="page-head__kicker">Armory / Specialist roles</p>
		<h1 class="page-head__title">Agents</h1>
		<p class="page-head__desc">
			Specialist agent prompts mapped to bosses — reviewers, architects, loop operators, and more.
			Detail pages navigate <strong>alphabetically</strong> with Previous / Next.
		</p>
		<p class="page-head__meta">{data.items.length} agents · A–Z</p>
	</header>

	<CatalogFilter items={data.items} placeholder="Filter agents…" />
</div>
