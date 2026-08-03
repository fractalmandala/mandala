<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarMenuBadgeProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarMenuBadgeProps = $props();
</script>

<div bind:this={ref} data-slot="sidebar-menu-badge" {...restProps}>
	{@render children?.()}
</div>
