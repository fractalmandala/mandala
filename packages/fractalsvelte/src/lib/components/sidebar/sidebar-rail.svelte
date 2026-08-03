<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarRailProps = WithElementRef<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
</script>

<script lang="ts">
	import { useSidebar } from "./context.svelte.js";

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarRailProps = $props();

	const sidebar = useSidebar();
</script>

<button
	bind:this={ref}
	data-slot="sidebar-rail"
	aria-label="Toggle Sidebar"
	tabindex={-1}
	onclick={sidebar.toggle}
	title="Toggle Sidebar"
	{...restProps}
>
	{@render children?.()}
</button>
