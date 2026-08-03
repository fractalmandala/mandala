<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarHeaderProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarHeaderProps = $props();
</script>

<div bind:this={ref} data-slot="sidebar-header" {...restProps}>
	{@render children?.()}
</div>
