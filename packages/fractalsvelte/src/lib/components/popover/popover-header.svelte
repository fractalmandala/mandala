<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type PopoverHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: PopoverHeaderProps = $props();
</script>

<div bind:this={ref} data-slot="popover-header" {...restProps}>
	{@render children?.()}
</div>
