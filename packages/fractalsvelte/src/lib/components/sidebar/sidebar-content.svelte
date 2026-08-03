<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarContentProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarContentProps = $props();
</script>

<div bind:this={ref} data-slot="sidebar-content" {...restProps}>
	{@render children?.()}
</div>
