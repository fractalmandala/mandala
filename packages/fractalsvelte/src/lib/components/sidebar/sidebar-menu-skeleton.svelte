<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarMenuSkeletonProps = WithElementRef<HTMLAttributes<HTMLElement>> & {
		showIcon?: boolean;
	};
</script>

<script lang="ts">
	import { Skeleton } from "../skeleton/index.js";

	let {
		ref = $bindable(null),
		showIcon = false,
		children,
		...restProps
	}: SidebarMenuSkeletonProps = $props();

	// Random width between 50% and 90%
	const width = `${Math.floor(Math.random() * 40) + 50}%`;
</script>

<div bind:this={ref} data-slot="sidebar-menu-skeleton" {...restProps}>
	{#if showIcon}
		<Skeleton size="1rem" radius="xl" />
	{/if}
	<Skeleton height="1rem" style="max-width: {width}; flex: 1;" />
	{@render children?.()}
</div>
