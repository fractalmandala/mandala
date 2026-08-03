<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type MessageToolbarProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: MessageToolbarProps = $props();
</script>

<div bind:this={ref} data-slot="message-toolbar" {...restProps}>
	{@render children?.()}
</div>
