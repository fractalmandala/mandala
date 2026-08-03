<script lang="ts">
	import CatalogFilter from '$lib/components/CatalogFilter.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Commands · Fractal Agentic</title>
</svelte:head>

<div class="reference-page reference-page--catalog reference-page--commands">
	<header class="page-head">
		<p class="page-head__kicker">Armory / Repeatable playbooks</p>
		<h1 class="page-head__title">Commands</h1>
		<p class="page-head__desc">
			Slash commands for boss activation, review loops, quality gates, and the delivery runtime
			<code>/orchestrate</code>. Detail pages navigate <strong>alphabetically</strong> with Previous /
			Next.
		</p>
		<p class="page-head__meta">{data.items.length} commands · A–Z</p>
	</header>

	<CatalogFilter items={data.items} placeholder="Filter commands…" />
</div>
