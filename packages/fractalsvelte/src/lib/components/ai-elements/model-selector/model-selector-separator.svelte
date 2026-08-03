<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Separator as CommandSeparator } from "$lib/components/command/index.js";

	export type ModelSelectorSeparatorProps = ComponentProps<typeof CommandSeparator>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		...restProps
	}: ModelSelectorSeparatorProps = $props();
</script>

<CommandSeparator
	bind:ref
	data-slot="model-selector-separator"
	{...restProps}
/>
