<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type QueueItemFileProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: QueueItemFileProps = $props();
</script>

<span bind:this={ref} data-slot="queue-item-file" {...restProps}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path
			d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"
		/>
	</svg>
	<span data-slot="queue-item-file-name">{@render children?.()}</span>
</span>
