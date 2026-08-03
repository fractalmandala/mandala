<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type CardSize = "default" | "sm";

	export type CardProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Drives --card-spacing, which header, content and footer all read. */
		size?: CardSize;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		size = "default",
		children,
		...restProps
	}: CardProps = $props();
</script>

<div bind:this={ref} data-slot="card" data-size={size} {...restProps}>
	{@render children?.()}
</div>
