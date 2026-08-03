<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Dialog as CommandDialog } from "$lib/components/command/index.js";

	export type ModelSelectorDialogProps = ComponentProps<typeof CommandDialog>;
</script>

<script lang="ts">
	let {
		open = $bindable(false),
		ref = $bindable(null),
		value = $bindable(""),
		title = "Model Selector",
		description = "Search for a model",
		children,
		...restProps
	}: ModelSelectorDialogProps = $props();
</script>

<CommandDialog
	bind:open
	bind:ref
	bind:value
	{title}
	{description}
	data-slot="model-selector-dialog"
	{...restProps}
>
	{@render children?.()}
</CommandDialog>
