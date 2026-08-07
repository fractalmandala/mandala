<script lang="ts">
	import { Pane, PaneGroup, PaneResizer, type PaneGroupAPI } from 'paneforge';
	import type { Snippet } from 'svelte';
	import { workspaceLayout, type WorkspaceProfileId, type WorkspaceSurfaceId } from '$lib/state/workspaceLayout.svelte';

	interface Props {
		profile: WorkspaceProfileId;
		left?: Snippet;
		leftSecondary?: Snippet;
		center: Snippet;
		right?: Snippet;
	}

	let { profile, left, leftSecondary, center, right }: Props = $props();
	let paneGroup = $state<PaneGroupAPI | null>(null);
	let isResizing = $state(false);

	function visibleSurfaceSize(surface: WorkspaceSurfaceId): number {
		return workspaceLayout.isCollapsed(profile, surface) ? 0 : workspaceLayout.size(profile, surface);
	}

	function syncLayout(): void {
		if (!paneGroup || isResizing) return;
		const leftSize = left ? visibleSurfaceSize('left') : 0;
		const rightSize = right ? visibleSurfaceSize('right') : 0;
		if (leftSecondary) {
			const leftSecondarySize = visibleSurfaceSize('leftSecondary');
			paneGroup.setLayout([leftSize, leftSecondarySize, Math.max(8, 100 - leftSize - leftSecondarySize - rightSize), rightSize]);
			return;
		}
		paneGroup.setLayout([leftSize, Math.max(8, 100 - leftSize - rightSize), rightSize]);
	}

	function handleLayoutChange(sizes: number[]): void {
		if (leftSecondary) {
			workspaceLayout.syncSurfaceSizes(profile, {
				...(left ? { left: sizes[0] } : {}),
				leftSecondary: sizes[1],
				...(right ? { right: sizes[3] } : {})
			});
			return;
		}
		workspaceLayout.syncSurfaceSizes(profile, {
			...(left ? { left: sizes[0] } : {}),
			...(right ? { right: sizes[2] } : {})
		});
	}

	function handleDraggingChange(nextIsResizing: boolean): void {
		if (nextIsResizing) {
			isResizing = true;
			workspaceLayout.beginGesture(profile);
			return;
		}
		isResizing = false;
		workspaceLayout.endGesture(profile);
	}

	$effect(() => {
		workspaceLayout.profiles;
		profile;
		isResizing;
		syncLayout();
	});
</script>

<div class="workspace-shell">
	{#if leftSecondary}
		<PaneGroup bind:this={paneGroup} direction="horizontal" onLayoutChange={handleLayoutChange}>
			<Pane order={0} defaultSize={left ? workspaceLayout.size(profile, 'left') : 0} minSize={8} collapsible collapsedSize={0} onCollapse={() => workspaceLayout.setCollapsed(profile, 'left', true)} onExpand={() => workspaceLayout.setCollapsed(profile, 'left', false)}>
				<div class="workspace-shell__surface workspace-shell__surface--left">{@render left?.()}</div>
			</Pane>
			{#if left && !workspaceLayout.isCollapsed(profile, 'left')}<PaneResizer onDraggingChange={handleDraggingChange} />{/if}
			<Pane order={1} defaultSize={workspaceLayout.size(profile, 'leftSecondary')} minSize={8} collapsible collapsedSize={0} onCollapse={() => workspaceLayout.setCollapsed(profile, 'leftSecondary', true)} onExpand={() => workspaceLayout.setCollapsed(profile, 'leftSecondary', false)}>
				<div class="workspace-shell__surface workspace-shell__surface--left-secondary">{@render leftSecondary()}</div>
			</Pane>
			{#if !workspaceLayout.isCollapsed(profile, 'leftSecondary')}<PaneResizer onDraggingChange={handleDraggingChange} />{/if}
			<Pane order={2} minSize={8}>
				<div class="workspace-shell__center">{@render center()}</div>
			</Pane>
			{#if right && !workspaceLayout.isCollapsed(profile, 'right')}<PaneResizer onDraggingChange={handleDraggingChange} />{/if}
			<Pane order={3} defaultSize={right ? workspaceLayout.size(profile, 'right') : 0} minSize={8} collapsible collapsedSize={0} onCollapse={() => workspaceLayout.setCollapsed(profile, 'right', true)} onExpand={() => workspaceLayout.setCollapsed(profile, 'right', false)}>
				<div class="workspace-shell__surface workspace-shell__surface--right">{@render right?.()}</div>
			</Pane>
		</PaneGroup>
	{:else}
		<PaneGroup bind:this={paneGroup} direction="horizontal" onLayoutChange={handleLayoutChange}>
			<Pane order={0} defaultSize={left ? workspaceLayout.size(profile, 'left') : 0} minSize={8} collapsible collapsedSize={0} onCollapse={() => workspaceLayout.setCollapsed(profile, 'left', true)} onExpand={() => workspaceLayout.setCollapsed(profile, 'left', false)}>
				<div class="workspace-shell__surface workspace-shell__surface--left">{@render left?.()}</div>
			</Pane>
			{#if left && !workspaceLayout.isCollapsed(profile, 'left')}<PaneResizer onDraggingChange={handleDraggingChange} />{/if}
			<Pane order={1} minSize={8}>
				<div class="workspace-shell__center">{@render center()}</div>
			</Pane>
			{#if right && !workspaceLayout.isCollapsed(profile, 'right')}<PaneResizer onDraggingChange={handleDraggingChange} />{/if}
			<Pane order={2} defaultSize={right ? workspaceLayout.size(profile, 'right') : 0} minSize={8} collapsible collapsedSize={0} onCollapse={() => workspaceLayout.setCollapsed(profile, 'right', true)} onExpand={() => workspaceLayout.setCollapsed(profile, 'right', false)}>
				<div class="workspace-shell__surface workspace-shell__surface--right">{@render right?.()}</div>
			</Pane>
		</PaneGroup>
	{/if}
</div>
