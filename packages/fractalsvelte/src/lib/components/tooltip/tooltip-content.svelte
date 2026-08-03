<script lang="ts" module>
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import type { ComponentProps } from 'svelte';
	import TooltipPortal from './tooltip-portal.svelte';

	export type TooltipContentProps = TooltipPrimitive.ContentProps & {
		/** CSS max-width for the tooltip panel. Omit to use the skin's xs max width. */
		maxWidth?: string;
		/** CSS width for the tooltip panel. Omit for fit-content. */
		width?: string;
		/** Props passed to the portal wrapper. */
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof TooltipPortal>>;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		sideOffset = 0,
		side = 'top',
		maxWidth,
		width,
		portalProps,
		style,
		children,
		...restProps
	}: TooltipContentProps = $props();

	const contentStyle = $derived(
		[
			style,
			width ? `--tooltip-content-width: ${width}` : undefined,
			maxWidth ? `--tooltip-content-max-width: ${maxWidth}` : undefined
		]
			.filter(Boolean)
			.join('; ') || undefined
	);
</script>

<TooltipPortal {...portalProps}>
	<TooltipPrimitive.Content
		bind:ref
		data-slot="tooltip-content"
		style={contentStyle}
		{sideOffset}
		{side}
		{...restProps}
	>
		{@render children?.()}
		<TooltipPrimitive.Arrow data-slot="tooltip-arrow" />
	</TooltipPrimitive.Content>
</TooltipPortal>
