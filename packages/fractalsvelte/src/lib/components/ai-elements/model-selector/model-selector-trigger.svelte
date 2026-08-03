<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DialogTrigger } from "$lib/components/dialog/index.js";

	export type ModelSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ModelSelectorTriggerProps = $props();
</script>

<DialogTrigger
	bind:ref
	data-slot="model-selector-trigger"
	{...restProps}
>
	{@render children?.()}
</DialogTrigger>
