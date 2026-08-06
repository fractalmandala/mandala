<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>{data.entry.title} | Skills | fractalagentic</title></svelte:head>

<article class="catalog-detail">
	<h1>{data.entry.title}</h1>
	{#if data.entry.description}<p class="description">{data.entry.description}</p>{/if}
	<div class="prose">{@html data.html}</div>
</article>
