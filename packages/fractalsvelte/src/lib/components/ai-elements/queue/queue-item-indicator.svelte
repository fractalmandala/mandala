<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type QueueItemIndicatorProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		/** When true, renders the completed (filled/muted) state. */
		completed?: boolean;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		completed = false,
		children,
		ref = $bindable(null),
		...restProps
	}: QueueItemIndicatorProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="queue-item-indicator"
	data-completed={completed || undefined}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</span>
