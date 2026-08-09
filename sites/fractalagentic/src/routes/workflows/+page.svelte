<script lang="ts">
	import type { PageData } from './$types';
	import AssetCard from '$lib/components/AssetCard.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Workflows | fractalagentic</title></svelte:head>

<div class="site-container box gap32 padtop32 padbot64">
	<header class="box gap12">
		<p class="eyebrow">Playbooks</p>
		<h1 class="display-md">Workflows</h1>
		<p class="lede">
			Multi-step delivery playbooks shipped with the plugin — sequenced steps a boss or an operator
			can run end to end.
		</p>
	</header>
	<div class="index-grid">
		{#each data.workflows as workflow, i (workflow.slug)}
			<AssetCard
				href={workflow.href}
				title={workflow.title}
				description={workflow.description}
				num={String(i + 1).padStart(2, '0')}
			/>
		{/each}
	</div>
</div>
