<script lang="ts">
	import { notes } from "$lib/modules/notes/state/notes.svelte";
	import VaultTreeNode from "./VaultTreeNode.svelte";
</script>

<div class="sidebar-carrier">
	<div class="sidebar-content">
	{#each notes.currentVaultRoots as root (root.path)}
		{@const cached = notes.currentVaultTrees[root.path]}
		{#if cached}
			{@const childDirs = cached.filter((e) => e.isDir)}
			<VaultTreeNode entries={childDirs} depth={0} />
		{:else}
			<div
				class="vault-tree-row vault-tree-loading notes-vault-root"
			>
				<img
					src="/iconset/folder.svg"
					alt=""
					class="icon-svg-sm vault-tree-folder-icon"
				/>
				<span class="vault-tree-folder-name">{root.label}</span>
			</div>
		{/if}
	{:else}
		<div class="vault-tree-empty">Open a vault to browse folders.</div>
	{/each}
	</div>
</div>
