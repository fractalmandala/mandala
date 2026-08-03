<script lang="ts">
	import type { Component } from "svelte";
	import type { DocEntry } from "./load.js";

	let { data }: { data: { entry: DocEntry; content: unknown } } = $props();
	const Content = $derived(data.content as Component | null);
</script>

<svelte:head>
	<title>{data.entry.name} — fractalsvelte</title>
</svelte:head>

<article class="doc-article" data-slug={data.entry.slug}>
	{#if Content}
		<Content />
	{:else}
		<h1 class="doc-title">{data.entry.name}</h1>
		<p class="doc-lede">Not ported yet.</p>
		<div class="doc-note box">
			<p>
				<strong>{data.entry.name}</strong> is scheduled for wave {data.entry.wave}.
				{#if data.entry.deps?.length}
					It composes {data.entry.deps.join(", ")}, which must be ported first.
				{/if}
				{#if data.entry.external}
					It relies on <code>{data.entry.external}</code> for headless behaviour.
				{/if}
			</p>
		</div>
	{/if}
</article>
