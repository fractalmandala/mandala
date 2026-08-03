<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type AlertActionProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: AlertActionProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-action"
	{...restProps}
>
	{@render children?.()}
</div>
