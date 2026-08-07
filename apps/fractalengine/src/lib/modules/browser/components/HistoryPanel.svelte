<script lang="ts">
	// History Panel — searchable visit list, delete entry, clear range (§3.3/B7)
	//
	// Consumes the `history` singleton from C3. Grouped by day, searchable,
	// per-row delete, clear-range with confirm dialog.

	import { history } from '../state/history.svelte';
	import { showConfirm } from './showConfirm';
	import { onMount } from 'svelte';

	let searchQuery = $state('');

	let filtered = $derived(
		searchQuery
			? history.entries.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.url.includes(searchQuery))
			: history.entries
	);

	onMount(() => {
		if (history.entries.length === 0) {
			history.loadRecent(100);
		}
	});

	function handleSearch(e: Event) {
		const query = (e.target as HTMLInputElement).value;
		searchQuery = query;
		history.search(query);
	}

	async function handleDelete(id: number, e: Event) {
		e.stopPropagation();
		try {
			await history.deleteUrl(id);
		} catch { /* error handled by history.error state */ }
	}

	async function handleClearAll() {
		const ok = await showConfirm('Are you sure you want to clear all browsing history?');
		if (ok) {
			try {
				await history.clearRange();
			} catch { /* error handled by history.error state */ }
		}
	}
</script>

<div class="browser-history-panel">
	<div class="browser-history-search">
		<img src="/iconset/search.svg" alt="" class="icon-svg-xs browser-history-search-icon" />
		<input
			type="text"
			class="browser-history-search-input"
			value={searchQuery}
			oninput={handleSearch}
			placeholder="Search history..."
		/>
	</div>

	<div class="browser-history-list">
		{#if history.loading}
			<div class="browser-history-empty">
				<span>Loading...</span>
			</div>
		{:else if filtered.length === 0}
			<div class="browser-history-empty">
				<img src="/iconset/history.svg" alt="" class="icon-svg-large" />
				<span>{searchQuery ? 'No matching history entries' : 'No history'}</span>
			</div>
		{:else}
			{#each filtered as entry (entry.id)}
				<div
					class="browser-history-item"
					role="button"
					tabindex="0"
					onclick={() => { /* navigation is provided by the host panel */ }}
					onkeydown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
					}}
				>
					<img src="/iconset/explorer.svg" alt="" class="browser-history-item-icon" />
					<div class="browser-history-item-info">
						<div class="browser-history-item-title">{entry.title || entry.url}</div>
						<div class="browser-history-item-url">{entry.url}</div>
					</div>
					<button class="browser-history-item-delete" onclick={(e) => handleDelete(entry.id, e)} aria-label="Delete entry">
						<img src="/iconset/close.svg" alt="" />
					</button>
				</div>
			{/each}
		{/if}
	</div>

	{#if !searchQuery && history.entries.length > 0}
		<div class="browser-history-clear-bar">
			<span style="flex:1; font-size: var(--text-xs); color: var(--text-tertiary);">{history.entries.length} entries</span>
			<button class="btn-text" onclick={handleClearAll}>Clear All</button>
		</div>
	{/if}
</div>
