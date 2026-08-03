<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	export type InlineCitationCarouselPrevProps = WithElementRef<HTMLButtonAttributes>;
</script>

<script lang="ts">
	import { getCarouselContext } from "./carousel-context.svelte.js";

	let {
		ref = $bindable(null),
		...restProps
	}: InlineCitationCarouselPrevProps = $props();

	const carouselContext = getCarouselContext();

	function handleClick() {
		const api = carouselContext?.getApi();
		if (api) {
			api.scrollPrev();
		}
	}
</script>

<button
	bind:this={ref}
	aria-label="Previous"
	type="button"
	data-slot="inline-citation-carousel-prev"
	onclick={handleClick}
	{...restProps}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="m12 19-7-7 7-7" />
		<path d="M19 12H5" />
	</svg>
</button>
