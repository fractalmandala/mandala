<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";
	import DrawerPortal from "./drawer-portal.svelte";
	import DrawerOverlay from "./drawer-overlay.svelte";

	let {
		ref = $bindable(null),
		portalProps,
		children,
		...restProps
	}: DrawerPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DrawerPortal>>;
	} = $props();
</script>

<DrawerPortal {...portalProps}>
	<DrawerOverlay />
	<DrawerPrimitive.Content bind:ref data-slot="drawer-content" {...restProps}>
		<div data-slot="drawer-handle"></div>
		{@render children?.()}
	</DrawerPrimitive.Content>
</DrawerPortal>
