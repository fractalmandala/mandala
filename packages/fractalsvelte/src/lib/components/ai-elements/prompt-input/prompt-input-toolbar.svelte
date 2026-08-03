<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type PromptInputToolbarProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: PromptInputToolbarProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="prompt-input-toolbar"
	{...restProps}
>
	{@render children?.()}
</div>
