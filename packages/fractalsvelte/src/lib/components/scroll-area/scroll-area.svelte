<script lang="ts" module>
	import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { Radius } from '$lib/types.js';
	import type { WithoutChild } from '$lib/utils.js';

	export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';
	export type ScrollAreaWhitespace = 'normal' | 'nowrap';

	export type ScrollAreaProps = WithoutChild<ScrollAreaPrimitive.RootProps> & {
		orientation?: ScrollAreaOrientation;
		viewportRef?: HTMLElement | null;
		width?: string;
		height?: string;
		maxWidth?: string;
		maxHeight?: string;
		padding?: string;
		bordered?: boolean;
		radius?: Radius;
		whitespace?: ScrollAreaWhitespace;
		scrollbarX?: Snippet;
		scrollbarY?: Snippet;
	};
</script>

<script lang="ts">
	import { Scrollbar } from './index.js';

	let {
		ref = $bindable(null),
		viewportRef = $bindable(null),
		orientation = 'vertical',
		width,
		height,
		maxWidth,
		maxHeight,
		padding,
		bordered = false,
		radius,
		whitespace,
		scrollbarX,
		scrollbarY,
		children,
		style,
		...restProps
	}: ScrollAreaProps = $props();

	const rootStyle = $derived(
		[
			width && `width:${width}`,
			height && `height:${height}`,
			maxWidth && `max-width:${maxWidth}`,
			maxHeight && `max-height:${maxHeight}`,
			padding && `padding:${padding}`,
			style
		]
			.filter(Boolean)
			.join(';')
	);
</script>

<ScrollAreaPrimitive.Root
	bind:ref
	data-slot="scroll-area"
	data-bordered={bordered || undefined}
	data-radius={radius}
	data-whitespace={whitespace}
	style={rootStyle || undefined}
	{...restProps}
>
	<ScrollAreaPrimitive.Viewport bind:ref={viewportRef} data-slot="scroll-area-viewport">
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>

	{#if orientation === 'vertical' || orientation === 'both'}
		{#if scrollbarY}
			{@render scrollbarY()}
		{:else}
			<Scrollbar orientation="vertical" />
		{/if}
	{/if}

	{#if orientation === 'horizontal' || orientation === 'both'}
		{#if scrollbarX}
			{@render scrollbarX()}
		{:else}
			<Scrollbar orientation="horizontal" />
		{/if}
	{/if}

	<ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
</ScrollAreaPrimitive.Root>
