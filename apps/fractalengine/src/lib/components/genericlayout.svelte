<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";
	import { dev } from '$lib/modules/dev/state/dev.svelte'
	import { layout } from '$lib/modules/dev/state/developer.svelte'

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
				<Pane order={0} defaultSize={20} minSize={10} maxSize={30} collapsible onCollapse={() => (layout.sidebar1Collapsed = true)} onExpand={() => (layout.sidebar1Collapsed = false)}>
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
				<Pane order={3} defaultSize={15} minSize={14} maxSize={40} collapsible onCollapse={() => (layout.sidebar2Collapsed = true)} onExpand={() => (layout.sidebar2Collapsed = false)}>
					<aside class="module-sidebar">

					</aside>
				</Pane>
		</PaneGroup>
	</div>
</div>
