<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export type ModelSelectorNameProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		children: Snippet;
	};
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ModelSelectorNameProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="model-selector-name"
	{...restProps}
>
	{@render children()}
</span>
