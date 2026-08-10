<script lang="ts">
	import '$lib/styles/prism.css';

	let { data } = $props();

	const tints = ['lav', 'mint', 'sky', 'amber', 'rose'];
</script>

<svelte:head>
	<title>{data.title} · Posts</title>
	{#if data.description}<meta name="description" content={data.description} />{/if}
</svelte:head>

<header class="docs-pagehead">
	<span class="eyebrow">Posts // note</span>
	<h1 class="display docs-page-title">{data.title}</h1>
	{#if data.description}<p class="docs-page-sub col2">{data.description}</p>{/if}
	{#if data.tags && data.tags.length}
		<div class="row gap6 wrap">
			{#each data.tags as tag, i}
				<span class="chip chip--{tints[i % 5]}">{tag}</span>
			{/each}
		</div>
	{/if}
</header>

<data.content />
