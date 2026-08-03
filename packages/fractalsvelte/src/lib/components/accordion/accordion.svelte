<script lang="ts" module>
	import type { Radius, TextSize, TextTransform } from '$lib/types.js';
	import type { WithElementRef, WithoutChild } from '$lib/utils.js';
	import { Accordion as AccordionPrimitive } from 'bits-ui';

	export type AccordionVariant = 'default' | 'plain' | 'card';
	export type AccordionSize = 'default' | 'sm';

	export type AccordionProps = WithoutChild<AccordionPrimitive.RootProps> &
		WithElementRef<unknown, HTMLDivElement> & {
			variant?: AccordionVariant;
			size?: AccordionSize;
			radius?: Radius;
			textSize?: TextSize;
			textTransform?: TextTransform;
		};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		variant = 'default',
		size = 'default',
		radius,
		textSize,
		textTransform,
		children,
		...restProps
	}: AccordionProps = $props();
</script>

<AccordionPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="accordion"
	data-variant={variant}
	data-size={size}
	data-radius={radius}
	data-text-size={textSize}
	data-transform={textTransform}
	{...restProps}
>
	{@render children?.()}
</AccordionPrimitive.Root>
