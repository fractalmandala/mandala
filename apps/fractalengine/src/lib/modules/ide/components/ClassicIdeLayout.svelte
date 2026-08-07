<script lang="ts">
	import WorkspaceShell from '$lib/components/shell/WorkspaceShell.svelte';
	import { ideState } from '$lib/state/ide.svelte';
	import Sidebar from './Sidebar.svelte';
	import Editor from './Editor.svelte';
	import Terminal from './Terminal.svelte';
	import BrowserLauncherCard from '$lib/modules/browser/components/BrowserLauncherCard.svelte';

	let activeDragOver = $state<'left' | 'right' | 'bottom' | null>(null);
	function handleDragOver(event: DragEvent, zone: 'left' | 'right' | 'bottom'): void { event.preventDefault(); activeDragOver = zone; }
	function handleDragLeave(): void { activeDragOver = null; }
	function handleDrop(event: DragEvent, zone: 'left' | 'right' | 'bottom'): void { event.preventDefault(); activeDragOver = null; ideState.setTerminalLocation(zone); }
</script>

<WorkspaceShell profile="code">
	{#snippet left()}
		<Sidebar side="sidebar1" />
		{#if activeDragOver === 'left'}<div class="drop-overlay box ycenter xcenter"><span class="text-xs pad8 text-center">Dock Terminal Left</span></div>{/if}
		{#if ideState.terminalLocation === 'left' && !ideState.terminalCollapsed}<div class="sidebar-terminal-divider"></div><Terminal />{/if}
	{/snippet}
	{#snippet center()}
		<div class="ide-center-editor-region">
			<Editor />
		</div>
		{#if ideState.terminalLocation === 'bottom' && !ideState.terminalCollapsed}
			<div
				class="middle-bottom-terminal-zone {activeDragOver === 'bottom' ? 'drag-target-highlight' : ''}"
				style:height={`${ideState.terminalHeight}px`}
				ondragover={(event) => handleDragOver(event, 'bottom')}
				ondragleave={handleDragLeave}
				ondrop={(event) => handleDrop(event, 'bottom')}
				role="region"
				aria-label="Bottom terminal docking zone"
			>
				<Terminal />
			</div>
		{/if}
	{/snippet}
	{#snippet right()}
		<Sidebar side="sidebar2" />
		{#if activeDragOver === 'right'}<div class="drop-overlay box ycenter xcenter"><span class="text-xs pad8 text-center">Dock Terminal Right</span></div>{/if}
		{#if ideState.terminalLocation === 'right' && !ideState.terminalCollapsed}<div class="sidebar-terminal-divider"></div><Terminal />{/if}
		{#if !ideState.browserCollapsed}<div class="browser-zone-container" role="region" aria-label="In-App Browser Panel"><BrowserLauncherCard onClose={() => ideState.toggleBrowser()} /></div>{/if}
	{/snippet}
</WorkspaceShell>
