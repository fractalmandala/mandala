<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Root as CarouselRoot } from "$lib/components/carousel/index.js";

	export type InlineCitationCarouselProps = ComponentProps<typeof CarouselRoot>;
</script>

<script lang="ts">
	import {
		CarouselContext,
		setCarouselContext,
	} from "./carousel-context.svelte.js";

	let {
		children,
		opts = {},
		plugins = [],
		orientation = "horizontal",
		...restProps
	}: InlineCitationCarouselProps = $props();

	const carouselContext = new CarouselContext();
	setCarouselContext(carouselContext);

	function setApi(api: any) {
		carouselContext.setApi(api);
	}
</script>

<CarouselRoot
	{opts}
	{plugins}
	{orientation}
	data-slot="inline-citation-carousel"
	{setApi}
	{...restProps}
>
	{@render children?.()}
</CarouselRoot>
