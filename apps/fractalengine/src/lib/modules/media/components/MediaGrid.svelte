<script lang="ts">
	import { media } from '../state/media.svelte';
	import MediaCard from './MediaCard.svelte';
	import { onMount } from 'svelte';
	let viewer = $state<HTMLDivElement | null>(null);
	let viewerWidth = $state(0); let scrollTop = $state(0);
	let columns = $derived(Math.max(1, Math.floor((viewerWidth - 32 + 12) / (media.thumbSize + 12))));
	let rowHeight = $derived(media.thumbSize + 56);
	let startRow = $derived(Math.max(0, Math.floor(scrollTop / rowHeight) - 3));
	let endRow = $derived(Math.ceil((scrollTop + (viewer?.clientHeight ?? 0)) / rowHeight) + 4);
	let startIndex = $derived(startRow * columns); let endIndex = $derived(Math.min(media.visibleItems.length, endRow * columns));
	let windowedItems = $derived(media.visibleItems.slice(startIndex, endIndex));
	let topPadding = $derived(startRow * rowHeight); let bottomPadding = $derived(Math.max(0, (Math.ceil(media.visibleItems.length / columns) - endRow) * rowHeight));
	onMount(() => { const observer = new ResizeObserver(() => viewerWidth = viewer?.clientWidth ?? 0); if (viewer) observer.observe(viewer); return () => observer.disconnect(); });
	function handleKeydown(event: KeyboardEvent) { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') { event.preventDefault(); media.selectAll(); } if (event.key === 'Escape') media.clearSelection(); }
</script>

<div bind:this={viewer} class="media-viewer" data-media-folder={media.activeScope.type === 'folder' ? media.activeScope.path : ''} onscroll={() => scrollTop = viewer?.scrollTop ?? 0} ondragover={event => event.preventDefault()} ondrop={event => { event.preventDefault(); const paths = event.dataTransfer?.getData('application/x-fractal-media-paths').split('\n').filter(Boolean) ?? []; if (paths.length) void media.move(paths, media.activeScope.type === 'folder' ? media.activeScope.path : ''); }} role="region" aria-label="Media grid">
	{#if media.loading}<div class="media-empty">Loading library…</div>
	{:else if media.error}<div class="media-empty">{media.error}</div>
	{:else if media.visibleItems.length === 0}<div class="media-empty">No media in this view yet.</div>
	{:else}<div class="media-grid" style:grid-template-columns={`repeat(${columns}, minmax(0, 1fr))`} style:padding-top={`${topPadding + 16}px`} style:padding-bottom={`${bottomPadding + 16}px`}>
		{#each windowedItems as item (item.id)}<MediaCard {item} selected={media.selection.has(item.id)} onSelect={event => media.selectItem(item.id, event)} />{/each}
	</div>{/if}
</div>
