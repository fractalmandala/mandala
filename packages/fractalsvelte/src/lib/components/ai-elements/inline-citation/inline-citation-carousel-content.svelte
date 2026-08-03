<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Content as CarouselContent } from "$lib/components/carousel/index.js";

	export type InlineCitationCarouselContentProps = ComponentProps<typeof CarouselContent>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: InlineCitationCarouselContentProps = $props();
</script>

<CarouselContent
	bind:ref
	data-slot="inline-citation-carousel-content"
	{...restProps}
>
	{@render children?.()}
</CarouselContent>
