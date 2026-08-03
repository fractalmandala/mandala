<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SidebarSide = "left" | "right";
	export type SidebarVariant = "sidebar" | "floating" | "inset";
	export type SidebarCollapsible = "offcanvas" | "icon" | "none";

	export type SidebarProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		side?: SidebarSide;
		variant?: SidebarVariant;
		collapsible?: SidebarCollapsible;
	};
</script>

<script lang="ts">
	import * as Sheet from "../sheet/index.js";
	import { SIDEBAR_WIDTH_MOBILE } from "./constants.js";
	import { useSidebar } from "./context.svelte.js";

	let {
		ref = $bindable(null),
		side = "left",
		variant = "sidebar",
		collapsible = "offcanvas",
		children,
		...restProps
	}: SidebarProps = $props();

	const sidebar = useSidebar();
</script>

{#if collapsible === "none"}
	<div bind:this={ref} data-slot="sidebar" data-collapsible="none" {...restProps}>
		{@render children?.()}
	</div>
{:else if sidebar.isMobile}
	<Sheet.Root
		bind:open={() => sidebar.openMobile, (v) => sidebar.setOpenMobile(v)}
		{...restProps}
	>
		<Sheet.Content
			bind:ref
			data-slot="sidebar"
			data-mobile="true"
			showCloseButton={false}
			{side}
			style="--sidebar-width: {SIDEBAR_WIDTH_MOBILE};"
		>
			<div data-slot="sidebar-mobile-header">
				<Sheet.Title>Sidebar</Sheet.Title>
				<Sheet.Description>Displays the mobile sidebar.</Sheet.Description>
			</div>
			<div data-slot="sidebar-mobile-inner">
				{@render children?.()}
			</div>
		</Sheet.Content>
	</Sheet.Root>
{:else}
	<div
		bind:this={ref}
		data-slot="sidebar"
		data-state={sidebar.state}
		data-collapsible={sidebar.state === "collapsed" ? collapsible : ""}
		data-variant={variant}
		data-side={side}
	>
		<!-- This is what handles the sidebar gap on desktop -->
		<div data-slot="sidebar-gap"></div>
		<div data-slot="sidebar-container" {...restProps}>
			<div data-slot="sidebar-inner">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
