<script lang="ts">
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLTableAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: WithElementRef<HTMLTableAttributes> = $props();
</script>

<!-- The container is what scrolls horizontally; the table itself must not shrink. -->
<div data-slot="table-container">
	<table bind:this={ref} data-slot="table" {...restProps}>
		{@render children?.()}
	</table>
</div>
