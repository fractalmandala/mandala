<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SheetHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SheetHeaderProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="sheet-header"
	{...restProps}
>
	{@render children?.()}
</div>
