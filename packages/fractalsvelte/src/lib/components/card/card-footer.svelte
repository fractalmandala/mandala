<script lang="ts">
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		bordered = false,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Adds a divider above the footer, with the matching top padding. */
		bordered?: boolean;
	} = $props();
</script>

<div bind:this={ref} data-slot="card-footer" data-bordered={bordered || undefined} {...restProps}>
	{@render children?.()}
</div>
