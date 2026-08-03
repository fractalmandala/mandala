<script lang="ts" module>
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import type { ComponentProps } from 'svelte';
	import DropdownMenuPortal from './dropdown-menu-portal.svelte';

	export type DropdownMenuContentProps = DropdownMenuPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DropdownMenuPortal>>;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		sideOffset = 4,
		align = 'start',
		portalProps,
		...restProps
	}: DropdownMenuContentProps = $props();
</script>

<DropdownMenuPortal {...portalProps}>
	<DropdownMenuPrimitive.Content
		bind:ref
		data-slot="dropdown-menu-content"
		{sideOffset}
		{align}
		{...restProps}
	/>
</DropdownMenuPortal>
