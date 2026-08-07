<script lang="ts">
	// Bookmark Star — toggle + quick-edit popover (§3.4/P4/B7)
	//
	// Consumes the `bookmarks` singleton from C4.
	// Shows filled/outline star based on whether the current URL is bookmarked.
	// Quick-edit popover allows editing title/URL or removing the bookmark.

	import { bookmarks } from '../state/bookmarks.svelte';
	import { onMount } from 'svelte';

	interface Props {
		url?: string;
	}

	let { url = '' }: Props = $props();

	let showPopover = $state(false);

	// Find bookmark by URL from the in-memory entries (synchronous)
	let currentEntry = $derived(
		url && bookmarks.entries ? bookmarks.entries.find(b => b.url === url) ?? null : null
	);
	let isBookmarked = $derived(!!currentEntry);

	let editTitle = $state('');
	let editUrl = $state('');

	onMount(() => {
		if (!bookmarks.loaded) bookmarks.load();
	});

	function toggle() {
		if (isBookmarked && currentEntry) {
			bookmarks.remove(currentEntry.id);
		} else if (url) {
			bookmarks.add({ url, title: url });
		}
	}

	function openEdit(e: Event) {
		e.stopPropagation();
		if (isBookmarked && currentEntry) {
			editTitle = currentEntry.title;
			editUrl = currentEntry.url;
			showPopover = true;
		}
	}

	function saveEdit() {
		if (currentEntry) {
			bookmarks.update(currentEntry.id, { url: editUrl, title: editTitle });
		}
		showPopover = false;
	}

	function closePopover() {
		showPopover = false;
	}
</script>

<button
	class="browser-star-btn"
	class:is-starred={isBookmarked}
	onclick={toggle}
	oncontextmenu={openEdit}
	aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
	title={isBookmarked ? 'Edit bookmark' : 'Bookmark this page'}
>
	<img src="/iconset/bookmark.svg" alt="" class="icon-svg-xs" />
</button>

{#if showPopover && currentEntry}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="browser-quickedit-popover"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		role="dialog"
		aria-label="Edit bookmark"
		tabindex="-1"
	>
		<div class="browser-quickedit-field">
			<span class="text-xs">Title</span>
			<input type="text" class="input-text" bind:value={editTitle} />
		</div>
		<div class="browser-quickedit-field">
			<span class="text-xs">URL</span>
			<input type="text" class="input-text" bind:value={editUrl} />
		</div>
		<div class="browser-quickedit-actions">
			<button class="btn-app" onclick={saveEdit}>Save</button>
			<button class="btn-text" onclick={closePopover}>Cancel</button>
			<div style="flex:1"></div>
			<button class="btn-text" style="color: var(--feedback-error)" onclick={() => { if (currentEntry) { bookmarks.remove(currentEntry.id); closePopover(); } }}>
				Delete
			</button>
		</div>
	</div>
{/if}
