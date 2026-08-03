<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ContextContentBodyProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ContextContentBodyProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="context-content-body"
	{...restProps}
>
	{@render children?.()}
</div>
