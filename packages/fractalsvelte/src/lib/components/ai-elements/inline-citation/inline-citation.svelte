<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type InlineCitationProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: InlineCitationProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="inline-citation"
	{...restProps}
>
	{@render children?.()}
</span>
