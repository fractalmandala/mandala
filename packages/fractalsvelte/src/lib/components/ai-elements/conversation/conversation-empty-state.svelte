<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ConversationEmptyStateProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		title?: string;
		description?: string;
		icon?: Snippet;
	};
</script>

<script lang="ts">
	let {
		title = 'No messages yet',
		description = 'Start a conversation to see messages here',
		icon,
		children,
		ref = $bindable(null),
		...restProps
	}: ConversationEmptyStateProps = $props();
</script>

<div bind:this={ref} data-slot="conversation-empty-state" {...restProps}>
	{#if children}
		{@render children?.()}
	{:else}
		{#if icon}
			<div data-slot="conversation-empty-icon">
				{@render icon()}
			</div>
		{/if}
		<div data-slot="conversation-empty-text">
			<h3 data-slot="conversation-empty-title">{title}</h3>
			{#if description}
				<p data-slot="conversation-empty-description">{description}</p>
			{/if}
		</div>
	{/if}
</div>
