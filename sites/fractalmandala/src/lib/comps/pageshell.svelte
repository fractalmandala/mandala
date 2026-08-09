<script lang="ts">
	// Passthrough content wrapper for the canonical <AppShell> layout.
	// The 3-column grid (left accordion + body + right TOC) now lives in the
	// layout; pages just render their content into .bodymain. Any `asides`
	// content (e.g. a listing page's tag cloud) folds in below the content —
	// the right rail is reserved for the shared TOC on article pages.
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		asides?: Snippet;
	}

	let { children, asides }: Props = $props();
</script>

<div class="box rgap32">
	{@render children()}
	{#if asides}
		<div class="box rgap16 padtop16" style="border-top: 1px solid var(--border-default)">
			{@render asides()}
		</div>
	{/if}
</div>
