<script lang="ts" module>
	import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';
	import type { WithoutChild } from '$lib/utils.js';

	export type ScrollAreaScrollbarProps = WithoutChild<ScrollAreaPrimitive.ScrollbarProps>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		orientation = 'vertical',
		children,
		...restProps
	}: ScrollAreaScrollbarProps = $props();
</script>

<ScrollAreaPrimitive.Scrollbar
	bind:ref
	data-slot="scroll-area-scrollbar"
	data-orientation={orientation}
	{orientation}
	{...restProps}
>
	{@render children?.()}
	<ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" />
</ScrollAreaPrimitive.Scrollbar>
