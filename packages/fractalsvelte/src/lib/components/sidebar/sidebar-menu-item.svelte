<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarMenuItemProps = WithElementRef<HTMLAttributes<HTMLLIElement>, HTMLLIElement>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarMenuItemProps = $props();
</script>

<li bind:this={ref} data-slot="sidebar-menu-item" {...restProps}>
	{@render children?.()}
</li>
