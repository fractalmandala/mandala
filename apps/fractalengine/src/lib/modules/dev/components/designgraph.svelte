<script lang="ts">
	import { onDestroy } from 'svelte';
	import PlusIcon from '$lib/icons/plus.svelte'
	import MinusIcon from '$lib/icons/minus.svelte'
	import ExpandIcon from '$lib/icons/expand.svelte'
	import { mountIn } from '$lib/actions/mountIn';

	const DEFAULT_DATA = {
	"version": 1,
	"scan": "module-flow",
	"project": {
		"name": "FractalEngine Studio",
		"slug": "fractalengine",
		"date": "2026-07-18"
	},
	"module": {
		"id": "design",
		"name": "fractalDesign",
		"entryLayout": "src/lib/modules/designer/components/DesignLayout.svelte",
		"root": "src/lib/modules/designer",
		"summary": "Figma-like vector graphics and UI design canvas, rendering recursive scene-graphs.",
		"externalModules": []
	},
	"stats": {
		"nodes": 24,
		"edges": 38,
		"components": 5,
		"stateFiles": 2,
		"commands": 9,
		"ipcCalls": 0,
		"flows": 7
	},
	"groups": [
		{
			"id": "layout",
			"label": "Layout"
		},
		{
			"id": "components",
			"label": "Components"
		},
		{
			"id": "state",
			"label": "State"
		},
		{
			"id": "commands",
			"label": "Commands & Palette"
		},
		{
			"id": "ipc",
			"label": "IPC / Backend"
		},
		{
			"id": "shared",
			"label": "Shared Components"
		},
		{
			"id": "external",
			"label": "Other Modules"
		}
	],
	"nodes": [
		{
			"id": "cmp:DesignLayout",
			"label": "DesignLayout.svelte",
			"kind": "layout",
			"group": "layout",
			"path": "src/lib/modules/designer/components/DesignLayout.svelte",
			"loc": 1330,
			"summary": "Entry workspace canvas layout coordinating viewports, libraries, layers, and inspectors.",
			"tags": [
				"entry"
			]
		},
		{
			"id": "cmp:Layers",
			"label": "Layers.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/designer/components/Layers.svelte",
			"loc": 358,
			"summary": "Nested layer outline panel with drag-to-reorder, grouping, and context actions."
		},
		{
			"id": "cmp:ComponentLibrary",
			"label": "ComponentLibrary.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/designer/components/ComponentLibrary.svelte",
			"loc": 403,
			"summary": "Library panel for primitives, user-saved component subtrees, and templates."
		},
		{
			"id": "cmp:DesignBlock",
			"label": "DesignBlock.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/designer/components/DesignBlock.svelte",
			"loc": 456,
			"summary": "Recursive canvas node rendering shapes, text, vectors, frames, and resize handles."
		},
		{
			"id": "cmp:DesignInspector",
			"label": "DesignInspector.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/designer/components/DesignInspector.svelte",
			"loc": 1814,
			"summary": "Figma-style sidebar inspector for editing properties, fills, strokes, and layouts."
		},
		{
			"id": "cmp:ExportPanel",
			"label": "ExportPanel.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/designer/components/ExportPanel.svelte",
			"loc": 306,
			"summary": "Code generator panel converting canvas subtrees into HTML, CSS, Svelte, or SASS."
		},
		{
			"id": "state:designState",
			"label": "design.svelte.ts",
			"kind": "state",
			"group": "state",
			"path": "src/lib/modules/designer/state/design.svelte.ts",
			"loc": 132,
			"summary": "Layout state manager for sidebar collapsed/expanded widths and panel histories.",
			"tags": [
				"singleton"
			]
		},
		{
			"id": "state:designcanvas",
			"label": "designcanvas.svelte.ts",
			"kind": "state",
			"group": "state",
			"path": "src/lib/modules/designer/state/designcanvas.svelte.ts",
			"loc": 4018,
			"summary": "Core scene graph, managing block items, selection, clipboard, and undo/redo.",
			"tags": [
				"singleton"
			]
		},
		{
			"id": "fn:CanvasViewport",
			"label": "CanvasViewport.svelte.ts",
			"kind": "function",
			"group": "components",
			"path": "src/lib/modules/designer/engine/CanvasViewport.svelte.ts",
			"loc": 250,
			"summary": "Manages designer canvas coordinates, bounds, zoom actions, and panning state."
		},
		{
			"id": "fn:DragEngine",
			"label": "DragEngine.svelte.ts",
			"kind": "function",
			"group": "components",
			"path": "src/lib/modules/designer/engine/DragEngine.svelte.ts",
			"loc": 200,
			"summary": "Tracks dragging operations, snapping constraints, and delta transformations."
		},
		{
			"id": "fn:ResizeEngine",
			"label": "ResizeEngine.svelte.ts",
			"kind": "function",
			"group": "components",
			"path": "src/lib/modules/designer/engine/ResizeEngine.svelte.ts",
			"loc": 200,
			"summary": "Handles bounding box resizing calculations from multiple handle directions."
		},
		{
			"id": "fn:RotateEngine",
			"label": "RotateEngine.svelte.ts",
			"kind": "function",
			"group": "components",
			"path": "src/lib/modules/designer/engine/RotateEngine.svelte.ts",
			"loc": 100,
			"summary": "Calculates rotations, snap angles, and transform origin positions."
		},
		{
			"id": "fn:SelectionEngine",
			"label": "SelectionEngine.svelte.ts",
			"kind": "function",
			"group": "components",
			"path": "src/lib/modules/designer/engine/SelectionEngine.svelte.ts",
			"loc": 180,
			"summary": "Manages pointer selection box marquee and multiselect intersection logic."
		},
		{
			"id": "fn:codegen",
			"label": "codegen.ts",
			"kind": "function",
			"group": "components",
			"path": "src/lib/modules/designer/engine/codegen.ts",
			"loc": 400,
			"summary": "Generates HTML, CSS, SASS, or Svelte components from design subtrees."
		},
		{
			"id": "shared:AIChat",
			"label": "AIChat.svelte",
			"kind": "shared",
			"group": "shared"
		},
		{
			"id": "cmd:designer.toggleLayersSidebar",
			"label": "designer.toggleLayersSidebar",
			"kind": "command",
			"group": "commands"
		},
		{
			"id": "cmd:designer.toggleAiSidebar",
			"label": "designer.toggleAiSidebar",
			"kind": "command",
			"group": "commands"
		},
		{
			"id": "cmd:designer.resetScene",
			"label": "designer.resetScene",
			"kind": "command",
			"group": "commands"
		},
		{
			"id": "cmd:designer.centerCanvas",
			"label": "designer.centerCanvas",
			"kind": "command",
			"group": "commands"
		},
		{
			"id": "cmd:designer.zoom100",
			"label": "designer.zoom100",
			"kind": "command",
			"group": "commands",
			"tags": [
				"Cmd+0"
			]
		},
		{
			"id": "cmd:designer.zoomFit",
			"label": "designer.zoomFit",
			"kind": "command",
			"group": "commands",
			"tags": [
				"Cmd+1"
			]
		},
		{
			"id": "cmd:designer.zoomSelection",
			"label": "designer.zoomSelection",
			"kind": "command",
			"group": "commands",
			"tags": [
				"Cmd+2"
			]
		},
		{
			"id": "cmd:designer.zoomIn",
			"label": "designer.zoomIn",
			"kind": "command",
			"group": "commands",
			"tags": [
				"Cmd+="
			]
		},
		{
			"id": "cmd:designer.zoomOut",
			"label": "designer.zoomOut",
			"kind": "command",
			"group": "commands",
			"tags": [
				"Cmd+-"
			]
		}
	],
	"edges": [
		{
			"from": "cmp:DesignLayout",
			"to": "cmp:Layers",
			"kind": "renders"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "cmp:ComponentLibrary",
			"kind": "renders"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "cmp:DesignBlock",
			"kind": "renders"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "cmp:DesignInspector",
			"kind": "renders"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "cmp:ExportPanel",
			"kind": "renders"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "shared:AIChat",
			"kind": "renders"
		},
		{
			"from": "cmp:DesignBlock",
			"to": "cmp:DesignBlock",
			"kind": "renders"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "state:designState",
			"kind": "reads",
			"label": "ratios and panel collapsing states"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "state:designcanvas",
			"kind": "reads",
			"label": "block items, active guides, selected ids, viewport coordinates"
		},
		{
			"from": "cmp:Layers",
			"to": "state:designcanvas",
			"kind": "reads",
			"label": "block items, active selections"
		},
		{
			"from": "cmp:ComponentLibrary",
			"to": "state:designcanvas",
			"kind": "reads",
			"label": "items, userComponents"
		},
		{
			"from": "cmp:DesignBlock",
			"to": "state:designcanvas",
			"kind": "reads",
			"label": "editing text block status"
		},
		{
			"from": "cmp:DesignInspector",
			"to": "state:designcanvas",
			"kind": "reads",
			"label": "block style, fonts, typography details"
		},
		{
			"from": "cmp:ExportPanel",
			"to": "state:designcanvas",
			"kind": "reads",
			"label": "all scene blocks and active selection ids"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "state:designState",
			"kind": "writes",
			"label": "sets widths of left and right panels"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "state:designcanvas",
			"kind": "writes",
			"label": "creates blocks, reparents, duplicates, nudges"
		},
		{
			"from": "cmp:Layers",
			"to": "state:designcanvas",
			"kind": "writes",
			"label": "selects, groups, deletes, pastes, cuts, reorders"
		},
		{
			"from": "cmp:ComponentLibrary",
			"to": "state:designcanvas",
			"kind": "writes",
			"label": "inserts templates/primitives/components"
		},
		{
			"from": "cmp:DesignBlock",
			"to": "state:designcanvas",
			"kind": "writes",
			"label": "initiates editing text inside editor"
		},
		{
			"from": "cmp:DesignInspector",
			"to": "state:designcanvas",
			"kind": "writes",
			"label": "modifies block style properties and typography"
		},
		{
			"from": "cmd:designer.toggleLayersSidebar",
			"to": "state:designState",
			"kind": "commands",
			"label": "design.toggleSidebar()"
		},
		{
			"from": "cmd:designer.toggleAiSidebar",
			"to": "state:designState",
			"kind": "commands",
			"label": "design.toggleAichat()"
		},
		{
			"from": "cmd:designer.resetScene",
			"to": "state:designcanvas",
			"kind": "commands",
			"label": "designcanvas.resetScene()"
		},
		{
			"from": "cmd:designer.centerCanvas",
			"to": "cmp:DesignLayout",
			"kind": "dispatches",
			"label": "fractaldesign:center-view"
		},
		{
			"from": "cmd:designer.zoom100",
			"to": "cmp:DesignLayout",
			"kind": "dispatches",
			"label": "fractaldesign:zoom detail: '100'"
		},
		{
			"from": "cmd:designer.zoomFit",
			"to": "cmp:DesignLayout",
			"kind": "dispatches",
			"label": "fractaldesign:zoom detail: 'fit'"
		},
		{
			"from": "cmd:designer.zoomSelection",
			"to": "cmp:DesignLayout",
			"kind": "dispatches",
			"label": "fractaldesign:zoom detail: 'selection'"
		},
		{
			"from": "cmd:designer.zoomIn",
			"to": "cmp:DesignLayout",
			"kind": "dispatches",
			"label": "fractaldesign:zoom detail: 'in'"
		},
		{
			"from": "cmd:designer.zoomOut",
			"to": "cmp:DesignLayout",
			"kind": "dispatches",
			"label": "fractaldesign:zoom detail: 'out'"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "fn:CanvasViewport",
			"kind": "calls",
			"label": "vp.panStart(), vp.screenToCanvas(), etc."
		},
		{
			"from": "cmp:DesignLayout",
			"to": "fn:DragEngine",
			"kind": "calls",
			"label": "drag.onPointerMove(), drag.onPointerUp()"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "fn:ResizeEngine",
			"kind": "calls",
			"label": "resize.onPointerMove(), resize.onPointerUp()"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "fn:RotateEngine",
			"kind": "calls",
			"label": "rotate.onPointerMove(), rotate.onPointerUp()"
		},
		{
			"from": "cmp:DesignLayout",
			"to": "fn:SelectionEngine",
			"kind": "calls",
			"label": "sel.onCanvasPointerDown()"
		},
		{
			"from": "cmp:DesignBlock",
			"to": "fn:DragEngine",
			"kind": "calls",
			"label": "drag.onPointerDown()"
		},
		{
			"from": "cmp:DesignBlock",
			"to": "fn:ResizeEngine",
			"kind": "calls",
			"label": "resize.onPointerDown()"
		},
		{
			"from": "cmp:DesignBlock",
			"to": "fn:RotateEngine",
			"kind": "calls",
			"label": "rotate.onPointerDown()"
		},
		{
			"from": "cmp:ExportPanel",
			"to": "fn:codegen",
			"kind": "calls",
			"label": "exportHtmlSass(), exportHtmlCss(), exportSvelte()"
		}
	],
	"flows": [
		{
			"id": "drag-drop-primitive",
			"name": "Add primitive to canvas",
			"trigger": "Drag primitive from ComponentLibrary to viewport",
			"steps": [
				"cmp:ComponentLibrary",
				"cmp:DesignLayout",
				"state:designcanvas",
				"cmp:DesignBlock"
			],
			"summary": "User drags a layout primitive from the library; the canvas-world calculates target position and inserts a new block."
		},
		{
			"id": "resize-block",
			"name": "Resize selected block",
			"trigger": "Drag bounding box handle in DesignBlock",
			"steps": [
				"cmp:DesignBlock",
				"fn:ResizeEngine",
				"state:designcanvas",
				"cmp:DesignBlock"
			],
			"summary": "Dragging a resize handle computes scale and bounds, updating the block's height/width inside canvas state."
		},
		{
			"id": "rotate-block",
			"name": "Rotate selected block",
			"trigger": "Drag rotate handle in DesignBlock",
			"steps": [
				"cmp:DesignBlock",
				"fn:RotateEngine",
				"state:designcanvas",
				"cmp:DesignBlock"
			],
			"summary": "Dragging the rotation handle calculates rotate snap angles and updates the block style rotation degrees."
		},
		{
			"id": "group-elements",
			"name": "Group selected elements",
			"trigger": "Keybinding Cmd+G",
			"steps": [
				"cmp:DesignLayout",
				"state:designcanvas",
				"cmp:DesignBlock"
			],
			"summary": "Combines selected blocks under a new auto-centered frame container block, reparenting the elements."
		},
		{
			"id": "export-svelte",
			"name": "Export element as Svelte",
			"trigger": "Select Svelte tab in ExportPanel",
			"steps": [
				"cmp:ExportPanel",
				"fn:codegen",
				"state:designcanvas"
			],
			"summary": "Serializes the selected canvas sub-tree or entire canvas into structured HTML and Svelte props."
		},
		{
			"id": "align-elements",
			"name": "Align selected blocks",
			"trigger": "Click align left icon in DesignInspector",
			"steps": [
				"cmp:DesignInspector",
				"state:designcanvas",
				"cmp:DesignBlock"
			],
			"summary": "Computes alignment bounding boxes for multi-selected items and updates their coordinates."
		},
		{
			"id": "zoom-fit",
			"name": "Zoom to fit canvas",
			"trigger": "Keybinding Cmd+1",
			"steps": [
				"cmd:designer.zoomFit",
				"cmp:DesignLayout",
				"fn:CanvasViewport",
				"state:designcanvas"
			],
			"summary": "Calculates the total bounding box of all canvas elements and animates the viewport zoom and pan values."
		}
	],
	"notes": [
		{
			"title": "Frontend-Only Canvas Persistence",
			"body": "The Designer module has zero direct IPC calls. It relies entirely on browser localStorage to persist canvas block trees and user-saved reusable component subtrees.",
			"severity": "info",
			"path": "src/lib/modules/designer/state/designcanvas.svelte.ts"
		},
		{
			"title": "Dedicated Modular Gestures Engine",
			"body": "CanvasViewport, DragEngine, ResizeEngine, RotateEngine, and SelectionEngine act as decoupled coordinate handlers. They isolate calculations from the UI, updating designcanvas state which triggers reactive redraws.",
			"severity": "info",
			"path": "src/lib/modules/designer/components/DesignLayout.svelte"
		},
		{
			"title": "Recursive Scene Graph Rendering Hotspot",
			"body": "DesignBlock recursively renders itself for nested frames and structures. Gestures (drag/resize/rotate) bubble up, creating high pointer event handler loads on dense canvases.",
			"severity": "warn",
			"path": "src/lib/modules/designer/components/DesignBlock.svelte"
		}
	]
}

	let { data = DEFAULT_DATA, activated = false, inspectorHost = undefined } = $props<{ data?: any, activated?: boolean, inspectorHost?: HTMLElement }>();

	const GROUP_ORDER = ['layout', 'components', 'shared', 'state', 'commands', 'ipc', 'external'];
	const GROUP_COLORS: Record<string, string> = {
		layout: '#a78bfa',
		components: '#60a5fa',
		shared: '#94a3b8',
		state: '#22d3ee',
		commands: '#34d399',
		ipc: '#fb7185',
		external: '#fbbf24'
	};
	const EDGE_COLORS: Record<string, string> = {
		renders: '#8b5cf6',
		imports: '#64748b',
		reads: '#22d3ee',
		writes: '#f59e0b',
		calls: '#c084fc',
		commands: '#34d399',
		dispatches: '#fb7185',
		listens: '#f472b6',
		ipc: '#f43f5e',
		navigates: '#38bdf8'
	};
	const EDGE_KINDS = ['renders', 'imports', 'reads', 'writes', 'calls', 'commands', 'dispatches', 'listens', 'ipc', 'navigates'];
	const CARD_W = 184;
	const CARD_H = 46;
	const COL_GAP = 88;
	const ROW_H = 64;
	const HEADER_H = 68;
	const PAD = 32;

	let hover = $state<string | null>(null);
	let sel = $state<string | null>(null);
	let q = $state<string>('');
	let off = $state<Record<string, boolean>>({});
	let flowId = $state<string | null>(null);
	let cursor = $state<number>(0);
	let playing = $state<boolean>(false);
	let view = $state({ x: 40, y: 32, k: 1 });

	let viewportEl = $state<HTMLDivElement | null>(null);
	let playTimer: ReturnType<typeof setInterval> | null = null;

	function edgePath(a: any, b: any) {
		let ay = a.y + CARD_H / 2;
		let by = b.y + CARD_H / 2;
		if (a.col === b.col) {
			let x = a.x;
			return 'M ' + x + ' ' + ay + ' C ' + (x - 56) + ' ' + ay + ', ' + (x - 56) + ' ' + by + ', ' + x + ' ' + by;
		}
		let x1, x2;
		if (b.col > a.col) {
			x1 = a.x + CARD_W;
			x2 = b.x;
		} else {
			x1 = a.x;
			x2 = b.x + CARD_W;
		}
		let k = Math.min(140, Math.max(36, Math.abs(x2 - x1) * 0.45));
		let s = x2 > x1 ? 1 : -1;
		return 'M ' + x1 + ' ' + ay + ' C ' + (x1 + s * k) + ' ' + ay + ', ' + (x2 - s * k) + ' ' + by + ', ' + x2 + ' ' + by;
	}

	function computeLayout(scan: any) {
		let nodesById: Record<string, any> = {};
		let degree: Record<string, number> = {};
		let adjacency: Record<string, Record<string, boolean>> = {};

		scan.nodes.forEach((n: any) => {
			nodesById[n.id] = n;
			degree[n.id] = 0;
			adjacency[n.id] = {};
		});

		scan.edges.forEach((e: any) => {
			if (!nodesById[e.from] || !nodesById[e.to]) return;
			degree[e.from]++;
			degree[e.to]++;
			adjacency[e.from][e.to] = true;
			adjacency[e.to][e.from] = true;
		});

		let entry = null;
		for (let i = 0; i < scan.nodes.length; i++) {
			if (scan.nodes[i].path === scan.module.entryLayout) {
				entry = scan.nodes[i].id;
				break;
			}
		}
		if (!entry) {
			for (let i = 0; i < scan.nodes.length; i++) {
				if (scan.nodes[i].group === 'layout') {
					entry = scan.nodes[i].id;
					break;
				}
			}
		}
		if (!entry && scan.nodes.length) entry = scan.nodes[0].id;

		let childrenOf: Record<string, string[]> = {};
		scan.edges.forEach((e: any) => {
			if (e.kind !== 'renders') return;
			(childrenOf[e.from] = childrenOf[e.from] || []).push(e.to);
		});

		let treeOrder: Record<string, number> = {};
		let counter = 0;
		let queue = entry ? [entry] : [];
		while (queue.length) {
			let id = queue.shift()!;
			if (treeOrder[id] !== undefined) continue;
			treeOrder[id] = counter++;
			(childrenOf[id] || []).forEach(c => {
				queue.push(c);
			});
		}

		let groupsPresent = GROUP_ORDER.filter(g => {
			return scan.nodes.some((n: any) => n.group === g);
		});
		scan.nodes.forEach((n: any) => {
			if (groupsPresent.indexOf(n.group) < 0) groupsPresent.push(n.group);
		});

		let byGroup: Record<string, any[]> = {};
		groupsPresent.forEach(g => {
			byGroup[g] = [];
		});
		scan.nodes.forEach((n: any) => {
			if (byGroup[n.group]) byGroup[n.group].push(n);
		});

		let orderOf: Record<string, number> = {};
		groupsPresent.forEach(g => {
			let sorted = byGroup[g].slice().sort((a, b) => {
				let ta = treeOrder[a.id];
				let tb = treeOrder[b.id];
				if (ta !== undefined || tb !== undefined) {
					return (ta === undefined ? 1e9 : ta) - (tb === undefined ? 1e9 : tb);
				}
				return degree[b.id] - degree[a.id] || (a.label < b.label ? -1 : 1);
			});
			sorted.forEach((n, i) => {
				orderOf[n.id] = i;
			});
		});

		for (let pass = 0; pass < 3; pass++) {
			groupsPresent.forEach(g => {
				if (g === 'layout') return;
				let scored = byGroup[g].map(n => {
					let keys = Object.keys(adjacency[n.id]);
					let b = Infinity;
					if (keys.length) {
						let sum = 0, cnt = 0;
						keys.forEach(m => {
							if (orderOf[m] !== undefined) {
								sum += orderOf[m];
								cnt++;
							}
						});
						if (cnt) b = sum / cnt;
					}
					return { n: n, b: b };
				});
				scored.sort((a, b) => a.b - b.b || orderOf[a.n.id] - orderOf[b.n.id]);
				scored.forEach((s, i) => {
					orderOf[s.n.id] = i;
				});
			});
		}

		let groupLabels: Record<string, string> = {};
		scan.groups.forEach((g: any) => {
			groupLabels[g.id] = g.label;
		});
		let columns = groupsPresent.map((g, i) => {
			return {
				id: g,
				label: groupLabels[g] || g,
				color: GROUP_COLORS[g] || '#94a3b8',
				x: PAD + i * (CARD_W + COL_GAP)
			};
		});

		let colIndex: Record<string, number> = {};
		groupsPresent.forEach((g, i) => {
			colIndex[g] = i;
		});

		let maxRows = 0;
		let nodes: any[] = [];
		let lnById: Record<string, any> = {};
		groupsPresent.forEach(g => {
			let col = colIndex[g];
			let arr = byGroup[g];
			maxRows = Math.max(maxRows, arr.length);
			arr.slice().sort((a, b) => orderOf[a.id] - orderOf[b.id])
				.forEach((n, row) => {
					let ln = {
						id: n.id,
						label: n.label,
						kind: n.kind,
						group: n.group,
						path: n.path,
						loc: n.loc,
						summary: n.summary,
						tags: n.tags,
						col: col,
						row: row,
						x: PAD + col * (CARD_W + COL_GAP),
						y: PAD + HEADER_H + row * ROW_H,
						degree: degree[n.id]
					};
					nodes.push(ln);
					lnById[ln.id] = ln;
				});
		});

		let width = PAD * 2 + groupsPresent.length * CARD_W + (groupsPresent.length - 1) * COL_GAP;
		let height = PAD * 2 + HEADER_H + maxRows * ROW_H;

		let edges: any[] = [];
		scan.edges.forEach((e: any) => {
			let a = lnById[e.from];
			let b = lnById[e.to];
			if (!a || !b) return;
			edges.push({
				from: e.from,
				to: e.to,
				kind: e.kind,
				label: e.label,
				d: edgePath(a, b)
			});
		});

		return {
			columns,
			nodes,
			nodesById: lnById,
			edges,
			adjacency,
			width,
			height
		};
	}

	function validate(scan: any) {
		let issues: string[] = [];
		let ids: Record<string, boolean> = {};
		scan.nodes.forEach((n: any) => {
			if (ids[n.id]) issues.push('duplicate node id: ' + n.id);
			ids[n.id] = true;
		});
		scan.edges.forEach((e: any) => {
			if (!ids[e.from]) issues.push('edge from unknown node: ' + e.from);
			if (!ids[e.to]) issues.push('edge to unknown node: ' + e.to);
			if (EDGE_KINDS.indexOf(e.kind) < 0) issues.push('unknown edge kind: ' + e.kind);
		});
		scan.flows.forEach((f: any) => {
			f.steps.forEach((stepId: string) => {
				if (!ids[stepId]) issues.push('flow ' + f.id + ' references unknown node: ' + stepId);
			});
		});
		return issues;
	}

	function computeFocusSet(
		fid: string | null,
		activeFlowVal: any,
		visibleStepsVal: string[],
		queryStr: string,
		layoutVal: any
	) {
		if (fid) {
			let s: Record<string, boolean> = { [fid]: true };
			Object.keys(layoutVal.adjacency[fid] || {}).forEach(m => {
				s[m] = true;
			});
			return s;
		}
		if (activeFlowVal) {
			let r: Record<string, boolean> = {};
			visibleStepsVal.forEach(id => {
				r[id] = true;
			});
			return r;
		}
		let query = queryStr.trim().toLowerCase();
		if (query) {
			let m: Record<string, boolean> = {};
			layoutVal.nodes.forEach((n: any) => {
				if (
					n.label.toLowerCase().includes(query) ||
					n.id.toLowerCase().includes(query) ||
					(n.path || '').toLowerCase().includes(query)
				) {
					m[n.id] = true;
				}
			});
			return m;
		}
		return null;
	}

	let layout = $derived(computeLayout(data));
	let issues = $derived(validate(data));
	let activeFlow = $derived(data.flows.find((f: any) => f.id === flowId) || null);
	let visibleSteps = $derived(activeFlow ? activeFlow.steps.slice(0, cursor) : []);
	let stepOrder = $derived(
		visibleSteps.reduce((acc: Record<string, number>, step: string, idx: number) => {
			acc[step] = idx + 1;
			return acc;
		}, {} as Record<string, number>)
	);
	let focusId = $derived(hover || sel);
	let focusSet = $derived(computeFocusSet(focusId, activeFlow, visibleSteps, q, layout));
	let flowPairs = $derived(
		visibleSteps.reduce((acc: Record<string, boolean>, step: string, idx: number) => {
			if (idx < visibleSteps.length - 1) {
				acc[step + '>' + visibleSteps[idx + 1]] = true;
				acc[visibleSteps[idx + 1] + '>' + step] = true;
			}
			return acc;
		}, {} as Record<string, boolean>)
	);
	let kindsPresent = $derived(EDGE_KINDS.filter(k => layout.edges.some(e => e.kind === k)));

	function fit() {
		if (!viewportEl) return;
		let vw = viewportEl.clientWidth;
		let vh = viewportEl.clientHeight;
		if (!vw || !vh) return;
		let k = Math.min((vw - 56) / layout.width, (vh - 56) / layout.height, 1.2);
		view = { k: k, x: (vw - layout.width * k) / 2, y: (vh - layout.height * k) / 2 };
	}

	function zoomBy(fac: number) {
		if (!viewportEl) return;
		let cx = viewportEl.clientWidth / 2;
		let cy = viewportEl.clientHeight / 2;
		let k2 = Math.min(2.6, Math.max(0.22, view.k * fac));
		view = { k: k2, x: cx - (cx - view.x) * (k2 / view.k), y: cy - (cy - view.y) * (k2 / view.k) };
	}

	$effect(() => {
		if (layout) {
			fit();
		}
	});

	$effect(() => {
		if (viewportEl) {
			const onWheel = (e: WheelEvent) => {
				e.preventDefault();
				let rect = viewportEl!.getBoundingClientRect();
				let mx = e.clientX - rect.left;
				let my = e.clientY - rect.top;
				let k2 = Math.min(2.6, Math.max(0.22, view.k * Math.exp(-e.deltaY * 0.0012)));
				view = { k: k2, x: mx - (mx - view.x) * (k2 / view.k), y: my - (my - view.y) * (k2 / view.k) };
			};
			viewportEl.addEventListener('wheel', onWheel, { passive: false });
			return () => {
				viewportEl?.removeEventListener('wheel', onWheel);
			};
		}
	});

	let panning = $state(false);
	let panMoved = false;
	let panStart = { x: 0, y: 0, vx: 0, vy: 0 };

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		if ((e.target as HTMLElement).closest('.ahs-node')) return;
		panning = true;
		panMoved = false;
		panStart = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
		if (viewportEl) {
			viewportEl.setPointerCapture(e.pointerId);
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!panning) return;
		let dx = e.clientX - panStart.x;
		let dy = e.clientY - panStart.y;
		if (Math.abs(dx) + Math.abs(dy) > 4) {
			panMoved = true;
		}
		view = { k: view.k, x: panStart.vx + dx, y: panStart.vy + dy };
	}

	function handlePointerUp(e: PointerEvent) {
		if (!panning) return;
		panning = false;
		if (viewportEl) {
			viewportEl.releasePointerCapture(e.pointerId);
		}
		if (!panMoved) {
			sel = null;
		}
	}

	function stopPlay() {
		playing = false;
		if (playTimer) {
			clearInterval(playTimer);
			playTimer = null;
		}
	}

	function handlePlay() {
		let f = activeFlow;
		if (!f) return;
		if (playing) {
			stopPlay();
			return;
		}
		if (cursor >= f.steps.length || cursor === 0) {
			cursor = 1;
		}
		playing = true;
		playTimer = setInterval(() => {
			if (cursor >= f.steps.length) {
				stopPlay();
				return;
			}
			cursor++;
		}, 850);
	}

	function selectFlow(id: string) {
		if (flowId === id) {
			flowId = null;
			stopPlay();
		} else {
			flowId = id;
			let f = data.flows.find((fl: any) => fl.id === id);
			cursor = f ? f.steps.length : 0;
			stopPlay();
		}
	}

	function selectNode(id: string) {
		sel = sel === id ? null : id;
	}

	function labelOf(id: string) {
		return layout.nodesById[id] ? layout.nodesById[id].label : id;
	}

	onDestroy(() => {
		if (playTimer) {
			clearInterval(playTimer);
		}
	});
</script>

{#if activated}
<div class="graph-wrapper box">
	<div class="box graph-top">
	<header class="graph-header xbetween row ycenter">
		<div class="row gap16 ycenter w100">
			<span class="app-chip text-sm"><b>{layout.nodes.length}</b><span class="col3">nodes</span></span>
			<span class="app-chip text-sm"><b>{layout.edges.length}</b><span class="col3">edges</span></span>
			<span class="app-chip text-sm"><b>{data.stats.ipcCalls}</b><span class="col3">ipc</span></span>
			<span class="app-chip text-sm"><b>{data.flows.length}</b><span class="col3">flows</span></span>
			{#if issues.length}
			<span class="pill-filled" title={issues.slice(0, 6).join('\n')}>
				⚠ {issues.length} contract issue{issues.length === 1 ? '' : 's'}
			</span>
			{/if}
		</div>
		<input
			class="input-search"
			placeholder="Search nodes…"
			bind:value={q}
		/>
	</header>
	<div class="graph-toolbar row ycenter xbetween">
		<div class="row gap16 ycenter">
			{#each kindsPresent as k}
				<button
					class="ahs-legend-item {off[k] ? 'off' : ''}"
					title="toggle {k} edges"
					onclick={() => { off[k] = !off[k]; }}
				>
					<span class="pill-dot" style="background:{EDGE_COLORS[k]}"></span>
					{k}
				</button>
			{/each}
		</div>
		<div class="graph-zoom row ycenter gap8">
			<button class="btn-icon" title="Zoom out" onclick={() => zoomBy(1 / 1.25)}><MinusIcon/></button>
			<span class="btn-icon"><span class="btn-icon-text">{Math.round(view.k * 100)}%</span></span>
			<button class="btn-icon" title="Zoom in" onclick={() => zoomBy(1.25)}><PlusIcon/></button>
			<button class="btn-icon" title="Fit to view" onclick={fit}><ExpandIcon/></button>
		</div>
	</div>
	<div class="graph-flowbar">
		{#if data.flows && data.flows.length}
		<div class="row gap8 wrap">
			{#each data.flows as f}
				<button
					class="pill-filled-sharp tt-u {flowId === f.id ? 'active' : ''}"
					title={f.trigger}
					onclick={() => selectFlow(f.id)}
				>
					{f.name}
				</button>
			{/each}
			
			{#if activeFlow}
				<button
					class="ahs-iconbtn {playing ? 'active' : ''}"
					title={playing ? 'Pause' : 'Play'}
					onclick={handlePlay}
				>
					{playing ? '❚❚' : '▶'}
				</button>
				<span class="ahs-flow-meta">
					{Math.min(cursor, activeFlow.steps.length)}/{activeFlow.steps.length} steps · {activeFlow.trigger}
				</span>
			{/if}
		</div>
	{/if}
	</div>
	</div>
	<div class="graph-main">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="ahs-viewport {panning ? 'panning' : ''}"
			bind:this={viewportEl}
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
		>
			<div
				class="ahs-canvas"
				style="width:{layout.width}px; height:{layout.height}px; transform: translate({view.x}px,{view.y}px) scale({view.k});"
			>
				<svg
					class="ahs-edges"
					width={layout.width}
					height={layout.height}
				>
					{#each layout.edges as e}
						{#if !off[e.kind]}
							{@const fid = focusId}
							{@const f = activeFlow}
							{@const fs = focusSet}
							{@const isFlow = flowPairs[e.from + '>' + e.to]}
							{@const hot = fid ? (e.from === fid || e.to === fid) : f ? isFlow : (fs ? (fs[e.from] && fs[e.to]) : false)}
							{@const showFlow = hot && isFlow && !fid}
							<path
								class="ahs-edge {fs ? (hot ? 'hot' : 'dim') : ''} {showFlow ? 'flow' : ''}"
								d={e.d}
								stroke={EDGE_COLORS[e.kind]}
							/>
						{/if}
					{/each}
				</svg>

				{#each layout.columns as c}
					<div
						class="ahs-col-label"
						style="left:{c.x}px; color:{c.color}"
					>
						{c.label}
					</div>
				{/each}

				{#each layout.nodes as n}
					{@const isDim = focusSet && !focusSet[n.id]}
					{@const orderNum = stepOrder[n.id]}
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						class="ahs-node {sel === n.id ? 'sel' : ''} {isDim ? 'dim' : ''}"
						role="button"
						tabindex="0"
						style="left:{n.x}px; top:{n.y}px; --gc:{GROUP_COLORS[n.group] || '#94a3b8'}"
						title={n.path || n.label}
						onpointerenter={() => { hover = n.id; }}
						onpointerleave={() => { if (hover === n.id) hover = null; }}
						onclick={() => selectNode(n.id)}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectNode(n.id); }}
					>
						<span class="ahs-node-label">{n.label}</span>
						<span class="ahs-node-kind">{n.kind}{n.loc ? ` · ${n.loc} loc` : ''}</span>
						{#if orderNum}
							<span class="ahs-badge">{orderNum}</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<aside class="ahs-side" use:mountIn={inspectorHost}>
			{#if sel}
				{@const n = layout.nodesById[sel]}
				{#if n}
					{@const gc = GROUP_COLORS[n.group] || '#94a3b8'}
					{@const outs = layout.edges.filter(e => e.from === n.id)}
					{@const ins = layout.edges.filter(e => e.to === n.id)}
					
					<button class="ahs-back" onclick={() => { sel = null; }}>← Overview</button>
					<span class="ahs-kindchip" style="background: {gc}22; color: {gc}">{n.kind}</span>
					<div class="ahs-side-title">{n.label}</div>
					
					{#if n.summary}
						<div class="ahs-summary">{n.summary}</div>
					{/if}
					
					{#if n.path}
						<div class="ahs-path">{n.path}</div>
					{/if}
					
					<div class="ahs-kv">
						<div class="ahs-kv-item">
							<b>{n.degree}</b>
							<span>links</span>
						</div>
						<div class="ahs-kv-item">
							<b>{n.loc || '—'}</b>
							<span>loc</span>
						</div>
					</div>
					
					{#if n.tags && n.tags.length}
						<div class="ahs-stats" style="justify-content: flex-start; margin-bottom: 10px">
							{#each n.tags as t}
								<span class="ahs-chip">{t}</span>
							{/each}
						</div>
					{/if}
					
					<div class="ahs-section">Outgoing · {outs.length}</div>
					{#if outs.length === 0}
						<div class="ahs-note-body">none</div>
					{:else}
						{#each outs as e}
							<button class="ahs-edge-row" onclick={() => selectNode(e.to)}>
								<span class="ahs-edge-kind" style="color: {EDGE_COLORS[e.kind]}">{e.kind}</span>
								<span class="ahs-edge-target">{labelOf(e.to)}</span>
							</button>
						{/each}
					{/if}
					
					<div class="ahs-section">Incoming · {ins.length}</div>
					{#if ins.length === 0}
						<div class="ahs-note-body">none</div>
					{:else}
						{#each ins as e}
							<button class="ahs-edge-row" onclick={() => selectNode(e.from)}>
								<span class="ahs-edge-kind" style="color: {EDGE_COLORS[e.kind]}">{e.kind}</span>
								<span class="ahs-edge-target">{labelOf(e.from)}</span>
							</button>
						{/each}
					{/if}
				{/if}
			{:else}
				<div class="ahs-section">Module</div>
				<div class="ahs-side-title">{data.module.name}</div>
				
				{#if data.module.summary}
					<div class="ahs-summary">{data.module.summary}</div>
				{/if}
				
				<div class="ahs-path">{data.module.root}</div>
				
				<div class="ahs-kv">
					<div class="ahs-kv-item">
						<b>{data.stats.components}</b>
						<span>components</span>
					</div>
					<div class="ahs-kv-item">
						<b>{data.stats.stateFiles}</b>
						<span>state</span>
					</div>
					<div class="ahs-kv-item">
						<b>{data.stats.commands}</b>
						<span>commands</span>
					</div>
					<div class="ahs-kv-item">
						<b>{data.stats.ipcCalls}</b>
						<span>ipc</span>
					</div>
				</div>
				
				{#if data.flows && data.flows.length}
					<div class="ahs-section">Flows</div>
					{#each data.flows as f}
						<button
							class="ahs-flow-row {flowId === f.id ? 'active' : ''}"
							onclick={() => selectFlow(f.id)}
						>
							<div class="ahs-flow-name">{f.name} · {f.steps.length} steps</div>
							<div class="ahs-flow-trigger">{f.trigger}</div>
						</button>
					{/each}
				{/if}
				
				{#if data.notes && data.notes.length}
					<div class="ahs-section">Findings</div>
					{#each data.notes as note}
						<div class="ahs-note {note.severity}">
							<div class="ahs-note-title">{note.title}</div>
							<div class="ahs-note-body">{note.body}</div>
						</div>
					{/each}
				{/if}
			{/if}
		</aside>
	</div>
</div>
{/if}
