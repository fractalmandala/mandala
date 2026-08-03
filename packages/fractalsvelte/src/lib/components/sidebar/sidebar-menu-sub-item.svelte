<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarMenuSubItemProps = WithElementRef<HTMLAttributes<HTMLLIElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarMenuSubItemProps = $props();
</script>

<li bind:this={ref} data-slot="sidebar-menu-sub-item" {...restProps}>
	{@render children?.()}
</li>
