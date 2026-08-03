<script lang="ts" module>
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import { Menubar as MenubarPrimitive } from 'bits-ui';
	import type { ComponentProps } from 'svelte';
	import MenubarPortal from './menubar-portal.svelte';

	export type MenubarContentProps = MenubarPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof MenubarPortal>>;
		width?: string;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		sideOffset = 8,
		alignOffset = -4,
		align = 'start',
		side = 'bottom',
		portalProps,
		width,
		style,
		...restProps
	}: MenubarContentProps = $props();

	const widthStyle = $derived(width ? `width: ${width}` : undefined);
	const mergedStyle = $derived([widthStyle, style].filter(Boolean).join('; ') || undefined);
</script>

<MenubarPortal {...portalProps}>
	<MenubarPrimitive.Content
		bind:ref
		data-slot="menubar-content"
		{align}
		{alignOffset}
		{side}
		{sideOffset}
		style={mergedStyle}
		{...restProps}
	/>
</MenubarPortal>
