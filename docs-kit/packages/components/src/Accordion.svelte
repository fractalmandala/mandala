<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		open = false,
		children
	}: { title: string; open?: boolean; children: Snippet } = $props();
</script>

<details class="docs-accordion" {open}>
	<summary class="docs-accordion__summary">{title}</summary>
	<div class="docs-accordion__body">{@render children()}</div>
</details>
