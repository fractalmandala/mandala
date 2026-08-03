<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Root as DialogRoot } from "$lib/components/dialog/index.js";

	export type ModelSelectorProps = ComponentProps<typeof DialogRoot>;
</script>

<script lang="ts">
	let {
		open = $bindable(false),
		children,
		...restProps
	}: ModelSelectorProps = $props();
</script>

<DialogRoot bind:open {...restProps}>
	{@render children?.()}
</DialogRoot>
