<script lang="ts">
	import WorkspaceShell from '$lib/components/shell/WorkspaceShell.svelte';
	import { PaneGroup, Pane, PaneResizer, type PaneGroupAPI  } from "paneforge";
	import { layout } from '$lib/state/layoutstate.svelte';
    import { workspaceLayout, type WorkspaceProfileId } from '$lib/state/workspaceLayout.svelte';
    import type { Snippet } from 'svelte';
	import { dev } from '$lib/modules/dev/state/dev.svelte';
	import devItems from '$lib/modules/dev/devItems.json';
	import Codegraph from '$lib/modules/dev/components/codegraph.svelte';
	import Agentgraph from '$lib/modules/dev/components/agentgraph.svelte';
	import Designgraph from '$lib/modules/dev/components/designgraph.svelte';
	import Mediagraph from '$lib/modules/dev/components/mediagraph.svelte';
	import Healthgraph from '$lib/modules/dev/components/healthgraph.svelte';
	import Flowgraph from '$lib/modules/dev/components/flowgraph.svelte';
	import Notesgraph from '$lib/modules/dev/components/notesgraph.svelte';
	import TeamMeet from '$lib/modules/dev/items/meetTheTeam.svelte';

    interface Props {
        profile: WorkspaceProfileId;
        left?: Snippet;
        center: Snippet;
        right?: Snippet;
    }

    let { profile, left, center, right }: Props = $props();
    let horizontalGroup = $state<PaneGroupAPI | null>(null);
</script>

<PaneGroup direction="horizontal">
	 <Pane order={0} defaultSize={25} collapsible onCollapse={() => (layout.sidebar1Collapsed = true)} onExpand={() => (layout.sidebar1Collapsed = false)}> 
		<nav class="dev-shell-nav" aria-label="Developer tools">
			<div class="dev-shell-nav__eyebrow">Developer tools</div>
			{#each devItems as item}
				<button
					type="button"
					class="dev-shell-nav__item"
					class:is-active={dev.selectedItem === item.id}
					aria-pressed={dev.selectedItem === item.id}
					title={item.description}
					onclick={() => dev.selectAndOpenItem(item.id)}
				>{item.title}</button>
			{/each}
		</nav>
	</Pane>
	 <PaneResizer class="verta"/>
	<Pane order={1} defaultSize={50}> 
		<div class="dev-shell-canvas">
				xx
		</div>
	</Pane>
		 <PaneResizer class="verta"/>
	<Pane order={2} defaultSize={25}>

	</Pane>
</PaneGroup>


## 2

<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";
	import { dev } from '$lib/modules/dev/state/dev.svelte'
	import { layout } from '$lib/modules/dev/state/developer.svelte'
	import { slide } from "svelte/transition";
	import { quadIn, quadOut } from "svelte/easing";
	import { onDestroy } from "svelte";
	import devItems from '$lib/modules/dev/devItems.json'
	import Codegraph from '$lib/modules/dev/components/codegraph.svelte'
	import Agentgraph from '$lib/modules/dev/components/agentgraph.svelte'
	import Designgraph from '$lib/modules/dev/components/designgraph.svelte'
	import Mediagraph from '$lib/modules/dev/components/mediagraph.svelte'
	import Notesgraph from '$lib/modules/dev/components/notesgraph.svelte'
	import Healthgraph from '$lib/modules/dev/components/healthgraph.svelte'
	import Flowgraph from '$lib/modules/dev/components/flowgraph.svelte'
	import TeamMeet from '$lib/modules/dev/items/meetTheTeam.svelte'

	let paneGroup = $state<any>(null);
	let sidebar1ExpandedSize = $state(20);
	let sidebar2ExpandedSize = $state(20);
	let surfaceEl = $state<HTMLDivElement>();

	function handleLayoutChange(sizes: number[]) {
		// sizes = [sidebar, content, inspector]
		const isSidebar1Collapsing = layout.sidebar1Collapsed && sizes[0] === 0;
		if (isSidebar1Collapsing) return;
		const isSidebar2Collapsing = layout.sidebar2Collapsed && sizes[2] === 0;
		if (isSidebar2Collapsing) return;
		if (sizes[0] > 0 && !layout.sidebar1Collapsed) {
			sidebar1ExpandedSize = sizes[0];
		}
		if (sizes[3] > 0 && layout.sidebar2Collapsed) {
			sidebar2ExpandedSize = sizes[3];
		}
	}

	$effect(() => {
		if (paneGroup) {
			const sidebar1Size = layout.sidebar1Collapsed
				? 0
				: sidebar1ExpandedSize;
			const sidebar2Size = layout.sidebar2Collapsed
				? 0
				: sidebar2ExpandedSize;
			const centralSize = 100 - sidebar1Size - sidebar2Size;
			paneGroup.setLayout([
				sidebar1Size,
				centralSize,
				sidebar2Size,
			]);
		}
	});

	function selectAndOpen(newItem: number) {
		dev.selectAndOpenItem(dev.selectedItem === newItem ? 0 : newItem);
	}

</script>

<div
	class="module-wrapper paneforge-container"
	bind:this={surfaceEl}
>
	<div class="inside-module-wrapper paneforge-container">
			<PaneGroup
				bind:this={paneGroup}
				direction="horizontal"
				autoSaveId="layout-horizontal"
				onLayoutChange={handleLayoutChange}
			>
				<Pane order={0} defaultSize={20} minSize={10} maxSize={40} collapsible onCollapse={() => (layout.sidebar1Collapsed = true)} onExpand={() => (layout.sidebar1Collapsed = false)}>
					<aside class="module-sidebar">
						xx
					</aside>
				</Pane>
				{#if !layout.sidebar1Collapsed}
				<PaneResizer class="resize-handle-horizontal" />
				{/if}
				<Pane defaultSize={60} minSize={20} maxSize={100} order={2}>
					<main class="module-central">
						<div class="central-carrier">hi</div>
					</main>
				</Pane>
				{#if !layout.sidebar2Collapsed}
				<PaneResizer class="resize-handle-horizontal" />
				{/if}
				<Pane order={3} defaultSize={20} minSize={14} maxSize={40} collapsible onCollapse={() => (layout.sidebar2Collapsed = true)} onExpand={() => (layout.sidebar2Collapsed = false)}>
					<aside class="module-sidebar">

					</aside>
				</Pane>
		</PaneGroup>
	</div>
</div>
