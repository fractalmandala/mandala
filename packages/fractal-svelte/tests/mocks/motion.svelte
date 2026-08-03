<script lang="ts">
	let { children, ...rest }: Record<string, unknown> & { children?: import('svelte').Snippet } = $props();

	const ignored = new Set(['animate', 'initial', 'exit', 'transition', 'whileTap', 'whileHover', 'whileFocus', 'whileInView', 'layout', 'layoutId', 'variants', 'drag', 'custom']);
	const passthrough = $derived(
		Object.fromEntries(Object.entries(rest).filter(([key]) => !ignored.has(key)))
	);
</script>

<button {...passthrough}>
	{#if children}
		{@render children()}
	{/if}
</button>
