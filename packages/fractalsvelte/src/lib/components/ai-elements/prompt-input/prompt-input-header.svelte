<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type PromptInputHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: PromptInputHeaderProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="prompt-input-header"
	{...restProps}
>
	{@render children?.()}
</div>
