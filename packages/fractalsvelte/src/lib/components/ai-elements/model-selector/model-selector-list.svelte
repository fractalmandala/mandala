<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { List as CommandList } from "$lib/components/command/index.js";

	export type ModelSelectorListProps = ComponentProps<typeof CommandList>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ModelSelectorListProps = $props();
</script>

<CommandList
	bind:ref
	data-slot="model-selector-list"
	{...restProps}
>
	{@render children?.()}
</CommandList>
