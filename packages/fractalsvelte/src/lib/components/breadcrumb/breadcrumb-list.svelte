<script lang="ts">
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLOlAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: WithElementRef<HTMLOlAttributes> = $props();
</script>

<ol bind:this={ref} data-slot="breadcrumb-list" {...restProps}>
	{@render children?.()}
</ol>
