<script lang="ts">
	import { Publication } from '@acrolls/svelte';
	import { docs } from '$lib/docs/source';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const document = $derived(docs.get(data.slug));
	const title = $derived(document?.title ?? 'Documentation');
	const description = $derived(document?.description);
</script>

<svelte:head>
	<title>{title} | Fractal Mandala</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

{#if document}
	{#await document.loader() then Article}
		<article class="docs-article">
			<Publication>
				<Article />
			</Publication>
		</article>
	{:catch}
		<p>Unable to load this document.</p>
	{/await}
{:else}
	<p>Documentation page not found.</p>
{/if}

<style>
	.docs-article {
		min-width: 0;
	}
</style>
