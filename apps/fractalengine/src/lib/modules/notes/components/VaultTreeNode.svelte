<script lang="ts">
	import { notes } from '$lib/modules/notes/state/notes.svelte';
	import type { FileEntry } from '$lib/ipc';
	import VaultTreeNode from './VaultTreeNode.svelte';

	interface Props {
		entries: FileEntry[];   // immediate children (caller filters out non-dirs)
		depth?: number;
	}

	let { entries, depth = 0 }: Props = $props();

	function handleToggle(path: string) {
		notes.toggleVaultFolderExpanded(path);
	}

	function handleSelect(path: string) {
		notes.selectVaultFolder(path);
	}

	function handleToggleAndSelect(path:string) {
		notes.toggleVaultFolderExpanded(path);
		notes.selectVaultFolder(path);
	}

	function handleChevronKey(e: KeyboardEvent, path: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleToggle(path);
		}
	}
</script>

{#each entries as entry (entry.path)}
	{@const expanded = notes.vaultExpandedFolders.includes(entry.path)}
	{@const selected = notes.vaultSelectedFolderPath === entry.path}
	<div class="tree-row row" style="padding-left: {depth * 8 + 4}px">
	<button class="tree-folder-btn {selected ? 'is-active' : ''}" onclick={() => handleToggleAndSelect(entry.path)}>
			<img src="/iconset/folder.svg" alt="" class="icon-svg-sm" />
			<span class="text-item truncate">{entry.name}</span>
	</button>
	</div>
	{#if expanded}
		{@const cached = notes.vaultExpandedFolderPaths[entry.path]}
		{#if cached}
			{@const childDirs = cached.filter(e => e.isDir)}
			{#if childDirs.length > 0}
				<VaultTreeNode entries={childDirs} depth={depth + 1} />
			{/if}
		{:else}
			<div class="tree-row tree-loading" style="padding-left: {depth * 16 + 28}px">
				<span class="text-item">Loading…</span>
			</div>
		{/if}
	{/if}
{/each}
