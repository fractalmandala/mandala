<script lang="ts">
	import { Pane, PaneGroup, PaneResizer } from 'paneforge';
	import StudioApp from '$lib/components/StudioApp.svelte';
	import type { Snippet } from 'svelte';
	import { layout } from '$lib/layoutstate.svelte';
	import { PanelLeft, PanelRight } from '@lucide/svelte';
	import MediaBank from './MediaBank.svelte';
	import Recorder from './Recorder.svelte';
	import YouTubeChannelViewer from './YouTubeChannelViewer.svelte';
	import ProjectStudio from './ProjectStudio.svelte';
	import SettingsPanel from './SettingsPanel.svelte';
	import CommandPalette, { type CommandItem } from './CommandPalette.svelte';

	interface Props {
		sidebarLeft?: Snippet;
		central?: Snippet;
		sidebarRight?: Snippet;
	}

	let { sidebarLeft, central, sidebarRight }: Props = $props();

	let paneGroup = $state<any>(null);

	let sidebarLeftExpanded = $state(20);
	let sidebarRightExpanded = $state(20);
	let viewportEl = $state<HTMLDivElement | null>(null);

	function handleLayoutChange(sizes: number[]) {
		if (sizes[0] > 0 && !layout.sidebar1Collapsed) sidebarLeftExpanded = sizes[0];
		if (sizes[2] > 0 && !layout.sidebar2Collapsed) sidebarRightExpanded = sizes[2];
	}

	$effect(() => {
		if (!paneGroup) return;
		const sidebar1W = layout.sidebar1Collapsed ? 0 : sidebarLeftExpanded;
		const sidebar2W = layout.sidebar2Collapsed ? 0 : sidebarRightExpanded;
		paneGroup.setLayout([sidebar1W, 100 - sidebar1W - sidebar2W, sidebar2W]);
	});
</script>

<div class="app-wrapper">
	<div class="module-wrapper paneforge-container">
		<div class="inside-module-wrapper paneforge-container">
			<PaneGroup
				bind:this={paneGroup}
				direction="horizontal"
				autoSaveId="shradhapp"
				onLayoutChange={handleLayoutChange}>
				<Pane
					order={0}
					defaultSize={20}
					minSize={10}
					maxSize={50}
					collapsible
					onCollapse={() => (layout.sidebar1Collapsed = true)}
					onExpand={() => (layout.sidebar1Collapsed = false)}>
					<aside class="module-sidebar sidebar-left sidebar1"></aside>
				</Pane>
				{#if !layout.sidebar1Collapsed}<PaneResizer class="resize-handle-horizontal" />{/if}
				<Pane order={1} defaultSize={60} minSize={40} maxSize={100}>
					<main class="module-central"></main>
				</Pane>
				{#if !layout.sidebar2Collapsed}<PaneResizer class="resize-handle-horizontal" />{/if}
				<Pane
					order={3}
					defaultSize={20}
					minSize={10}
					maxSize={50}
					collapsible
					onCollapse={() => (layout.sidebar2Collapsed = true)}
					onExpand={() => (layout.sidebar2Collapsed = false)}>
					<aside class="module-sidebar sidebar-right sidebar2"></aside>
				</Pane>
			</PaneGroup>
		</div>
	</div>
</div>
