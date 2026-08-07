<script lang="ts">
	import './apphealth.sass';
	import {
		EDGE_COLORS,
		EDGE_KINDS,
		GROUP_COLORS,
		computeLayout,
		validateScan,
		type LayoutEdge,
		type LayoutNode
	} from './graphLayout';
	import type { EdgeKind, ModuleFlowScan, ScanFlow } from './types';
	import { sampleScan } from './sampleScan';

	interface Props {
		/** Parsed scan3-<module>.json object. */
		scan?: ModuleFlowScan | null;
		/** URL to fetch the scan JSON from (used when `scan` is not given). */
		src?: string;
		/** Render the bundled sample scan when nothing else is provided. */
		showSample?: boolean;
	}

	let { scan = null, src = undefined, showSample = false }: Props = $props();

	let fetched = $state<ModuleFlowScan | null>(null);
	let loadError = $state<string | null>(null);

	let data = $derived(scan ?? fetched ?? (showSample ? sampleScan : null));
	let layout = $derived(data ? computeLayout(data) : null);
	let issues = $derived(data ? validateScan(data) : []);

	$effect(() => {
		if (scan || !src) return;
		let cancelled = false;
		loadError = null;
		fetch(src)
			.then(r => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.json();
			})
			.then((j: ModuleFlowScan) => {
				if (!cancelled) fetched = j;
			})
			.catch((e: unknown) => {
				if (!cancelled) loadError = e instanceof Error ? e.message : String(e);
			});
		return () => {
			cancelled = true;
		};
	});

	// ---------- interaction state ----------
	let hoveredId = $state<string | null>(null);
	let selectedId = $state<string | null>(null);
	let query = $state('');
	let offKinds = $state(new Set<EdgeKind>());
	let activeFlowId = $state<string | null>(null);
	let flowCursor = $state(0);
	let playing = $state(false);

	let activeFlow = $derived(data?.flows.find(f => f.id === activeFlowId) ?? null);
	let visibleSteps = $derived(activeFlow ? activeFlow.steps.slice(0, flowCursor) : []);
	let visibleStepOrder = $derived(new Map(visibleSteps.map((s, i) => [s, i + 1] as const)));
	let focusId = $derived(hoveredId ?? selectedId);

	let focusSet = $derived.by((): Set<string> | null => {
		if (!layout) return null;
		if (focusId) return new Set([focusId, ...(layout.adjacency.get(focusId) ?? [])]);
		if (activeFlow) return new Set(visibleSteps);
		const q = query.trim().toLowerCase();
		if (q)
			return new Set(
				layout.nodes
					.filter(
						n =>
							n.label.toLowerCase().includes(q) ||
							n.id.toLowerCase().includes(q) ||
							(n.path ?? '').toLowerCase().includes(q)
					)
					.map(n => n.id)
			);
		return null;
	});

	let flowPairs = $derived.by(() => {
		const pairs = new Set<string>();
		for (let i = 0; i < visibleSteps.length - 1; i++) {
			pairs.add(`${visibleSteps[i]}>${visibleSteps[i + 1]}`);
			pairs.add(`${visibleSteps[i + 1]}>${visibleSteps[i]}`);
		}
		return pairs;
	});

	let kindsPresent = $derived(
		layout ? EDGE_KINDS.filter(k => layout.edges.some(e => e.kind === k)) : []
	);
	let visibleEdges = $derived(layout ? layout.edges.filter(e => !offKinds.has(e.kind)) : []);
	let selectedNode = $derived(
		layout && selectedId ? (layout.nodesById.get(selectedId) ?? null) : null
	);
	let outEdges = $derived(layout && selectedId ? layout.edges.filter(e => e.from === selectedId) : []);
	let inEdges = $derived(layout && selectedId ? layout.edges.filter(e => e.to === selectedId) : []);

	// Reset view state whenever a new dataset arrives.
	$effect(() => {
		if (!data) return;
		selectedId = null;
		hoveredId = null;
		activeFlowId = null;
		flowCursor = 0;
		playing = false;
	});

	// ---------- pan & zoom ----------
	let viewportEl = $state<HTMLDivElement | null>(null);
	let vw = $state(0);
	let vh = $state(0);
	let view = $state({ x: 40, y: 32, k: 1 });
	let panning = $state(false);
	let panStart = { x: 0, y: 0, vx: 0, vy: 0 };
	let panMoved = false;

	function fit() {
		if (!layout || !vw || !vh) return;
		const k = Math.min((vw - 56) / layout.width, (vh - 56) / layout.height, 1.2);
		view = { k, x: (vw - layout.width * k) / 2, y: (vh - layout.height * k) / 2 };
	}

	let didFitFor: ModuleFlowScan | null = null;
	$effect(() => {
		if (data && vw > 0 && vh > 0 && didFitFor !== data) {
			didFitFor = data;
			fit();
		}
	});

	// Non-passive wheel zoom (Svelte makes `onwheel` passive by default).
	$effect(() => {
		const el = viewportEl;
		if (!el) return;
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const rect = el.getBoundingClientRect();
			const mx = e.clientX - rect.left;
			const my = e.clientY - rect.top;
			const k2 = Math.min(2.6, Math.max(0.22, view.k * Math.exp(-e.deltaY * 0.0012)));
			view = { k: k2, x: mx - (mx - view.x) * (k2 / view.k), y: my - (my - view.y) * (k2 / view.k) };
		};
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => el.removeEventListener('wheel', onWheel);
	});

	function zoomBy(f: number) {
		const cx = vw / 2;
		const cy = vh / 2;
		const k2 = Math.min(2.6, Math.max(0.22, view.k * f));
		view = { k: k2, x: cx - (cx - view.x) * (k2 / view.k), y: cy - (cy - view.y) * (k2 / view.k) };
	}

	function onPointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		const t = e.target as HTMLElement;
		if (t.closest('.ahs-node')) return;
		panning = true;
		panMoved = false;
		panStart = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
		viewportEl?.setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!panning) return;
		const dx = e.clientX - panStart.x;
		const dy = e.clientY - panStart.y;
		if (Math.abs(dx) + Math.abs(dy) > 4) panMoved = true;
		view = { ...view, x: panStart.vx + dx, y: panStart.vy + dy };
	}

	function onPointerUp() {
		if (!panning) return;
		panning = false;
		if (!panMoved) selectedId = null;
	}

	// ---------- selection & flows ----------
	function selectNode(id: string) {
		selectedId = selectedId === id ? null : id;
	}

	function selectFlow(f: ScanFlow) {
		if (activeFlowId === f.id) {
			activeFlowId = null;
			playing = false;
			return;
		}
		activeFlowId = f.id;
		flowCursor = f.steps.length;
		playing = false;
	}

	function togglePlay() {
		if (!activeFlow) return;
		if (playing) {
			playing = false;
			return;
		}
		if (flowCursor >= activeFlow.steps.length || flowCursor === 0) flowCursor = 1;
		playing = true;
	}

	$effect(() => {
		if (!playing || !activeFlow) return;
		const t = setInterval(() => {
			if (flowCursor >= activeFlow.steps.length) {
				playing = false;
				return;
			}
			flowCursor += 1;
		}, 850);
		return () => clearInterval(t);
	});

	function toggleKind(k: EdgeKind) {
		const next = new Set(offKinds);
		if (next.has(k)) next.delete(k);
		else next.add(k);
		offKinds = next;
	}

	function isFlowEdge(e: LayoutEdge) {
		return flowPairs.has(`${e.from}>${e.to}`);
	}

	function edgeClass(e: LayoutEdge): string {
		let c = 'ahs-edge';
		if (!focusSet) return c;
		const flow = isFlowEdge(e);
		const hot = focusId
			? e.from === focusId || e.to === focusId
			: activeFlow
				? flow
				: focusSet.has(e.from) && focusSet.has(e.to);
		if (hot) {
			c += ' hot';
			if (flow && !focusId) c += ' flow';
		} else c += ' dim';
		return c;
	}

	function nodeClass(n: LayoutNode): string {
		let c = 'ahs-node';
		if (selectedId === n.id) c += ' sel';
		if (focusSet && !focusSet.has(n.id)) c += ' dim';
		return c;
	}

	function labelOf(id: string): string {
		return layout?.nodesById.get(id)?.label ?? id;
	}
</script>

<div class="ahs">
	{#if layout && data}
		<header class="ahs-header">
			<div>
				<div class="ahs-title">
					{data.module.name} — module flow
					<span class="ahs-module-id">{data.module.id}</span>
				</div>
				{#if data.module.summary}<div class="ahs-sub">{data.module.summary}</div>{/if}
			</div>
			<div class="ahs-stats">
				<span class="ahs-chip"><b>{layout.nodes.length}</b>nodes</span>
				<span class="ahs-chip"><b>{layout.edges.length}</b>edges</span>
				<span class="ahs-chip"><b>{data.stats.ipcCalls}</b>ipc</span>
				<span class="ahs-chip"><b>{data.flows.length}</b>flows</span>
				{#if issues.length}
					<span class="ahs-issues" title={issues.slice(0, 6).join('\n')}
						>⚠ {issues.length} contract issue{issues.length === 1 ? '' : 's'}</span
					>
				{/if}
			</div>
		</header>

		<div class="ahs-toolbar">
			<input class="ahs-search" placeholder="Search nodes…" bind:value={query} />
			<div class="ahs-legend">
				{#each kindsPresent as k (k)}
					<button
						class="ahs-legend-item"
						class:off={offKinds.has(k)}
						onclick={() => toggleKind(k)}
						title="toggle {k} edges"
					>
						<span class="ahs-dot" style="background:{EDGE_COLORS[k]}"></span>{k}
					</button>
				{/each}
			</div>
			<div class="ahs-zoom">
				<button class="ahs-iconbtn" onclick={() => zoomBy(1 / 1.25)} title="Zoom out">−</button>
				<span class="ahs-zoom-label">{Math.round(view.k * 100)}%</span>
				<button class="ahs-iconbtn" onclick={() => zoomBy(1.25)} title="Zoom in">+</button>
				<button class="ahs-iconbtn" onclick={fit} title="Fit to view">⤢</button>
			</div>
		</div>

		{#if data.flows.length}
			<div class="ahs-flowbar">
				<span class="ahs-flowbar-label">Flows</span>
				{#each data.flows as f (f.id)}
					<button
						class="ahs-flow"
						class:active={activeFlowId === f.id}
						onclick={() => selectFlow(f)}
						title={f.trigger}
					>
						{f.name}
					</button>
				{/each}
				{#if activeFlow}
					<button
						class="ahs-iconbtn"
						class:active={playing}
						onclick={togglePlay}
						title={playing ? 'Pause' : 'Play'}
					>
						{playing ? '❚❚' : '▶'}
					</button>
					<span class="ahs-flow-meta"
						>{Math.min(flowCursor, activeFlow.steps.length)}/{activeFlow.steps.length} steps ·
						{activeFlow.trigger}</span
					>
				{/if}
			</div>
		{/if}

		<div class="ahs-main">
			<div
				class="ahs-viewport"
				class:panning
				bind:this={viewportEl}
				bind:clientWidth={vw}
				bind:clientHeight={vh}
				onpointerdown={onPointerDown}
				onpointermove={onPointerMove}
				onpointerup={onPointerUp}
				onpointercancel={onPointerUp}
				role="application"
				aria-label="Module flow graph"
			>
				<div
					class="ahs-canvas"
					style="width:{layout.width}px; height:{layout.height}px; transform: translate({view.x}px, {view.y}px) scale({view.k})"
				>
					<svg class="ahs-edges" width={layout.width} height={layout.height}>
						{#each visibleEdges as e, i (i)}
							<path class={edgeClass(e)} d={e.d} stroke={EDGE_COLORS[e.kind]} />
						{/each}
					</svg>
					{#each layout.columns as col (col.id)}
						<div class="ahs-col-label" style="left:{col.x}px; color:{col.color}">{col.label}</div>
					{/each}
					{#each layout.nodes as n (n.id)}
						<button
							class={nodeClass(n)}
							style="left:{n.x}px; top:{n.y}px; --gc:{GROUP_COLORS[n.group] ?? '#94a3b8'}"
							title={n.path ?? n.label}
							onpointerenter={() => (hoveredId = n.id)}
							onpointerleave={() => (hoveredId = null)}
							onclick={() => selectNode(n.id)}
						>
							<span class="ahs-node-label">{n.label}</span>
							<span class="ahs-node-kind">{n.kind}{n.loc ? ` · ${n.loc} loc` : ''}</span>
							{#if visibleStepOrder.has(n.id)}
								<span class="ahs-badge">{visibleStepOrder.get(n.id)}</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<aside class="ahs-side">
				{#if selectedNode}
					<button class="ahs-back" onclick={() => (selectedId = null)}>← Overview</button>
					<span
						class="ahs-kindchip"
						style="background:{GROUP_COLORS[selectedNode.group]}22; color:{GROUP_COLORS[
							selectedNode.group
						]}">{selectedNode.kind}</span
					>
					<div class="ahs-side-title">{selectedNode.label}</div>
					{#if selectedNode.summary}<div class="ahs-summary">{selectedNode.summary}</div>{/if}
					{#if selectedNode.path}<div class="ahs-path">{selectedNode.path}</div>{/if}
					<div class="ahs-kv">
						<div class="ahs-kv-item"><b>{selectedNode.degree}</b><span>links</span></div>
						<div class="ahs-kv-item"><b>{selectedNode.loc ?? '—'}</b><span>loc</span></div>
					</div>
					{#if selectedNode.tags?.length}
						<div class="ahs-stats" style="justify-content:flex-start; margin-bottom:10px">
							{#each selectedNode.tags as t (t)}<span class="ahs-chip">{t}</span>{/each}
						</div>
					{/if}
					<div class="ahs-section">Outgoing · {outEdges.length}</div>
					{#each outEdges as e, i (i)}
						<button class="ahs-edge-row" onclick={() => selectNode(e.to)}>
							<span class="ahs-edge-kind" style="color:{EDGE_COLORS[e.kind]}">{e.kind}</span>
							<span class="ahs-edge-target">{labelOf(e.to)}</span>
						</button>
					{:else}
						<div class="ahs-note-body">none</div>
					{/each}
					<div class="ahs-section">Incoming · {inEdges.length}</div>
					{#each inEdges as e, i (i)}
						<button class="ahs-edge-row" onclick={() => selectNode(e.from)}>
							<span class="ahs-edge-kind" style="color:{EDGE_COLORS[e.kind]}">{e.kind}</span>
							<span class="ahs-edge-target">{labelOf(e.from)}</span>
						</button>
					{:else}
						<div class="ahs-note-body">none</div>
					{/each}
				{:else}
					<div class="ahs-section">Module</div>
					<div class="ahs-side-title">{data.module.name}</div>
					{#if data.module.summary}<div class="ahs-summary">{data.module.summary}</div>{/if}
					<div class="ahs-path">{data.module.root}</div>
					<div class="ahs-kv">
						<div class="ahs-kv-item"><b>{data.stats.components}</b><span>components</span></div>
						<div class="ahs-kv-item"><b>{data.stats.stateFiles}</b><span>state</span></div>
						<div class="ahs-kv-item"><b>{data.stats.commands}</b><span>commands</span></div>
						<div class="ahs-kv-item"><b>{data.stats.ipcCalls}</b><span>ipc</span></div>
					</div>
					{#if data.flows.length}
						<div class="ahs-section">Flows</div>
						{#each data.flows as f (f.id)}
							<button
								class="ahs-flow-row"
								class:active={activeFlowId === f.id}
								onclick={() => selectFlow(f)}
							>
								<div class="ahs-flow-name">{f.name} · {f.steps.length} steps</div>
								<div class="ahs-flow-trigger">{f.trigger}</div>
							</button>
						{/each}
					{/if}
					{#if data.notes.length}
						<div class="ahs-section">Findings</div>
						{#each data.notes as note, i (i)}
							<div class="ahs-note {note.severity}">
								<div class="ahs-note-title">{note.title}</div>
								<div class="ahs-note-body">{note.body}</div>
							</div>
						{/each}
					{/if}
				{/if}
			</aside>
		</div>
	{:else}
		<div class="ahs-empty">
			<div class="ahs-empty-title">Module Flow Scan</div>
			<div class="ahs-empty-body">
				Pass a scan object via the <code>scan</code> prop or a URL via <code>src</code> — expecting
				<code>docs/context-temporary/scan3-&lt;module&gt;.json</code> (contract v1, scan
				"module-flow").
			</div>
			{#if loadError}<div class="ahs-error">Failed to load scan: {loadError}</div>{/if}
		</div>
	{/if}
</div>
