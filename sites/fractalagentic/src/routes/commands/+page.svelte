<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Commands | fractalagentic</title></svelte:head>

<section class="catalog">
	<h1>Commands</h1>
	<p>Operational commands from the Fractal Agentic armory.</p>
	<div class="entries">
		{#each data.entries as entry (entry.slug)}
			<a href={resolve('/commands/[slug]', { slug: entry.slug })}>
				<strong>{entry.title}</strong>
				{#if entry.description}<span>{entry.description}</span>{/if}
			</a>
		{/each}
	</div>
</section>
