<script lang="ts">
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		bordered = false,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Adds a divider below the header, with the matching bottom padding. */
		bordered?: boolean;
	} = $props();
</script>

<div bind:this={ref} data-slot="card-header" data-bordered={bordered || undefined} {...restProps}>
	{@render children?.()}
</div>
