<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ItemActionsProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: ItemActionsProps = $props();
</script>

<div bind:this={ref} data-slot="item-actions" {...restProps}>
	{@render children?.()}
</div>
