<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	export type InlineCitationCarouselNextProps = WithElementRef<HTMLButtonAttributes>;
</script>

<script lang="ts">
	import { getCarouselContext } from "./carousel-context.svelte.js";

	let {
		ref = $bindable(null),
		...restProps
	}: InlineCitationCarouselNextProps = $props();

	const carouselContext = getCarouselContext();

	function handleClick() {
		const api = carouselContext?.getApi();
		if (api) {
			api.scrollNext();
		}
	}
</script>

<button
	bind:this={ref}
	aria-label="Next"
	type="button"
	data-slot="inline-citation-carousel-next"
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
		<path d="M5 12h14" />
		<path d="m12 5 7 7-7 7" />
	</svg>
</button>
