<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	let {
		open,
		defaultOpen = false,
		onOpenChange,
		collapsedLines = 4,
		moreLabel = 'Show more',
		lessLabel = 'Show less',
		children
	}: {
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (v: boolean) => void;
		collapsedLines?: 2 | 3 | 4 | 5 | 6;
		moreLabel?: string;
		lessLabel?: string;
		children?: Snippet;
	} = $props();
	let internal = $state(untrack(() => defaultOpen));
	$effect(() => { if (open === undefined) internal = defaultOpen; });
	let current = $derived(open ?? internal);
	const id = `bubble-${Math.random().toString(36).slice(2)}`;
	function toggle() {
		const next = !current;
		if (open === undefined) internal = next;
		onOpenChange?.(next);
	}
</script>

<div data-slot="message-bubble-collapsible" data-state={current ? 'open' : 'closed'}>
	<div
		{id}
		data-slot="message-bubble-collapsible-content"
		style={`--collapsed-lines:${collapsedLines}`}
	>
		{@render children?.()}
	</div>
	<button
		type="button"
		data-slot="message-bubble-collapsible-trigger"
		aria-expanded={current}
		aria-controls={id}
		onclick={toggle}>{current ? lessLabel : moreLabel}<span aria-hidden="true">⌄</span></button
	>
</div>
