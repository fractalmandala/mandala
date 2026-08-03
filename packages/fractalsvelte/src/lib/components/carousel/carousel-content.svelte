<script lang="ts">
	import emblaCarouselSvelte from "embla-carousel-svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils.js";
	import { getEmblaContext } from "./context.js";

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const emblaCtx = getEmblaContext("<Carousel.Content/>");
</script>

<div
	data-slot="carousel-viewport"
	use:emblaCarouselSvelte={{
		options: {
			container: "[data-embla-container]",
			slides: "[data-embla-slide]",
			...emblaCtx.options,
			axis: emblaCtx.orientation === "horizontal" ? "x" : "y",
		},
		plugins: emblaCtx.plugins,
	}}
	onemblaInit={emblaCtx.onInit}
>
	<div
		bind:this={ref}
		data-slot="carousel-content"
		data-orientation={emblaCtx.orientation}
		data-embla-container=""
		{...restProps}
	>
		{@render children?.()}
	</div>
</div>
