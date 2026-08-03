<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ConversationProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Scroll behavior when content mounts / first attaches. */
		initial?: ScrollBehavior;
		/** Scroll behavior when the scroll container resizes while pinned. */
		resize?: ScrollBehavior;
		/** Distance from bottom (px) treated as “at bottom”. Default 200. */
		threshold?: number;
		/** CSS height for the conversation shell. */
		height?: string;
		/** CSS max-height for the conversation shell. */
		maxHeight?: string;
	};
</script>

<script lang="ts">
	import { setStickToBottomContext } from './stick-to-bottom-context.svelte.js';

	let {
		children,
		initial = 'smooth',
		resize = 'smooth',
		threshold = 200,
		height,
		maxHeight,
		style,
		ref = $bindable(null),
		...restProps
	}: ConversationProps = $props();

	// Options are fixed at mount — stick-to-bottom observers read them once.
	// svelte-ignore state_referenced_locally
	setStickToBottomContext({ initial, resize, threshold });

	const rootStyle = $derived(
		[height && `height:${height}`, maxHeight && `max-height:${maxHeight}`, style]
			.filter(Boolean)
			.join(';')
	);
</script>

<div
	bind:this={ref}
	data-slot="conversation"
	role="log"
	aria-live="polite"
	aria-relevant="additions"
	style={rootStyle || undefined}
	{...restProps}
>
	{@render children?.()}
</div>
