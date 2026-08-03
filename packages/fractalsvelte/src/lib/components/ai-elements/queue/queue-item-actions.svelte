<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type QueueItemActionsProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: QueueItemActionsProps = $props();
</script>

<div bind:this={ref} data-slot="queue-item-actions" {...restProps}>
	{@render children?.()}
</div>
