<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type EmptyMediaVariant = "default" | "icon";

	export type EmptyMediaProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: EmptyMediaVariant;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		variant = "default",
		children,
		...restProps
	}: EmptyMediaProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="empty-media"
	data-variant={variant}
	{...restProps}
>
	{@render children?.()}
</div>
