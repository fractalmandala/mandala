<script lang="ts">
	import { Pane, PaneGroup, PaneResizer } from 'paneforge';
	import CanvasUnit from '$lib/modules/newdesign/components/CanvasUnit.svelte';
	import Unit from '$lib/modules/newdesign/components/unit.svelte';
	import { newdesign } from '$lib/modules/newdesign/state/newdesign.svelte';
	import { layout } from '$lib/state/layoutstate.svelte';

	let paneGroup = $state<any>(null);
	let sidebarExpandedSize = $state(20);
	let inspectorExpandedSize = $state(20);
	let viewportEl = $state<HTMLDivElement | null>(null);

	function handleLayoutChange(sizes: number[]) {
		if (sizes[0] > 0 && !layout.sidebar1Collapsed) sidebarExpandedSize = sizes[0];
		if (sizes[2] > 0 && !layout.sidebar2Collapsed) inspectorExpandedSize = sizes[2];
	}

	$effect(() => {
		if (!paneGroup) return;
		const sidebarSize = layout.sidebar1Collapsed ? 0 : sidebarExpandedSize;
		const inspectorSize = layout.sidebar2Collapsed ? 0 : inspectorExpandedSize;
		paneGroup.setLayout([sidebarSize, 100 - sidebarSize - inspectorSize, inspectorSize]);
	});

	function dropUnit(point: { clientX: number; clientY: number }) {
		const rect = viewportEl?.getBoundingClientRect();
		if (!rect || point.clientX < rect.left || point.clientX > rect.right || point.clientY < rect.top || point.clientY > rect.bottom) return;
		newdesign.add(point.clientX - rect.left - 120, point.clientY - rect.top - 72);
	}

	function clearSelection(event: PointerEvent) {
		if (event.target === event.currentTarget) newdesign.select(null);
	}
</script>

<div class="module-wrapper paneforge-container newdesign-module">
	<div class="inside-module-wrapper paneforge-container">
		<PaneGroup bind:this={paneGroup} direction="horizontal" autoSaveId="newdesign-horizontal" onLayoutChange={handleLayoutChange}>
			<Pane order={0} defaultSize={18} minSize={18} maxSize={30} collapsible onCollapse={() => (layout.sidebar1Collapsed = true)} onExpand={() => (layout.sidebar1Collapsed = false)}>
				<aside class="module-sidebar newdesign-sidebar">
					<div class="sidebar-carrier newdesign-left">
						<div class="newdesign-sidebar-heading">
							<span class="text-header">CANVAS UNIT</span>
							<span class="text-item-sm muted">Drag onto the blank canvas</span>
						</div>
						<Unit ondrop={dropUnit} />
					</div>
				</aside>
			</Pane>
			{#if !layout.sidebar1Collapsed}<PaneResizer class="resize-handle-horizontal" />{/if}
			<Pane order={2} defaultSize={64} minSize={64} maxSize={100}>
				<main class="module-central">
					<div class="central-carrier newdesign-central">
						<div bind:this={viewportEl} class="newdesign-viewport" role="application" onpointerdown={clearSelection}>
							<div class="newdesign-canvas-grid" aria-hidden="true"></div>
							{#each newdesign.items as unit (unit.id)}
								<CanvasUnit {unit} selected={newdesign.selectedId === unit.id} />
							{/each}
						</div>
					</div>
				</main>
			</Pane>
			{#if !layout.sidebar2Collapsed}<PaneResizer class="resize-handle-horizontal" />{/if}
			<Pane order={3} defaultSize={18} minSize={18} maxSize={30} collapsible onCollapse={() => (layout.sidebar2Collapsed = true)} onExpand={() => (layout.sidebar2Collapsed = false)}>
				<aside class="module-sidebar newdesign-sidebar"><div class="sidebar-carrier newdesign-right"></div></aside>
			</Pane>
		</PaneGroup>
	</div>
</div>