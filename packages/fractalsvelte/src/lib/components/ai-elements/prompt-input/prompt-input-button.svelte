<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Button } from "$lib/components/button/index.js";

	export type PromptInputButtonProps = ComponentProps<typeof Button>;
</script>

<script lang="ts">
	let {
		variant = "ghost",
		size = "icon",
		children,
		ref = $bindable(null),
		...restProps
	}: PromptInputButtonProps = $props();
</script>

<Button
	bind:ref
	{variant}
	{size}
	type="button"
	{...restProps}
	data-prompt-input-button
>
	{@render children?.()}
</Button>
