<script lang="ts">
	import type { MediaKind, MediaSort } from '../types';
	import { media } from '../state/media.svelte';
	const kinds: MediaKind[] = ['image', 'video', 'gif'];
	const sorts: MediaSort[] = ['name', 'added', 'modified', 'size', 'kind'];
	function toggleKind(kind: MediaKind) { media.setKinds(media.kindFilters.includes(kind) ? media.kindFilters.filter(item => item !== kind) : [...media.kindFilters, kind]); }
</script>

<div class="media-header">
	<input class="media-search" value={media.search} oninput={event => media.setSearch((event.target as HTMLInputElement).value)} placeholder="Search files and tags…" aria-label="Search media" />
	<div class="media-toolbar-row">
		<div class="media-filter-chips">{#each kinds as kind}<button class:active={media.kindFilters.includes(kind)} onclick={() => toggleKind(kind)}>{kind}</button>{/each}</div>
		<select aria-label="Sort media" value={media.sort} onchange={event => media.setSort((event.target as HTMLSelectElement).value as MediaSort)}>{#each sorts as sort}<option value={sort}>Sort: {sort}</option>{/each}</select>
		<button class="btn-text" onclick={() => media.setDescending(!media.descending)} aria-label="Toggle sort direction">{media.descending ? '↓' : '↑'}</button>
		<label class="media-thumb-control">Size <input type="range" min="96" max="320" step="8" value={media.thumbSize} oninput={event => media.setThumbSize(Number((event.target as HTMLInputElement).value))} /></label>
	</div>
</div>
