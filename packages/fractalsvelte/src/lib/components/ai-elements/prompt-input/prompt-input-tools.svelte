<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type PromptInputToolsProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: PromptInputToolsProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="prompt-input-tools"
	{...restProps}
>
	{@render children?.()}
</div>
