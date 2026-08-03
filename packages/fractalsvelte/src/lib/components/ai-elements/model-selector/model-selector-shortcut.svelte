<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Shortcut as CommandShortcut } from "$lib/components/command/index.js";

	export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ModelSelectorShortcutProps = $props();
</script>

<CommandShortcut
	bind:ref
	data-slot="model-selector-shortcut"
	{...restProps}
>
	{@render children?.()}
</CommandShortcut>
