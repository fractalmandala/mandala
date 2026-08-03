<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Root as ButtonGroupRoot } from "$lib/components/button-group/index.js";

	export type MessageBranchSelectorProps = ComponentProps<typeof ButtonGroupRoot>;
</script>

<script lang="ts">
	import { getMessageBranchContext } from "./message-context.svelte.js";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: MessageBranchSelectorProps = $props();

	const branchContext = getMessageBranchContext();
	let shouldRender = $derived(branchContext.totalBranches > 1);
</script>

{#if shouldRender}
	<ButtonGroupRoot
		bind:ref
		orientation="horizontal"
		data-slot="message-branch-selector"
		{...restProps}
	>
		{@render children?.()}
	</ButtonGroupRoot>
{/if}
