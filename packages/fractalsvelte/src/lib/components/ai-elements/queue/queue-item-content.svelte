<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type QueueItemContentProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		/** When true, mutes and strikes through the content. */
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
	}: QueueItemContentProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="queue-item-content"
	data-completed={completed || undefined}
	{...restProps}
>
	{@render children?.()}
</span>
