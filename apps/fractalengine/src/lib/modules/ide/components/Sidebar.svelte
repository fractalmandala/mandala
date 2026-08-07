<script lang="ts">
	import { ideState } from '$lib/state/ide.svelte';
	import TreeNode from './TreeNode.svelte';
	import AIChat from '$lib/components/AIChat.svelte';
	import ModelMarketplace from '$lib/components/ModelMarketplace.svelte';
	import SkillsMarketplace from '$lib/components/SkillsMarketplace.svelte';

	interface Props {
		side: 'sidebar1' | 'sidebar2';
	}

	let { side }: Props = $props();

	// Derived states
	let rootPath = $derived(ideState.rootPath);
	let fileEntries = $derived(ideState.fileEntries);
</script>

<aside class="sidebar-carrier box h100 side-{'sidebar1'}">
	{#if side === 'sidebar1'}
		<div class="sidebar-content box">
				<!-- Workspace root label -->
				<div class="sidebar-header row gap4">
					<img src="/icons/icon-workspace.svg" alt="Folder" class="icon-svg" />
					<span class="text-header truncate" title={rootPath}>{rootPath.split('/').pop() || 'Workspace'}</span>
				</div>
				<div class="sidebar-content-box">
					{#if fileEntries.length === 0}
						<div class="empty-state pad16"><span class="text-item">No files in directory</span></div>
					{:else}
						<TreeNode entries={fileEntries} depth={0} />
					{/if}
				</div>
		</div>
	{:else}
		<div class="sidebar-content">
			<AIChat />
		</div>
	{/if}
</aside>
