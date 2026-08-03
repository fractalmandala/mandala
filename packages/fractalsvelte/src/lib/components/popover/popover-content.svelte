<script lang="ts" module>
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import type { ComponentProps } from 'svelte';
	import PopoverPortal from './popover-portal.svelte';

	export type PopoverContentProps = PopoverPrimitive.ContentProps & {
		/** CSS width for the floating panel. Omit to use the skin's 18rem default. */
		width?: string;
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof PopoverPortal>>;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		sideOffset = 4,
		align = 'center',
		width,
		portalProps,
		style,
		...restProps
	}: PopoverContentProps = $props();

	const contentStyle = $derived(
		width ? `${style ? `${style}; ` : ''}--popover-content-width: ${width}` : style
	);
</script>

<PopoverPortal {...portalProps}>
	<PopoverPrimitive.Content
		bind:ref
		data-slot="popover-content"
		style={contentStyle}
		{sideOffset}
		{align}
		{...restProps}
	/>
</PopoverPortal>
