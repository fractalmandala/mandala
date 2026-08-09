<script lang="ts">
	import type { PageData } from './$types';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import AssetCard from '$lib/components/AssetCard.svelte';

	let { data }: { data: PageData } = $props();

	let query = $state('');

	const filtered = $derived(
		data.entries.filter((entry) => {
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return (
				entry.title.toLowerCase().includes(q) ||
				entry.slug.toLowerCase().includes(q) ||
				entry.description.toLowerCase().includes(q)
			);
		})
	);
</script>

<svelte:head><title>Commands | fractalagentic</title></svelte:head>

<section class="catalog-page box gap24 padtop16 padbot64">
	<header class="box gap12">
		<p class="eyebrow">Armory / Commands</p>
		<h1 class="display-md">Commands</h1>
		<p class="lede">Operational verbs for orchestration, verification, review, and shipping.</p>
	</header>
	<FilterBar bind:query />
	<p class="count-note">{filtered.length} of {data.entries.length}</p>
	<div class="index-grid">
		{#each filtered as entry (entry.slug)}
			<AssetCard href={entry.href} title={entry.title} description={entry.description} />
		{/each}
	</div>
</section>
