<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type MessageActionsProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: MessageActionsProps = $props();
</script>

<div bind:this={ref} data-slot="message-actions" {...restProps}>
	{@render children?.()}
</div>
