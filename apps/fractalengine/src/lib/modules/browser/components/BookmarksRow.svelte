<script lang="ts">
	// Bookmarks Row — bottom row of browser header (§3.9/P4/B7)
	//
	// Shows top-level bookmarks as clickable chips. Consumes the `bookmarks`
	// singleton from C4. Auto-loads on mount.

	import { bookmarks } from '../state/bookmarks.svelte';
	import { onMount } from 'svelte';

	interface Props {
		onNavigate?: (url: string) => void;
	}

	let { onNavigate = (url: string) => {} }: Props = $props();

	onMount(() => {
		if (!bookmarks.loaded) bookmarks.load();
	});

	let topLevel = $derived(bookmarks.entries.filter(b => b.url));
</script>

<div class="browser-bookmarks-row">
	{#if topLevel.length === 0}
		<span class="browser-bookmarks-placeholder text-xs" style="color: var(--text-tertiary)">
			Drag or bookmark pages to see them here
		</span>
	{:else}
		{#each topLevel as bm (bm.id)}
			<button
				class="browser-bookmark-chip"
				onclick={() => onNavigate(bm.url)}
				title={bm.url}
			>
				<img
					src={bm.faviconUrl || '/iconset/bookmark.svg'}
					alt=""
					class="icon-svg-xs"
				/>
				<span>{bm.title || bm.url}</span>
			</button>
		{/each}
	{/if}
</div>
