<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DialogContent } from "$lib/components/dialog/index.js";

	export type ModelSelectorContentProps = ComponentProps<typeof DialogContent>;
</script>

<script lang="ts">
	import { Root as CommandRoot } from "$lib/components/command/index.js";

	let {
		children,
		ref = $bindable(null),
		showCloseButton = false,
		...restProps
	}: ModelSelectorContentProps = $props();
</script>

<DialogContent
	bind:ref
	data-slot="model-selector-content"
	{showCloseButton}
	{...restProps}
>
	<CommandRoot data-slot="model-selector-command">
		{@render children?.()}
	</CommandRoot>
</DialogContent>
