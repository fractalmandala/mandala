<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type AlertDescriptionProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: AlertDescriptionProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-description"
	{...restProps}
>
	{@render children?.()}
</div>
