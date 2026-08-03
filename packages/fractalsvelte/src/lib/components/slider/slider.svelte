<script lang="ts" module>
	import type { WithElementRef, WithoutChildrenOrChild } from '$lib/utils.js';
	import { Slider as SliderPrimitive } from 'bits-ui';

	export type SliderProps = WithElementRef<
		WithoutChildrenOrChild<SliderPrimitive.RootProps>,
		HTMLSpanElement
	> & {
		/** CSS max-width for the root, replacing documented max-width utility usage. */
		maxWidth?: string;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		orientation = 'horizontal',
		maxWidth,
		style,
		...restProps
	}: SliderProps = $props();

	const isHorizontal = $derived(orientation === 'horizontal');
	const rootStyle = $derived(
		[maxWidth && `max-width:${maxWidth}`, style].filter(Boolean).join(';')
	);
</script>

<!--
Discriminated unions and bindable destructuring do not compose cleanly here,
so value is cast when passed back to bits-ui.
-->
<SliderPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="slider"
	data-horizontal={isHorizontal ? '' : undefined}
	data-vertical={!isHorizontal ? '' : undefined}
	{orientation}
	style={rootStyle || undefined}
	{...restProps}
>
	{#snippet children({ thumbItems })}
		<span
			data-slot="slider-track"
			data-orientation={orientation}
			data-horizontal={isHorizontal ? '' : undefined}
			data-vertical={!isHorizontal ? '' : undefined}
		>
			<SliderPrimitive.Range
				data-slot="slider-range"
				data-horizontal={isHorizontal ? '' : undefined}
				data-vertical={!isHorizontal ? '' : undefined}
			/>
		</span>
		{#each thumbItems as thumb (thumb.index)}
			<SliderPrimitive.Thumb
				data-slot="slider-thumb"
				data-horizontal={isHorizontal ? '' : undefined}
				data-vertical={!isHorizontal ? '' : undefined}
				index={thumb.index}
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
