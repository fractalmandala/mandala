<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type EmptyContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: EmptyContentProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="empty-content"
	{...restProps}
>
	{@render children?.()}
</div>
