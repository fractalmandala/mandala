<script lang="ts">
	import type { Radius } from "$lib/types.js";
	import type { WithElementRef, WithoutChildren } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	// shadcn's Skeleton has no props at all — every use supplies geometry through Tailwind
	// classes (`class="h-4 w-[250px]"`, `class="size-12 rounded-full"`). With class merging
	// removed those become real props, otherwise the component cannot express a size.
	// Any CSS length is accepted, so `width="250px"` and `width="100%"` both work.
	let {
		ref = $bindable(null),
		width,
		height,
		size,
		radius,
		style,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		width?: string;
		height?: string;
		/** Shorthand for equal width and height. */
		size?: string;
		radius?: Radius;
	} = $props();

	const geometry = $derived(
		[
			(size ?? width) && `width:${size ?? width}`,
			(size ?? height) && `height:${size ?? height}`,
			style,
		]
			.filter(Boolean)
			.join(";")
	);
</script>

<div
	bind:this={ref}
	data-slot="skeleton"
	data-radius={radius}
	style={geometry || undefined}
	{...restProps}
></div>
