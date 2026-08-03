<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type QueueItemDescriptionProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** When true, mutes and strikes through the description. */
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
	}: QueueItemDescriptionProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="queue-item-description"
	data-completed={completed || undefined}
	{...restProps}
>
	{@render children?.()}
</div>
