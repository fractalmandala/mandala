<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<footer class="docs-footer">
	{#if children}
		{@render children()}
	{:else}
		<p>Built with docs-kit.</p>
	{/if}
</footer>
