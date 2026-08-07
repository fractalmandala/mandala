<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";
	import { dev } from '$lib/modules/dev/state/dev.svelte'
	import devItems from '$lib/modules/dev/devItems.json'
	import Codegraph from '$lib/modules/dev/components/codegraph.svelte'
	import Agentgraph from '$lib/modules/dev/components/agentgraph.svelte'
	import Designgraph from '$lib/modules/dev/components/designgraph.svelte'
	import Mediagraph from '$lib/modules/dev/components/mediagraph.svelte'
	import Healthgraph from '$lib/modules/dev/components/healthgraph.svelte'
	import Flowgraph from '$lib/modules/dev/components/flowgraph.svelte'
	import Notesgraph from '$lib/modules/dev/components/notesgraph.svelte'
	import TeamMeet from '$lib/modules/dev/items/meetTheTeam.svelte'

	let paneGroup = $state<any>(null);
	let sidebar1ExpandedSize = $state(20);
	let sidebar2ExpandedSize = $state(20);
	let surfaceEl = $state<HTMLDivElement>();
	let graphInspectorHost = $state<HTMLDivElement>();
	let paneOne = $state<Pane>(null!);
	let paneTwo = $state<Pane>(null!);
	let selectedItem = $derived(devItems.find((item) => item.id === dev.selectedItem));

	function handleLayoutChange(sizes: number[]) {
		// sizes = [sidebar, content, inspector]
		const isSidebar1Collapsing = dev.sidebar1Collapsed && sizes[0] === 0;
		if (isSidebar1Collapsing) return;
		const isSidebar2Collapsing = dev.sidebar2Collapsed && sizes[2] === 0;
		if (isSidebar2Collapsing) return;
		if (sizes[0] > 0 && !dev.sidebar1Collapsed) {
			sidebar1ExpandedSize = sizes[0];
		}
		if (sizes[2] > 0 && !dev.sidebar2Collapsed) {
			sidebar2ExpandedSize = sizes[2];
		}
	}

	$effect(() => {
		if (paneGroup) {
			const sidebar1Size = dev.sidebar1Collapsed
				? 0
				: sidebar1ExpandedSize;
			const sidebar2Size = dev.sidebar2Collapsed
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

</script>

<div
	class="module-wrapper paneforge-container"
	bind:this={surfaceEl}
>
	<div class="inside-module-wrapper">
			<PaneGroup bind:this={paneGroup} direction="horizontal" onLayoutChange={handleLayoutChange}>
				<Pane bind:this={paneOne} order={0} defaultSize={20} minSize={10} maxSize={40} collapsible onCollapse={() => dev.setCollapsed('sidebar1', true)} onExpand={() => dev.setCollapsed('sidebar1', false)}>
					<aside class="module-sidebar w100 h100">
						<div class="sidebar-carrier h100 pad16">
							<div class="sidebar-header">
								<div class="tabsrow">
									<button class="btn">x</button>
								</div>
							</div>
							<div class="sidebar-content-box">
							<div class="sidebar-section gap8 box w100 dev-left truncate">
								{#each devItems as item}
									<button
										type="button"
										class="sidebar-btn-std w100"
										class:active={dev.selectedItem === item.id}
										aria-pressed={dev.selectedItem === item.id}
										title={item.description}
									>
										{item.title}
									</button>
								{/each}
							</div>
							</div>
						</div>
					</aside>
				</Pane>
				{#if !dev.sidebar1Collapsed}
				<PaneResizer class="resize-handle-horizontal" />
				{/if}
				<Pane defaultSize={60} minSize={20} maxSize={100} order={2}>
					<main class="module-central">
						<div class="central-carrier">
							{#if dev.selectedItem === 1}
								<Codegraph activated inspectorHost={graphInspectorHost} />
							{:else if dev.selectedItem === 2}
								<Agentgraph activated inspectorHost={graphInspectorHost} />
							{:else if dev.selectedItem === 3}
								<Designgraph activated inspectorHost={graphInspectorHost} />
							{:else if dev.selectedItem === 4}
								<Mediagraph activated inspectorHost={graphInspectorHost} />
							{:else if dev.selectedItem === 5}
								<Healthgraph activated />
							{:else if dev.selectedItem === 6}
								<Flowgraph activated />
							{:else if dev.selectedItem === 7}
								<Notesgraph activated />
							{:else if dev.selectedItem === 8}
								<TeamMeet activated />
							{/if}
						</div>
					</main>
				</Pane>
				{#if !dev.sidebar2Collapsed}
				<PaneResizer class="resize-handle-horizontal" />
				{/if}
				<Pane bind:this={paneTwo} order={3} defaultSize={20} minSize={14} maxSize={40} collapsible onCollapse={() => dev.setCollapsed('sidebar2', true)} onExpand={() => dev.setCollapsed('sidebar2', false)}>
					<aside class="module-sidebar dev-right">
						{#if selectedItem?.type === 'graph'}
							<div class="graph-inspector-host" bind:this={graphInspectorHost}></div>
						{/if}
					</aside>
				</Pane>
		</PaneGroup>
	</div>
</div>
