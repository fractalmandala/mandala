<script lang="ts">
	import { mediaAssetUrl } from '$lib/ipc';
	import { media } from '../state/media.svelte';
	let tagInput = $state('');
	let renameInput = $state('');
	let selected = $derived(media.selectedItems);
	let single = $derived(selected.length === 1 ? selected[0] : null);
	function addTag() { const tag = tagInput.trim(); if (!tag || !selected.length) return; void media.setTags(selected.map(item => item.id), [tag], []); tagInput = ''; }
</script>

<aside class="sidebar-carrier media-inspector"><div class="sidebar-content inspector">
	{#if single}
		<div class="media-inspector-preview">{#if single.kind === 'video'}<video controls src={mediaAssetUrl(single.relPath)}><track kind="captions" /></video>{:else}<img src={mediaAssetUrl(single.relPath)} alt={single.name} />{/if}</div>
		<form class="media-inspector-name" onsubmit={event => { event.preventDefault(); if (renameInput.trim()) void media.rename(single.relPath, renameInput.trim()); }}><input value={renameInput || single.name} onfocus={() => renameInput = single.name} oninput={event => renameInput = (event.target as HTMLInputElement).value} aria-label="Rename file" /></form>
		<dl class="media-facts"><div><dt>Kind</dt><dd>{single.kind}</dd></div><div><dt>Size</dt><dd>{Math.round(single.size / 1024)} KB</dd></div>{#if single.width}<div><dt>Dimensions</dt><dd>{single.width} × {single.height}</dd></div>{/if}{#if single.durationMs}<div><dt>Duration</dt><dd>{Math.round(single.durationMs / 1000)} sec</dd></div>{/if}<div><dt>Added</dt><dd>{new Date(single.addedMs).toLocaleDateString()}</dd></div></dl>
	{:else if selected.length}<h2>{selected.length} selected</h2><p>Add or remove tags and pin the whole selection together.</p>
	{:else}<h2>Nothing selected</h2><p>{media.visibleItems.length} items in this view.</p>{/if}
	{#if selected.length}<section class="media-inspector-tags"><div class="row xbetween"><h2>Tags</h2><button class="btn-text" onclick={() => void media.setPinned(selected.map(item => item.id), !selected.every(item => item.pinned))}>{selected.every(item => item.pinned) ? 'Unpin' : 'Pin'}</button></div><div class="media-tag-editor"><input bind:value={tagInput} list="media-all-tags" placeholder="Add tag…" onkeydown={event => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } }} /><button class="btn-app" onclick={addTag}>Add</button></div><datalist id="media-all-tags">{#each media.allTags as entry}<option value={entry.tag}></option>{/each}</datalist><div class="media-tag-list">{#each [...new Set(selected.flatMap(item => item.tags))] as tag}<button onclick={() => void media.setTags(selected.map(item => item.id), [], [tag])}>{tag} ×</button>{/each}</div></section>{/if}
</div></aside>
