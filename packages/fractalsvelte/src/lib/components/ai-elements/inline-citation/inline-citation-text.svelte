<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type InlineCitationTextProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: InlineCitationTextProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="inline-citation-text"
	{...restProps}
>
	{@render children?.()}
</span>
