<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type PopoverTitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: PopoverTitleProps = $props();
</script>

<div bind:this={ref} data-slot="popover-title" {...restProps}>
	{@render children?.()}
</div>
