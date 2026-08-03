<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type AlertDialogMediaProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: AlertDialogMediaProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-dialog-media"
	{...restProps}
>
	{@render children?.()}
</div>
