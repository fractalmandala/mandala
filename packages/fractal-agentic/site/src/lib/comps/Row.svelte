<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="row">{@render children?.()}</div>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}
</style>
