<script lang="ts">
	import CatalogGrid from '$lib/components/CatalogGrid.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Docs · Fractal Agentic</title>
</svelte:head>

<div class="reference-page reference-page--catalog reference-page--docs">
	<header class="page-head">
		<p class="page-head__kicker">Reference / Reading order</p>
		<h1 class="page-head__title">Docs</h1>
		<p class="page-head__desc">
			Human browser for docs that live in the <strong>plugin</strong> package (agents load the same
			files offline). Reading order: getting started, bosses, orchestration, armory, wiki,
			reference. Start at <a href="/docs/guide">Documentation hub</a> · identity:
			<a href="/docs/soul">SOUL</a> · <a href="/docs/agents">AGENTS</a>.
		</p>
		<p class="page-head__meta">{data.items.length} documents · sequenced</p>
	</header>
	<CatalogGrid items={data.items} />
</div>
