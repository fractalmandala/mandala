<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type InlineCitationCarouselIndexProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { getCarouselContext } from "./carousel-context.svelte.js";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: InlineCitationCarouselIndexProps = $props();

	const carouselContext = getCarouselContext();

	let current = $state(0);
	let count = $state(0);

	const displayText = $derived.by(() => {
		return children ? null : `${current}/${count}`;
	});

	$effect(() => {
		const api = carouselContext?.getApi();
		if (!api) return;

		count = api.scrollSnapList().length;
		current = api.selectedScrollSnap() + 1;

		const handleSelect = () => {
			current = api.selectedScrollSnap() + 1;
		};

		api.on("select", handleSelect);

		return () => {
			api.off?.("select", handleSelect);
		};
	});
</script>

<div
	bind:this={ref}
	data-slot="inline-citation-carousel-index"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{displayText}
	{/if}
</div>
