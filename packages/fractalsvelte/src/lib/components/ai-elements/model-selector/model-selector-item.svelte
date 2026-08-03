<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Item as CommandItem } from "$lib/components/command/index.js";

	export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ModelSelectorItemProps = $props();
</script>

<CommandItem
	bind:ref
	data-slot="model-selector-item"
	{...restProps}
>
	{@render children?.()}
</CommandItem>
