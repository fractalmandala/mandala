<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type PromptInputBodyProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: PromptInputBodyProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="prompt-input-body"
	{...restProps}
>
	{@render children?.()}
</div>
