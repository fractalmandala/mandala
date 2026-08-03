<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/button/index.js';

	export type MessageBranchPreviousProps = Omit<ComponentProps<typeof Button>, 'href'>;
</script>

<script lang="ts">
	import { getMessageBranchContext } from './message-context.svelte.js';

	let {
		children,
		variant = 'ghost',
		size = 'icon-sm',
		ref = $bindable(null),
		...restProps
	}: MessageBranchPreviousProps = $props();

	const branchContext = getMessageBranchContext();
	const isDisabled = $derived(branchContext.totalBranches <= 1);
</script>

<Button
	bind:ref
	aria-label="Previous branch"
	disabled={isDisabled}
	onclick={() => branchContext.goToPrevious()}
	{size}
	type="button"
	{variant}
	data-message-branch-nav="previous"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="m15 18-6-6 6-6" />
		</svg>
	{/if}
</Button>
