<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type MessageAttachmentsProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: MessageAttachmentsProps = $props();

	const hasChildren = $derived(!!children);
</script>

{#if hasChildren}
	<div bind:this={ref} data-slot="message-attachments" {...restProps}>
		{@render children?.()}
	</div>
{/if}
