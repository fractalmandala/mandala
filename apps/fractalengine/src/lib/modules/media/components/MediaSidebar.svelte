<script lang="ts">
	import type { MediaFolder } from '../types';
	import { media } from '../state/media.svelte';
	let showTags = $state(true);
	let expanded = $state<Set<string>>(new Set(['']));
	function chooseFolder(path: string) { void media.selectScope({ type: 'folder', path }); }
	function toggle(path: string) { const next = new Set(expanded); next.has(path) ? next.delete(path) : next.add(path); expanded = next; }
	function createFolder(parent: string) { const name = prompt('Folder name'); if (name?.trim()) void media.createFolder(parent, name.trim()); }
</script>

<aside class="sidebar-carrier media-sidebar"><div class="sidebar-content">
	<div class="media-sidebar-heading">Library</div>
	<nav class="media-smart-sections" aria-label="Media smart sections">
		<button class:active={media.activeScope.type === 'section' && media.activeScope.section === 'all'} onclick={() => void media.selectScope({ type: 'section', section: 'all' })}>All Items</button>
		<button class:active={media.activeScope.type === 'section' && media.activeScope.section === 'recent'} onclick={() => void media.selectScope({ type: 'section', section: 'recent' })}>Recently Added</button>
		<button class:active={media.activeScope.type === 'section' && media.activeScope.section === 'untagged'} onclick={() => void media.selectScope({ type: 'section', section: 'untagged' })}>Untagged</button>
		<button class:active={media.activeScope.type === 'section' && media.activeScope.section === 'pinned'} onclick={() => void media.selectScope({ type: 'section', section: 'pinned' })}>Pinned</button>
		<button aria-expanded={showTags} onclick={() => showTags = !showTags}>All Tags</button>
		{#if showTags}<div class="media-tags-list">{#each media.allTags as entry (entry.tag)}<button class:active={media.activeScope.type === 'tag' && media.activeScope.tag === entry.tag} onclick={() => void media.selectScope({ type: 'tag', tag: entry.tag })}>{entry.tag}<span>{entry.count}</span></button>{/each}</div>{/if}
	</nav>
	<div class="media-tree-head"><span>Folders</span><button class="btn-text" onclick={() => createFolder('')} aria-label="New folder">+</button></div>
	<div class="media-folder-tree">{#snippet folderNode(folder: MediaFolder, depth = 0)}
			<div class="media-folder-row" role="group" data-media-folder={folder.path} style:padding-left={`calc(var(--sz-8) + ${depth} * var(--sz-16))`} ondragover={event => event.preventDefault()} ondrop={event => { event.preventDefault(); const paths = event.dataTransfer?.getData('application/x-fractal-media-paths').split('\n').filter(Boolean) ?? []; if (paths.length) void media.move(paths, folder.path); }}>
			<button class="media-folder-toggle" onclick={() => toggle(folder.path)} aria-label={`Toggle ${folder.name}`}>{folder.children.length ? (expanded.has(folder.path) ? '⌄' : '›') : '·'}</button>
				<button class:active={media.activeScope.type === 'folder' && media.activeScope.path === folder.path} class="media-folder-name" ondblclick={() => { if (!folder.path) return; const name = prompt('Rename folder', folder.name); if (name?.trim()) void media.rename(folder.path, name.trim()); }} onclick={() => chooseFolder(folder.path)} oncontextmenu={event => { event.preventDefault(); const action = prompt('Folder action: new, rename, move, or trash', 'new'); if (action === 'new') createFolder(folder.path); if (action === 'rename' && folder.path) { const name = prompt('Rename folder', folder.name); if (name?.trim()) void media.rename(folder.path, name.trim()); } if (action === 'trash' && folder.path && confirm('Moves to Trash — cannot be undone from the app.')) void media.trash([folder.path]); }}>{folder.name}<span>{folder.mediaCount}</span></button>
		</div>
		{#if expanded.has(folder.path)}{#each folder.children as child (child.path)}{@render folderNode(child, depth + 1)}{/each}{/if}
	{/snippet}{@render folderNode(media.tree)}</div>
</div></aside>
