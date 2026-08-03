<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="box">{@render children?.()}</div>

<style>
	.box {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
	}
</style>
