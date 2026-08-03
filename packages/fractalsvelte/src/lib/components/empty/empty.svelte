<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type EmptyProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: EmptyProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="empty"
	{...restProps}
>
	{@render children?.()}
</div>
