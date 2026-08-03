<script lang="ts">
	import { bookmarks } from "$lib/state/bookmarks.svelte";
	import { entries } from "$lib/state/entries.svelte";
	import { ui } from "$lib/state/ui.svelte";
	import { formatRelative, formatShortDate } from "$lib/utils/dates";
	import Bookmark from "$lib/icons/bookmark.svelte";
	import Clock from "$lib/icons/clock.svelte";

	// Entry list with local search. Focus is driven by ui.searchFocusToken (⌘K).

	let query = $state("");
	let searchEl = $state<HTMLInputElement | null>(null);

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const matches = q
			? entries.summaries.filter((e) => {
					const haystack = [e.title, e.category, e.excerpt, ...e.tags]
						.join(" ")
						.toLowerCase();
					return haystack.includes(q);
				})
			: entries.summaries;
		return [...matches].sort((a, b) => b.updated_at - a.updated_at);
	});

	$effect(() => {
		if (ui.searchFocusToken > 0) {
			searchEl?.focus();
			searchEl?.select();
		}
	});
</script>

<div class="sidebar box gap16">
	<div class="box">
		<input
			class="search-input"
			type="search"
			placeholder="Search…"
			bind:value={query}
			bind:this={searchEl}
			aria-label="Search entries"
		/>
	</div>
	<div class="box">
		{#each filtered as entry (entry.id)}
			<button
				class="entry-row box gap8"
				class:active={entry.id === entries.activeId}
				onclick={() => entries.open(entry.id)}
			>
				<div class="item-title tt-c">{entry.title || "Untitled"}</div>
				<div class="item-details row wrap gap16 ycenter">
					{#if bookmarks.isBookmarked(entry.id)}
						<div class="bookmarked">
							<Bookmark />
						</div>
					{/if}
					<span class="col3">{formatShortDate(entry.created_at)}</span>
					<div class="btn-icon">
						<Clock />
						<span class="col3">{formatRelative(entry.updated_at)}</span>
					</div>
					{#if entry.category}
						<span class="text-sm">{entry.category}</span>
					{/if}
					{#if entry.tags.length}
						<span class="row wrap gap8">
							{#each entry.tags.slice(0, 2) as tag, i (tag)}
								{#if i > 0}<span class="dot">•</span>{/if}
								<span>{tag}</span>
							{/each}
						</span>
					{/if}
				</div>
			</button>
		{:else}
			<p class="sidebar__empty">
				{query
					? "No matching entries."
					: "No entries yet. Paste something to begin."}
			</p>
		{/each}
	</div>
</div>
