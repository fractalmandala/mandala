<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export type ModelSelectorLogoGroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children: Snippet;
	};
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ModelSelectorLogoGroupProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="model-selector-logo-group"
	{...restProps}
>
	{@render children()}
</div>
