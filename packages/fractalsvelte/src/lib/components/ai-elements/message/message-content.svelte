<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type MessageContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: MessageContentProps = $props();
</script>

<div bind:this={ref} data-slot="message-content" {...restProps}>
	{@render children?.()}
</div>
