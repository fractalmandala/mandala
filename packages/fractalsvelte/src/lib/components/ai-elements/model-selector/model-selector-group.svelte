<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Group as CommandGroup } from "$lib/components/command/index.js";

	export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ModelSelectorGroupProps = $props();
</script>

<CommandGroup
	bind:ref
	data-slot="model-selector-group"
	{...restProps}
>
	{@render children?.()}
</CommandGroup>
