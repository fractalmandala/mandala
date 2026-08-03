<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarMenuProps = WithElementRef<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarMenuProps = $props();
</script>

<ul bind:this={ref} data-slot="sidebar-menu" {...restProps}>
	{@render children?.()}
</ul>
