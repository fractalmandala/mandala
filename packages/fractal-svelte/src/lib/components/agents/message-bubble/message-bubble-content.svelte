<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getBubbleContext } from './context.js';
	let {
		children,
		href,
		onclick
	}: { children?: Snippet; href?: string; onclick?: (e: MouseEvent) => void } = $props();
	const context = getBubbleContext();
</script>

{#if href}<a data-slot="message-bubble-content" data-variant={context.variant} {href} {onclick}
		>{@render children?.()}</a
	>{:else if onclick}<button
		type="button"
		data-slot="message-bubble-content"
		data-variant={context.variant}
		{onclick}>{@render children?.()}</button
	>{:else}<div data-slot="message-bubble-content" data-variant={context.variant}>
		{@render children?.()}
	</div>{/if}
