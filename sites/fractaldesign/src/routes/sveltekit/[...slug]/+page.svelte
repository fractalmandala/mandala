<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title} · SvelteKit Docs</title>
	{#if data.description}<meta name="description" content={data.description} />{/if}
</svelte:head>

{#if data.title}
	<h1>{data.title}</h1>
{/if}

{#if data.renderError}
	<div class="docs-render-error">
		<p><strong>This page couldn’t be rendered.</strong></p>
		<p class="col2">It relies on a demo component or package that isn’t part of this app:</p>
		<pre>{data.renderError}</pre>
	</div>
{:else if data.content}
	<data.content />
{/if}
