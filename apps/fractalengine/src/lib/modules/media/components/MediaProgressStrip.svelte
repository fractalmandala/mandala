<script lang="ts">
	import { media } from '../state/media.svelte';
	let progress = $derived(media.activeImport);
	let percent = $derived(progress && progress.total ? Math.round(progress.done / progress.total * 100) : 0);
</script>
<div class="media-strip">
	{#if progress}<div class="media-progress"><div class="media-progress-track"><span style:width={`${percent}%`}></span></div><span>{progress.done} / {progress.total} · {percent}%</span><span class="truncate">{progress.currentName}</span>{#if progress.skipped}<span>{progress.skipped} skipped</span>{/if}{#if !progress.finished}<button class="btn-text" onclick={() => void media.cancelImport(progress.importId)}>Cancel</button>{:else if progress.error}<span>{progress.error}</span>{/if}{#if media.imports.size > 1}<span>(+{media.imports.size - 1} more)</span>{/if}</div>
	{:else}<span class="media-strip-idle">{media.visibleItems.length} items</span>{/if}
</div>
