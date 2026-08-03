<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Empty as CommandEmpty } from "$lib/components/command/index.js";

	export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ModelSelectorEmptyProps = $props();
</script>

<CommandEmpty
	bind:ref
	data-slot="model-selector-empty"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		No models found.
	{/if}
</CommandEmpty>
