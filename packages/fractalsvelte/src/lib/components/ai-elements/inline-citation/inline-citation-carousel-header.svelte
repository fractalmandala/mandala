<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type InlineCitationCarouselHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: InlineCitationCarouselHeaderProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="inline-citation-carousel-header"
	{...restProps}
>
	{@render children?.()}
</div>
