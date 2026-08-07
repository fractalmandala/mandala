<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title?: string; children: Snippet } = $props();
</script>

<section class="docs-step">
	{#if title}
		<h3 class="docs-step__title">{title}</h3>
	{/if}
	<div class="docs-step__body">{@render children()}</div>
</section>
