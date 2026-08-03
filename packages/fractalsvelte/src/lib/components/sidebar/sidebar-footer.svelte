<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarFooterProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarFooterProps = $props();
</script>

<div bind:this={ref} data-slot="sidebar-footer" {...restProps}>
	{@render children?.()}
</div>
