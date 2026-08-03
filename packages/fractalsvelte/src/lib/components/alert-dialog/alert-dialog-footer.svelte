<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type AlertDialogFooterProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: AlertDialogFooterProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-dialog-footer"
	{...restProps}
>
	{@render children?.()}
</div>
