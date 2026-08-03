<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type EmptyHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: EmptyHeaderProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="empty-header"
	{...restProps}
>
	{@render children?.()}
</div>
