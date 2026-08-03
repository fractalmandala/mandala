<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type AlertDialogHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: AlertDialogHeaderProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-dialog-header"
	{...restProps}
>
	{@render children?.()}
</div>
