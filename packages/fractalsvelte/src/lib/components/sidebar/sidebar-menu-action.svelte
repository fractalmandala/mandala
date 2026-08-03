<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	export type SidebarMenuActionProps = WithElementRef<HTMLButtonAttributes> & {
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		showOnHover?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		showOnHover = false,
		children,
		child,
		...restProps
	}: SidebarMenuActionProps = $props();

	const mergedProps = $derived({
		"data-slot": "sidebar-menu-action",
		"data-show-on-hover": showOnHover || undefined,
		...restProps,
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<button bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</button>
{/if}
