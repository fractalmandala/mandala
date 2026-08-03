<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarMenuSubProps = WithElementRef<HTMLAttributes<HTMLUListElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarMenuSubProps = $props();
</script>

<ul bind:this={ref} data-slot="sidebar-menu-sub" {...restProps}>
	{@render children?.()}
</ul>
