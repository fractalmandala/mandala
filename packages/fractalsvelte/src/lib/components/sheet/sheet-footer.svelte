<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type SheetFooterProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: SheetFooterProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="sheet-footer"
	{...restProps}
>
	{@render children?.()}
</div>
