<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ConversationContentGap = 'default' | 'compact' | 'loose';

	export type ConversationContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/**
		 * Vertical rhythm between messages.
		 * default = 2rem (source gap-8), compact = 1rem (gap-4), loose = 2.5rem.
		 */
		gap?: ConversationContentGap;
	};
</script>

<script lang="ts">
	import { getStickToBottomContext } from './stick-to-bottom-context.svelte.js';
	import { watch } from 'runed';

	let {
		children,
		gap = 'default',
		ref = $bindable(null),
		...restProps
	}: ConversationContentProps = $props();

	const context = getStickToBottomContext();
	let element = $state<HTMLDivElement | null>(null);

	$effect(() => {
		ref = element;
	});

	watch(
		() => element,
		() => {
			if (element) {
				context.setElement(element);
				// Initial stick-to-bottom uses Conversation.initial behavior.
				context.scrollInitial();
			}
		}
	);
</script>

<div
	bind:this={element}
	data-slot="conversation-content"
	data-gap={gap}
	{...restProps}
>
	{@render children?.()}
</div>
