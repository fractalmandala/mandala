<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import Graph from 'graphology';
	import type Sigma from 'sigma';

	type RawNode = {
		id: string;
		label?: string;
		norm_label?: string;
		file_type?: string;
		source_file?: string;
		community?: number;
		[key: string]: unknown;
	};
	type RawLink = {
		source: string;
		target: string;
		relation?: string;
		weight?: number;
		[key: string]: unknown;
	};
	type RawGraph = {
		nodes: RawNode[];
		links: RawLink[];
	};

	type NeighborInfo = {
		id: string;
		label: string;
		relation: string;
		direction: 'out' | 'in';
	};

	type SelectedNode = {
		id: string;
		label: string;
		fileType: string;
		sourceFile: string;
		community: number | undefined;
		degree: number;
		neighbors: NeighborInfo[];
	};

	type CommunityLegendEntry = {
		community: number;
		color: string;
		count: number;
		sampleLabel: string;
	};

	let { src }: { src: string } = $props();

	let container: HTMLDivElement;
	let sigmaInstance: Sigma | null = null;
	let graph: Graph | null = null;

	let loading = $state(true);
	let error = $state('');
	let nodeCount = $state(0);
	let edgeCount = $state(0);

	let hoveredNodeId: string | null = $state(null);
	let selectedNode: SelectedNode | null = $state(null);
	let legend: CommunityLegendEntry[] = $state([]);
	let focusedCommunity: number | null = $state(null);

	let searchTerm = $state('');
	let searchResults: { id: string; label: string }[] = $state([]);

	const COMMUNITY_COLORS = [
		'#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
		'#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
		'#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
		'#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
	];

	function colorForCommunity(community: number | undefined): string {
		if (community === undefined) return '#999999';
		return COMMUNITY_COLORS[community % COMMUNITY_COLORS.length];
	}

	function buildNeighborInfo(g: Graph, nodeId: string): NeighborInfo[] {
		const neighbors: NeighborInfo[] = [];
		g.forEachEdge(nodeId, (_edge, attrs, source, target) => {
			const otherId = source === nodeId ? target : source;
			neighbors.push({
				id: otherId,
				label: g.getNodeAttribute(otherId, 'label'),
				relation: (attrs.relation as string) || 'related',
				direction: source === nodeId ? 'out' : 'in'
			});
		});
		return neighbors.sort((a, b) => a.label.localeCompare(b.label));
	}

	function selectNode(nodeId: string) {
		if (!graph) return;
		selectedNode = {
			id: nodeId,
			label: graph.getNodeAttribute(nodeId, 'label'),
			fileType: graph.getNodeAttribute(nodeId, 'fileType') || 'unknown',
			sourceFile: graph.getNodeAttribute(nodeId, 'sourceFile') || '',
			community: graph.getNodeAttribute(nodeId, 'community'),
			degree: graph.degree(nodeId),
			neighbors: buildNeighborInfo(graph, nodeId)
		};
		sigmaInstance?.refresh();
		focusCamera(nodeId);
	}

	function focusCamera(nodeId: string) {
		if (!graph || !sigmaInstance) return;
		const attrs = graph.getNodeAttributes(nodeId);
		sigmaInstance.getCamera().animate({ x: attrs.x, y: attrs.y, ratio: 0.15 }, { duration: 400 });
	}

	function clearSelection() {
		selectedNode = null;
		sigmaInstance?.refresh();
	}

	function toggleCommunityFocus(community: number) {
		focusedCommunity = focusedCommunity === community ? null : community;
		sigmaInstance?.refresh();
	}

	function runSearch() {
		if (!graph || !searchTerm.trim()) {
			searchResults = [];
			return;
		}
		const term = searchTerm.trim().toLowerCase();
		const matches: { id: string; label: string }[] = [];
		graph.forEachNode((id, attrs) => {
			if (matches.length >= 8) return;
			const label = (attrs.label as string) || '';
			if (label.toLowerCase().includes(term)) {
				matches.push({ id, label });
			}
		});
		searchResults = matches;
	}

	function goToSearchResult(id: string) {
		selectNode(id);
		searchResults = [];
		searchTerm = '';
	}

	function zoomBy(factor: number) {
		sigmaInstance?.getCamera().animatedZoom({ duration: 200, factor });
	}

	function resetCamera() {
		sigmaInstance?.getCamera().animatedReset({ duration: 300 });
	}

	onMount(async () => {
		if (!browser) return;
		try {
			const [{ default: SigmaCtor }, { default: forceAtlas2 }] = await Promise.all([
				import('sigma'),
				import('graphology-layout-forceatlas2')
			]);

			const res = await fetch(src);
			if (!res.ok) throw new Error(`Failed to fetch graph data: ${res.status}`);
			const data: RawGraph = await res.json();

			const g = new Graph({ multi: true });

			for (const node of data.nodes) {
				if (g.hasNode(node.id)) continue;
				g.addNode(node.id, {
					label: node.norm_label || node.label || node.id,
					fileType: node.file_type,
					sourceFile: node.source_file,
					community: node.community,
					color: colorForCommunity(node.community),
					size: 2,
					x: Math.random(),
					y: Math.random()
				});
			}

			const degree: Record<string, number> = {};
			for (const link of data.links) {
				if (!g.hasNode(link.source) || !g.hasNode(link.target)) continue;
				degree[link.source] = (degree[link.source] || 0) + 1;
				degree[link.target] = (degree[link.target] || 0) + 1;
				g.addEdge(link.source, link.target, {
					relation: link.relation,
					weight: link.weight ?? 1,
					size: 0.3,
					color: '#d8d8d8'
				});
			}

			g.forEachNode((id) => {
				const d = degree[id] || 0;
				g.setNodeAttribute(id, 'size', 2 + Math.min(Math.sqrt(d), 12));
			});

			forceAtlas2.assign(g, {
				iterations: 100,
				settings: forceAtlas2.inferSettings(g)
			});

			graph = g;
			nodeCount = g.order;
			edgeCount = g.size;

			const communityStats = new Map<number, { count: number; sampleLabel: string }>();
			g.forEachNode((_id, attrs) => {
				const c = attrs.community as number | undefined;
				if (c === undefined) return;
				const existing = communityStats.get(c);
				if (existing) {
					existing.count += 1;
				} else {
					communityStats.set(c, { count: 1, sampleLabel: attrs.label });
				}
			});
			legend = Array.from(communityStats.entries())
				.map(([community, stat]) => ({
					community,
					color: colorForCommunity(community),
					count: stat.count,
					sampleLabel: stat.sampleLabel
				}))
				.sort((a, b) => b.count - a.count)
				.slice(0, 16);

			sigmaInstance = new SigmaCtor(g, container, {
				renderEdgeLabels: false,
				defaultEdgeColor: '#d8d8d8',
				labelRenderedSizeThreshold: 6,
				nodeReducer: (node, attrs) => {
					const res = { ...attrs };
					const isSelected = selectedNode?.id === node;
					const isHovered = hoveredNodeId === node;
					const isNeighborOfSelected =
						selectedNode && graph ? graph.areNeighbors(selectedNode.id, node) : false;
					const isNeighborOfHovered =
						hoveredNodeId && graph ? graph.areNeighbors(hoveredNodeId, node) : false;

					if (focusedCommunity !== null && attrs.community !== focusedCommunity) {
						res.color = '#3a3a3a';
						res.label = '';
						res.zIndex = 0;
						return res;
					}

					if (selectedNode || hoveredNodeId) {
						const isRelevant =
							isSelected || isHovered || isNeighborOfSelected || isNeighborOfHovered;
						if (!isRelevant) {
							res.color = '#3a3a3a';
							res.label = '';
							res.zIndex = 0;
							return res;
						}
						res.zIndex = 1;
						res.highlighted = isSelected || isHovered;
					}
					return res;
				},
				edgeReducer: (edge, attrs) => {
					const res = { ...attrs };
					if (!graph) return res;
					const [source, target] = graph.extremities(edge);
					const focusId = selectedNode?.id || hoveredNodeId;
					if (focusedCommunity !== null) {
						const sourceCommunity = graph.getNodeAttribute(source, 'community');
						const targetCommunity = graph.getNodeAttribute(target, 'community');
						if (sourceCommunity !== focusedCommunity && targetCommunity !== focusedCommunity) {
							res.hidden = true;
							return res;
						}
					}
					if (focusId) {
						if (source !== focusId && target !== focusId) {
							res.hidden = true;
							return res;
						}
						res.color = '#999999';
					}
					return res;
				}
			});

			sigmaInstance.on('enterNode', ({ node }) => {
				hoveredNodeId = node;
				sigmaInstance?.refresh();
			});
			sigmaInstance.on('leaveNode', () => {
				hoveredNodeId = null;
				sigmaInstance?.refresh();
			});
			sigmaInstance.on('clickNode', ({ node }) => {
				selectNode(node);
			});
			sigmaInstance.on('clickStage', () => {
				clearSelection();
			});

			loading = false;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to render graph';
			loading = false;
		}
	});

	onDestroy(() => {
		sigmaInstance?.kill();
	});
</script>

<div class="graph-viewer">
	{#if loading}
		<div class="status">Loading graph…</div>
	{:else if error}
		<div class="status error">{error}</div>
	{/if}

	<div class="canvas" bind:this={container}></div>

	{#if !loading && !error}
		<div class="toolbar">
			<div class="search-box">
				<input
					type="text"
					placeholder="Search nodes…"
					bind:value={searchTerm}
					oninput={runSearch}
				/>
				{#if searchResults.length > 0}
					<ul class="search-results">
						{#each searchResults as result}
							<li>
								<button type="button" onclick={() => goToSearchResult(result.id)}>
									{result.label}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			<div class="zoom-controls">
				<button type="button" onclick={() => zoomBy(1.4)} aria-label="Zoom in">+</button>
				<button type="button" onclick={() => zoomBy(0.7)} aria-label="Zoom out">−</button>
				<button type="button" onclick={resetCamera} aria-label="Reset view">⟲</button>
			</div>
		</div>

		<div class="meta">
			<span>{nodeCount.toLocaleString()} nodes</span>
			<span>{edgeCount.toLocaleString()} edges</span>
		</div>

		<div class="legend">
			<div class="legend-title">Communities {focusedCommunity !== null ? '(click again to clear)' : '(click to isolate)'}</div>
			<ul>
				{#each legend as entry}
					<li class:active={focusedCommunity === entry.community}>
						<button type="button" onclick={() => toggleCommunityFocus(entry.community)}>
							<span class="swatch" style="background:{entry.color}"></span>
							<span class="legend-label" title={entry.sampleLabel}>{entry.sampleLabel}</span>
							<span class="legend-count">{entry.count}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>

		{#if selectedNode}
			<div class="info-panel">
				<div class="info-header">
					<h3>{selectedNode.label}</h3>
					<button type="button" class="close-btn" onclick={clearSelection} aria-label="Close">×</button>
				</div>
				<dl>
					<dt>Type</dt>
					<dd>{selectedNode.fileType}</dd>
					{#if selectedNode.sourceFile}
						<dt>Source</dt>
						<dd class="source-file">{selectedNode.sourceFile}</dd>
					{/if}
					<dt>Community</dt>
					<dd>{selectedNode.community ?? 'none'}</dd>
					<dt>Connections</dt>
					<dd>{selectedNode.degree}</dd>
				</dl>
				{#if selectedNode.neighbors.length > 0}
					<div class="neighbors">
						<div class="neighbors-title">Connected nodes</div>
						<ul>
							{#each selectedNode.neighbors as neighbor}
								<li>
									<button type="button" onclick={() => selectNode(neighbor.id)}>
										<span class="direction">{neighbor.direction === 'out' ? '→' : '←'}</span>
										<span class="relation">{neighbor.relation}</span>
										<span class="neighbor-label">{neighbor.label}</span>
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style lang="sass">
.graph-viewer
	position: relative
	width: 100%
	height: 80vh
	min-height: 480px
	background: #111111
	border-radius: var(--size8)
	overflow: hidden

.canvas
	width: 100%
	height: 100%

.status
	position: absolute
	top: 50%
	left: 50%
	transform: translate(-50%, -50%)
	font-size: var(--text-sm)
	color: var(--text-muted)
	z-index: 3

	&.error
		color: var(--feedback-error)

.toolbar
	position: absolute
	top: var(--size16)
	left: var(--size16)
	display: flex
	gap: var(--size8)
	align-items: flex-start
	z-index: 2

.search-box
	position: relative

	input
		width: 220px
		padding: 6px 10px
		border-radius: var(--size4)
		border: 1px solid #333
		background: rgba(0, 0, 0, 0.7)
		color: #fff
		font-size: var(--text-sm)

		&::placeholder
			color: var(--text-muted)

.search-results
	position: absolute
	top: calc(100% + 4px)
	left: 0
	width: 100%
	max-height: 220px
	overflow-y: auto
	background: rgba(20, 20, 20, 0.95)
	border: 1px solid #333
	border-radius: var(--size4)
	list-style: none
	margin: 0
	padding: var(--size4)

	li button
		display: block
		width: 100%
		text-align: left
		padding: 6px 8px
		background: none
		border: none
		color: #eee
		font-size: var(--text-sm)
		cursor: pointer
		border-radius: var(--size4)

		&:hover
			background: rgba(255, 255, 255, 0.1)

.zoom-controls
	display: flex
	flex-direction: column
	gap: var(--size4)

	button
		width: 28px
		height: 28px
		border-radius: var(--size4)
		border: 1px solid #333
		background: rgba(0, 0, 0, 0.7)
		color: #fff
		cursor: pointer
		font-size: var(--text-md)

		&:hover
			background: rgba(255, 255, 255, 0.1)

.meta
	position: absolute
	bottom: var(--size16)
	left: var(--size16)
	display: flex
	gap: var(--size8)
	font-size: var(--text-xs)
	color: var(--text-muted)
	background: rgba(0, 0, 0, 0.7)
	padding: 4px 8px
	border-radius: var(--size4)
	z-index: 2

.legend
	position: absolute
	top: var(--size16)
	right: var(--size16)
	width: 220px
	max-height: 60vh
	overflow-y: auto
	background: rgba(0, 0, 0, 0.7)
	border-radius: var(--size4)
	padding: var(--size8)
	z-index: 2
	font-size: var(--text-xs)

.legend-title
	color: var(--text-muted)
	margin-bottom: var(--size4)
	text-transform: uppercase
	letter-spacing: 0.02rem

.legend ul
	list-style: none
	margin: 0
	padding: 0
	display: flex
	flex-direction: column
	gap: 2px

.legend li button
	display: flex
	align-items: center
	gap: var(--size4)
	width: 100%
	padding: 3px 4px
	border-radius: var(--size4)
	cursor: pointer
	color: #ddd
	background: none
	border: none
	font-size: inherit
	text-align: left

	&:hover
		background: rgba(255, 255, 255, 0.08)

.legend li.active button
	background: rgba(255, 255, 255, 0.18)

.swatch
	width: 10px
	height: 10px
	border-radius: 50%
	flex-shrink: 0

.legend-label
	flex: 1
	white-space: nowrap
	overflow: hidden
	text-overflow: ellipsis

.legend-count
	color: var(--text-muted)

.info-panel
	position: absolute
	bottom: var(--size16)
	right: var(--size16)
	width: 280px
	max-height: 60vh
	overflow-y: auto
	background: rgba(15, 15, 15, 0.92)
	border: 1px solid #333
	border-radius: var(--size8)
	padding: var(--size16)
	z-index: 3
	color: #eee

.info-header
	display: flex
	justify-content: space-between
	align-items: flex-start
	gap: var(--size8)
	margin-bottom: var(--size8)

	h3
		font-size: var(--text-md)
		margin: 0
		word-break: break-word

.close-btn
	background: none
	border: none
	color: var(--text-muted)
	font-size: var(--text-lg)
	cursor: pointer
	line-height: 1

	&:hover
		color: #fff

dl
	display: grid
	grid-template-columns: auto 1fr
	gap: 4px var(--size8)
	margin: 0 0 var(--size8) 0
	font-size: var(--text-xs)

dt
	color: var(--text-muted)

dd
	margin: 0
	word-break: break-word

	&.source-file
		font-family: var(--font-mono)
		font-size: var(--text-xs)
		color: #aaa

.neighbors-title
	color: var(--text-muted)
	font-size: var(--text-xs)
	text-transform: uppercase
	letter-spacing: 0.02rem
	margin-bottom: var(--size4)
	border-top: 1px solid #333
	padding-top: var(--size8)

.neighbors ul
	list-style: none
	margin: 0
	padding: 0
	display: flex
	flex-direction: column
	gap: 2px

.neighbors li button
	display: flex
	align-items: baseline
	gap: 6px
	width: 100%
	text-align: left
	background: none
	border: none
	color: #ddd
	padding: 4px
	border-radius: var(--size4)
	cursor: pointer
	font-size: var(--text-xs)

	&:hover
		background: rgba(255, 255, 255, 0.08)

.direction
	color: var(--theme-color)
	flex-shrink: 0

.relation
	color: var(--text-muted)
	flex-shrink: 0

.neighbor-label
	overflow: hidden
	text-overflow: ellipsis
	white-space: nowrap
</style>
