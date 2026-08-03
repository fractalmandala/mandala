<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/button/index.js';

	export type MessageBranchNextProps = Omit<ComponentProps<typeof Button>, 'href'>;
</script>

<script lang="ts">
	import { getMessageBranchContext } from './message-context.svelte.js';

	let {
		children,
		variant = 'ghost',
		size = 'icon-sm',
		ref = $bindable(null),
		...restProps
	}: MessageBranchNextProps = $props();

	const branchContext = getMessageBranchContext();
	const isDisabled = $derived(branchContext.totalBranches <= 1);
</script>

<Button
	bind:ref
	aria-label="Next branch"
	disabled={isDisabled}
	onclick={() => branchContext.goToNext()}
	{size}
	type="button"
	{variant}
	data-message-branch-nav="next"
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
			<path d="m9 18 6-6-6-6" />
		</svg>
	{/if}
</Button>
