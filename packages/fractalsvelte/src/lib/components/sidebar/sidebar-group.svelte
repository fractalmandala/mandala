<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarGroupProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarGroupProps = $props();
</script>

<div bind:this={ref} data-slot="sidebar-group" {...restProps}>
	{@render children?.()}
</div>
