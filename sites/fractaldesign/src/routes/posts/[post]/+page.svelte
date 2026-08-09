<script lang="ts">
	import '$lib/styles/prism.css';
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title} · Posts</title>
	{#if data.description}<meta name="description" content={data.description} />{/if}
</svelte:head>

<h1>{data.title}</h1>
{#if data.description}<p class="col2">{data.description}</p>{/if}
{#if data.tags && data.tags.length}
	<div class="row gap8 wrap">
		{#each data.tags as tag}
			<span class="pill">{tag}</span>
		{/each}
	</div>
{/if}

<data.content />
