<script lang="ts">
	import { searchAll, type SearchHit } from '$lib/ipc';
	import { appState } from '$lib/state/app.svelte';
	import { shellState } from '$lib/state/shell.svelte';
	import { notes } from '$lib/modules/notes/state/notes.svelte';
	import VirtualList from './VirtualList.svelte';

	let query = $state('');
	let results = $state<SearchHit[]>([]);
	let loading = $state(false);
	let hasSearched = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let searchInput: HTMLInputElement;

	const ROW_HEIGHT = 48;

	$effect(() => {
		searchInput?.focus();
	});

	function onQueryChange(value: string) {
		query = value;
		if (debounceTimer) clearTimeout(debounceTimer);
		if (!value.trim()) {
			results = [];
			hasSearched = false;
			loading = false;
			return;
		}
		loading = true;
		debounceTimer = setTimeout(() => {
			void doSearch();
		}, 300);
	}

	async function doSearch() {
		const q = query.trim();
		if (!q) {
			results = [];
			hasSearched = false;
			loading = false;
			return;
		}
		try {
			results = await searchAll({ query: q, limit: 100 });
			hasSearched = true;
		} catch (e) {
			console.error('Search failed:', e);
			results = [];
			hasSearched = true;
		} finally {
			loading = false;
		}
	}

	function handleSelect(item: unknown, _index: number) {
		const hit = item as SearchHit;
		shellState.showSearchOverlay = false;

		if (hit.source === 'note') {
			appState.applyTemplate('notes');
			if (hit.path) {
				setTimeout(() => {
					void notes.openFile(hit.path!);
				}, 100);
			}
		} else if (hit.source === 'bookmark') {
			appState.applyTemplate('bookmarks');
		}
	}

	function close() {
		shellState.showSearchOverlay = false;
	}

	function handleOverlayKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}

	// Split a snippet on «hit» markers into plain/highlighted segments for the row snippet.
	function snippetSegments(snippet: string): Array<{ text: string; hit: boolean }> {
		const segments: Array<{ text: string; hit: boolean }> = [];
		const marker = /«([^»]*)»/g;
		let last = 0;
		let match: RegExpExecArray | null;
		while ((match = marker.exec(snippet)) !== null) {
			if (match.index > last) segments.push({ text: snippet.slice(last, match.index), hit: false });
			segments.push({ text: match[1], hit: true });
			last = marker.lastIndex;
		}
		if (last < snippet.length) segments.push({ text: snippet.slice(last), hit: false });
		return segments;
	}
</script>

{#snippet hitRow(item: unknown, _index: number)}
	{@const hit = item as SearchHit}
	<div class="search-result-row">
		<b class="search-result-title">{hit.source === 'note' ? '📄' : '🔖'} {hit.title}</b>
		<br />
		<small>
			{#each snippetSegments(hit.snippet) as segment, i (i)}
				{#if segment.hit}<mark class="search-hit-highlight">{segment.text}</mark>{:else}{segment.text}{/if}
			{/each}
			<em class="search-result-source">{hit.source}</em>
		</small>
	</div>
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="search-overlay"
	role="dialog"
	aria-modal="true"
	aria-label="Search Everything"
	onclick={(e) => { if (e.target === e.currentTarget) close(); }}
	onkeydown={handleOverlayKeydown}
	tabindex="-1"
>
	<div class="search-overlay-panel">
		<div class="search-overlay-input-row">
			<input
				class="search-overlay-input"
				type="text"
				placeholder="Search notes, bookmarks…"
				bind:this={searchInput}
				bind:value={query}
				oninput={(e) => onQueryChange((e.target as HTMLInputElement).value)}
				onkeydown={(e) => {
					if (e.key === 'Escape') close();
					if (e.key === 'Enter' && results.length > 0) {
						e.preventDefault();
						handleSelect(results[0], 0);
					}
				}}
			/>
			<button class="search-overlay-close" onclick={close} aria-label="Close search">
				✕
			</button>
		</div>
		<div class="search-overlay-results" style="flex:1;overflow:hidden;min-height:0;">
			{#if loading}
				<div class="search-overlay-status">Searching…</div>
			{:else if hasSearched && results.length === 0}
				<div class="search-overlay-status">No results found.</div>
			{:else if results.length > 0}
				<VirtualList
					items={results}
					rowHeight={ROW_HEIGHT}
					row={hitRow}
					onItemSelect={handleSelect}
					containerClass="search-overlay-virtual-list"
				/>
			{/if}
		</div>
	</div>
</div>
