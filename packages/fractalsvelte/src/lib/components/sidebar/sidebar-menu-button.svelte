<script lang="ts" module>
	import type { WithElementRef, WithoutChildrenOrChild } from "$lib/utils.js";
	import type { ComponentProps, Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import * as Tooltip from "../tooltip/index.js";

	export type SidebarMenuButtonVariant = "default" | "outline";
	export type SidebarMenuButtonSize = "default" | "sm" | "lg";

	export type SidebarMenuButtonProps = WithElementRef<
		HTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> & {
		isActive?: boolean;
		variant?: SidebarMenuButtonVariant;
		size?: SidebarMenuButtonSize;
		tooltipContent?: Snippet | string;
		tooltipContentProps?: WithoutChildrenOrChild<ComponentProps<typeof Tooltip.Content>>;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	};
</script>

<script lang="ts">
	import { mergeProps } from "bits-ui";
	import { useSidebar } from "./context.svelte.js";

	let {
		ref = $bindable(null),
		children,
		child,
		variant = "default",
		size = "default",
		isActive = false,
		tooltipContent,
		tooltipContentProps,
		...restProps
	}: SidebarMenuButtonProps = $props();

	const sidebar = useSidebar();

	const buttonProps = $derived({
		"data-slot": "sidebar-menu-button",
		"data-variant": variant,
		"data-size": size,
		"data-active": isActive || undefined,
		...restProps,
	});
</script>

{#snippet Button({ props }: { props?: Record<string, unknown> })}
	<!-- props (from Tooltip.Trigger's child) first so buttonProps' data-slot/-variant win;
	     mergeProps still chains every event handler from both. -->
	{@const mergedProps = mergeProps(props ?? {}, buttonProps)}
	{#if child}
		{@render child({ props: mergedProps })}
	{:else}
		<button bind:this={ref} {...mergedProps}>
			{@render children?.()}
		</button>
	{/if}
{/snippet}

{#if !tooltipContent}
	{@render Button({})}
{:else}
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				{@render Button({ props })}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content
			side="right"
			align="center"
			hidden={sidebar.state !== "collapsed" || sidebar.isMobile}
			{...tooltipContentProps}
		>
			{#if typeof tooltipContent === "string"}
				{tooltipContent}
			{:else if tooltipContent}
				{@render tooltipContent()}
			{/if}
		</Tooltip.Content>
	</Tooltip.Root>
{/if}
