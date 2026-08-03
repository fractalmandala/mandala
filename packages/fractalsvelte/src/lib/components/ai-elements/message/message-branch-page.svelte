<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Text as ButtonGroupText } from "$lib/components/button-group/index.js";

	export type MessageBranchPageProps = ComponentProps<typeof ButtonGroupText>;
</script>

<script lang="ts">
	import { getMessageBranchContext } from "./message-context.svelte.js";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: MessageBranchPageProps = $props();

	const branchContext = getMessageBranchContext();
</script>

<ButtonGroupText
	bind:ref
	data-slot="message-branch-page"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{branchContext.currentBranch + 1} of {branchContext.totalBranches}
	{/if}
</ButtonGroupText>
