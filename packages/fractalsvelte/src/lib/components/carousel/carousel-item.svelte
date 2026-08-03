<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils.js";
	import { getEmblaContext } from "./context.js";

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const emblaCtx = getEmblaContext("<Carousel.Item/>");
</script>

<div
	bind:this={ref}
	data-slot="carousel-item"
	data-orientation={emblaCtx.orientation}
	role="group"
	aria-roledescription="slide"
	data-embla-slide=""
	{...restProps}
>
	{@render children?.()}
</div>
