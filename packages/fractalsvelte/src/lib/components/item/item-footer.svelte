<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ItemFooterProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: ItemFooterProps = $props();
</script>

<div bind:this={ref} data-slot="item-footer" {...restProps}>
	{@render children?.()}
</div>
