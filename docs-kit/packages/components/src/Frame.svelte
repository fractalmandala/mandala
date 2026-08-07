<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		caption,
		padded = true,
		children
	}: {
		/** Caption rendered below the frame, and used as the figure's accessible name. */
		caption?: string;
		padded?: boolean;
		children: Snippet;
	} = $props();
</script>

<figure class="docs-frame" class:docs-frame--padded={padded}>
	<div class="docs-frame__body">{@render children()}</div>
	{#if caption}
		<figcaption class="docs-frame__caption">{caption}</figcaption>
	{/if}
</figure>
