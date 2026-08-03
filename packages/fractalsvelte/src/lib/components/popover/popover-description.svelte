<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type PopoverDescriptionProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: PopoverDescriptionProps = $props();
</script>

<div bind:this={ref} data-slot="popover-description" {...restProps}>
	{@render children?.()}
</div>
