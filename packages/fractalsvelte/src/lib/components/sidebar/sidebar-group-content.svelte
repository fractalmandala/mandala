<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarGroupContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarGroupContentProps = $props();
</script>

<div bind:this={ref} data-slot="sidebar-group-content" {...restProps}>
	{@render children?.()}
</div>
