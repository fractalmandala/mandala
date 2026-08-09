<script lang="ts">
	import type { PageData } from './$types';
	import AssetCard from '$lib/components/AssetCard.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Bosses | fractalagentic</title></svelte:head>

<section class="catalog-page box gap24 padtop16 padbot64">
	<header class="box gap12">
		<p class="eyebrow">One-boss discovery</p>
		<h1 class="display-md">Domain bosses</h1>
		<p class="lede">
			Executive routing playbooks — the startup router selects exactly one per task, and each boss
			carries its own vendored playbook.
		</p>
	</header>
	<div class="index-grid">
		{#each data.entries as entry, i (entry.slug)}
			<AssetCard
				href={entry.href}
				title={entry.title}
				description={entry.description}
				num={String(i + 1).padStart(2, '0')}
			/>
		{/each}
	</div>
</section>
