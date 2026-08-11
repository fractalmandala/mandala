<script lang="ts">
	import { docs } from '$lib/docs/source';

	let { slug }: { slug: string } = $props();
	const document = $derived(docs.get(slug));
</script>

<svelte:head>
	<title>{document?.title ?? 'Example docs'} · Example docs</title>
	<meta name="description" content={document?.description ?? 'Generated Acrolls documentation'} />
</svelte:head>

{#if document}
	{#await document.loader() then Article}
		<Article />
	{:catch error}
		<p>Could not load this documentation page: {error instanceof Error ? error.message : String(error)}</p>
	{/await}
{:else}
	<p>Documentation page not found.</p>
{/if}
