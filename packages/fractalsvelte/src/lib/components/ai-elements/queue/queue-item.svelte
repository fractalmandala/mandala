<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLLiAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type QueueItemProps = WithElementRef<HTMLLiAttributes> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: QueueItemProps = $props();
</script>

<li bind:this={ref} data-slot="queue-item" {...restProps}>
	{@render children?.()}
</li>
