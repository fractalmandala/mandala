<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	export type SidebarMenuSubButtonSize = "sm" | "md";

	export type SidebarMenuSubButtonProps = WithElementRef<HTMLAnchorAttributes> & {
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		size?: SidebarMenuSubButtonSize;
		isActive?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		child,
		size = "md",
		isActive = false,
		...restProps
	}: SidebarMenuSubButtonProps = $props();

	const mergedProps = $derived({
		"data-slot": "sidebar-menu-sub-button",
		"data-size": size,
		"data-active": isActive || undefined,
		...restProps,
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<a bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</a>
{/if}
