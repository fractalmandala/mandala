<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ChainOfThoughtSearchResultsProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ChainOfThoughtSearchResultsProps = $props();
</script>

<div bind:this={ref} data-slot="chain-of-thought-search-results" {...restProps}>
	{@render children?.()}
</div>
