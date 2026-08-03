<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Item as CarouselItem } from "$lib/components/carousel/index.js";

	export type InlineCitationCarouselItemProps = ComponentProps<typeof CarouselItem>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: InlineCitationCarouselItemProps = $props();
</script>

<CarouselItem
	bind:ref
	data-slot="inline-citation-carousel-item"
	{...restProps}
>
	{@render children?.()}
</CarouselItem>
