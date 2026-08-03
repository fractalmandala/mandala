<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type AlertTitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: AlertTitleProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-title"
	{...restProps}
>
	{@render children?.()}
</div>
