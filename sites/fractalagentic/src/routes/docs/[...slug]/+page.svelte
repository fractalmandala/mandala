<script lang="ts">
	import type { PageData } from './$types';
	import AgenticDocumentTemplate from '$lib/templates/AgenticDocumentTemplate.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.entry.title} | fractalagentic</title>
	{#if data.entry.description}<meta name="description" content={data.entry.description} />{/if}
</svelte:head>

<AgenticDocumentTemplate entry={data.entry} html={data.html} />
