<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLImgAttributes } from 'svelte/elements';

	export type QueueItemImageProps = WithElementRef<HTMLImgAttributes>;
</script>

<script lang="ts">
	let {
		alt = '',
		ref = $bindable(null),
		...restProps
	}: QueueItemImageProps = $props();
</script>

<img
	bind:this={ref}
	{alt}
	width={32}
	height={32}
	data-slot="queue-item-image"
	{...restProps}
/>
