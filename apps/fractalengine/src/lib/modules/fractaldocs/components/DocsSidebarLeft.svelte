<script lang="ts">
	import { docsState, type DocsFileEntry } from '../state/docs.svelte';

	const ROOT = '__fractaldocs_root__';
	let expandedByParent = $state<Record<string, string>>({});

	function isExpanded(path: string, parentPath: string): boolean {
		return expandedByParent[parentPath] === path;
	}

	function toggleFolder(path: string, parentPath: string): void {
		expandedByParent = {
			...expandedByParent,
			[parentPath]: isExpanded(path, parentPath) ? '' : path,
		};
	}
</script>

{#snippet fileNode(entry: DocsFileEntry, parentPath: string)}
	{#if entry.isDir}
		<div class="fractaldocs-tree-folder">
			<button
				type="button"
				class="fractaldocs-tree-folder-btn"
				aria-expanded={isExpanded(entry.path, parentPath)}
				onclick={() => toggleFolder(entry.path, parentPath)}
			>
				<img class="fractaldocs-tree-icon" src={isExpanded(entry.path, parentPath) ? '/icontheme-allicon/chevron-down.svg' : '/icontheme-allicon/chevron-right.svg'} alt="" aria-hidden="true" />
				<span class="fractaldocs-tree-name">{entry.title || entry.name}</span>
			</button>
			{#if isExpanded(entry.path, parentPath) && entry.children}
				<div class="fractaldocs-tree-children">
					{#each entry.children as child}
						{@render fileNode(child, entry.path)}
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<button
			type="button"
			class="fractaldocs-tree-file {docsState.activeFilePath === entry.path ? 'active' : ''}" 
			aria-current={docsState.activeFilePath === entry.path ? 'page' : undefined}
			onclick={() => docsState.loadFile(entry.path)}
		>
			<img class="fractaldocs-tree-icon" src="/iconset/documentation.svg" alt="" aria-hidden="true" />
			<span class="fractaldocs-tree-name">{entry.title || entry.name}</span>
		</button>
	{/if}
{/snippet}

<div class="fractaldocs-sidebar-left">
	<div class="fractaldocs-sidebar-header">
		<span class="text-header col2">FractalDocs</span>
	</div>
	<div class="fractaldocs-tree">
		{#if docsState.fileTree.length === 0}
			<div class="fractaldocs-tree-empty">No documentation found.</div>
		{:else}
			{#each docsState.fileTree as entry}
				{@render fileNode(entry, ROOT)}
			{/each}
		{/if}
	</div>
</div>
