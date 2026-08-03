<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Input as CommandInput } from "$lib/components/command/index.js";

	export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>;
</script>

<script lang="ts">
	let {
		value = $bindable(""),
		ref = $bindable(null),
		...restProps
	}: ModelSelectorInputProps = $props();
</script>

<CommandInput
	bind:ref
	bind:value
	data-slot="model-selector-input"
	{...restProps}
/>
