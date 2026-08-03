<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type EmptyTitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: EmptyTitleProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="empty-title"
	{...restProps}
>
	{@render children?.()}
</div>
