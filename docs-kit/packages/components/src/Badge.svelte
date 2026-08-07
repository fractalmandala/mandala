<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tone = 'neutral',
		children
	}: { tone?: 'neutral' | 'accent' | 'warning' | 'danger'; children: Snippet } = $props();
</script>

<span class="docs-badge docs-badge--{tone}">{@render children()}</span>
