<script lang="ts">
	import CatalogFilter from '$lib/components/CatalogFilter.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Skills · Fractal Agentic</title>
</svelte:head>

<div class="reference-page reference-page--catalog reference-page--skills">
	<header class="page-head">
		<p class="page-head__kicker">Armory / Operating instructions</p>
		<h1 class="page-head__title">Skills</h1>
		<p class="page-head__desc">
			Vendored skill library — each entry is a full <code>SKILL.md</code> the orchestrator and
			bosses can invoke. Detail pages navigate <strong>alphabetically</strong> with Previous / Next.
		</p>
		<p class="page-head__meta">{data.items.length} skills · A–Z</p>
	</header>

	<CatalogFilter items={data.items} placeholder="Filter skills…" />
</div>
