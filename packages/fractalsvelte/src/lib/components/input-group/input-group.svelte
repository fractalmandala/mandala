<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type InputGroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: InputGroupProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="input-group"
	role="group"
	{...restProps}
>
	{@render children?.()}
</div>
