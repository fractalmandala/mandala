<script lang="ts" module>
	import type { WithoutChild, WithoutChildrenOrChild } from '$lib/utils.js';
	import { Select as SelectPrimitive } from 'bits-ui';
	import type { ComponentProps } from 'svelte';
	import SelectPortal from './select-portal.svelte';
	import SelectScrollDownButton from './select-scroll-down-button.svelte';
	import SelectScrollUpButton from './select-scroll-up-button.svelte';

	export type SelectContentProps = WithoutChild<SelectPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SelectPortal>>;
		maxHeight?: string;
		width?: string;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		sideOffset = 4,
		preventScroll = true,
		portalProps,
		children,
		maxHeight,
		width,
		style: styleProp,
		...restProps
	}: SelectContentProps = $props();

	const style = $derived(
		[
			maxHeight ? `max-height: ${maxHeight}` : undefined,
			width ? `width: ${width}` : undefined,
			styleProp
		]
			.filter(Boolean)
			.join('; ') || undefined
	);
</script>

<SelectPortal {...portalProps}>
	<SelectPrimitive.Content
		bind:ref
		{sideOffset}
		{preventScroll}
		data-slot="select-content"
		{style}
		{...restProps}
	>
		<SelectScrollUpButton />
		<SelectPrimitive.Viewport data-slot="select-viewport">
			{@render children?.()}
		</SelectPrimitive.Viewport>
		<SelectScrollDownButton />
	</SelectPrimitive.Content>
</SelectPortal>
