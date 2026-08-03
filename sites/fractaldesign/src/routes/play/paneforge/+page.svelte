<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import { sample } from '$lib/states/samplestate.svelte';
	import '$lib/styles/playground/index-play-paneforge.sass'

	let paneGroupTwo = $state<any>(null);

	// sizes = [sidebar, canvas, tray, rightbar] — paneforge's layout array
	function handleLayoutChange(sizes: number[]) {
		if (sizes[0] > 0) sample.sidebarExpanded = sizes[0];
		if (sizes[2] > 0) sample.trayExpanded = sizes[2];
		if (sizes[3] > 0) sample.rightbarExpanded = sizes[3];

		if ((sizes[0] === 0) !== sample.sidebarCollapsed) {
			sample.setCollapsed('sidebar', sizes[0] === 0);
		}
		if ((sizes[2] === 0) !== sample.trayCollapsed) {
			sample.setCollapsed('tray', sizes[2] === 0);
		}
		if ((sizes[3] === 0) !== sample.rightbarCollapsed) {
			sample.setCollapsed('rightbar', sizes[3] === 0);
		}
	}

	$effect(() => {
		if (!paneGroupTwo) return;
		const sidebarSize = sample.sidebarCollapsed ? 0 : sample.sidebarExpanded;
		const traySize = sample.trayCollapsed ? 0 : sample.trayExpanded;
		const rightbarSize = sample.rightbarCollapsed ? 0 : sample.rightbarExpanded;
		const canvasSize = 100 - sidebarSize - traySize - rightbarSize;
		paneGroupTwo.setLayout([ sidebarSize, canvasSize, traySize, rightbarSize ]);
	});
</script>

<div class="playground">
	<div class="paneforge-sample-container">
		<PaneGroup bind:this={paneGroupTwo} onLayoutChange={handleLayoutChange} direction="horizontal">
			<Pane
				order={1}
				collapsible
				collapsedSize={0}
				defaultSize={20}
				minSize={10}
				maxSize={25}
				onCollapse={() => sample.setCollapsed('sidebar', true)}
				onExpand={() => sample.setCollapsed('sidebar', false)}
			>
				<div class="sidebar">Sample Sidebar | Collapsible</div>
			</Pane>
			<PaneResizer class="sample-resizer" />
			<Pane order={2} defaultSize={45} minSize={45} maxSize={90}>
				<div class="main-area box gap16">
					<span>Main Area</span>
					<div class="row gap8">
					<button class="primary-btn" onclick={() => sample.toggleSidebar()}>
						Sidebar {sample.sidebarCollapsed ? 'Show' : 'Hide'}
					</button>
					<button class="primary-btn" onclick={() => sample.toggleTray()}>
						Tray {sample.trayCollapsed ? 'Show' : 'Hide'}
					</button>
					<button class="primary-btn" onclick={() => sample.toggleRightbar()}>
						Rightbar {sample.rightbarCollapsed ? 'Show' : 'Hide'}
					</button>
					</div>
					<p>
						Read <a href="/posts/draggable-collapsible">usage guide</a> to implement this in Sveltekit yourself.
					</p>
				</div>
			</Pane>
			<PaneResizer class="sample-resizer" />
			<Pane
				order={3}
				collapsible
				collapsedSize={0}
				defaultSize={15}
				minSize={5}
				maxSize={35}
				onCollapse={() => sample.setCollapsed('tray', true)}
				onExpand={() => sample.setCollapsed('tray', false)}
			>
				<div class="tray"><span>Tray</span></div>
			</Pane>
			<PaneResizer class="sample-resizer" />
			<Pane
				order={4}
				collapsible
				collapsedSize={0}
				defaultSize={20}
				minSize={10}
				maxSize={50}
				onCollapse={() => sample.setCollapsed('rightbar', true)}
				onExpand={() => sample.setCollapsed('rightbar', false)}
			>
				<div class="rightbar"><span>Rightbar</span></div>
			</Pane>
		</PaneGroup>
	</div>
</div>
