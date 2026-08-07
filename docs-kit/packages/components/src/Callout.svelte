<script lang="ts">
	import type { Snippet } from 'svelte';

	type CalloutKind = 'note' | 'info' | 'tip' | 'warning' | 'danger';

	let {
		kind = 'note',
		title,
		children
	}: { kind?: CalloutKind; title?: string; children: Snippet } = $props();

	const defaultTitles: Record<CalloutKind, string> = {
		note: 'Note',
		info: 'Info',
		tip: 'Tip',
		warning: 'Warning',
		danger: 'Danger'
	};

	const label = $derived(title ?? defaultTitles[kind]);
</script>

<aside class="docs-callout docs-callout--{kind}" aria-label={label}>
	<p class="docs-callout__title">{label}</p>
	<div class="docs-callout__body">{@render children()}</div>
</aside>
