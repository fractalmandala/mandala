<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type EmptyDescriptionProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: EmptyDescriptionProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="empty-description"
	{...restProps}
>
	{@render children?.()}
</div>
