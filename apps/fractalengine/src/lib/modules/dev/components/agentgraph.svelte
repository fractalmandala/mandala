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
		"id": "ai",
		"name": "fractalAI",
		"entryLayout": "src/lib/modules/ai/components/AiLayout.svelte",
		"root": "src/lib/modules/ai",
		"summary": "AI Agent workspace containing chat tabs, history overlays, and tool execution columns.",
		"externalModules": [
			"code"
		]
	},
	"stats": {
		"nodes": 21,
		"edges": 37,
		"components": 6,
		"stateFiles": 4,
		"commands": 5,
		"ipcCalls": 3,
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
			"id": "cmp:AiLayout",
			"label": "AiLayout.svelte",
			"kind": "layout",
			"group": "layout",
			"path": "src/lib/modules/ai/components/AiLayout.svelte",
			"loc": 131,
			"summary": "Entry layout for the Agent module, rendering collapsibles and resize handles.",
			"tags": [
				"entry"
			]
		},
		{
			"id": "cmp:AiSidebar",
			"label": "AiSidebar.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/ai/components/AiSidebar.svelte",
			"loc": 95,
			"summary": "Lists pinned and recent chat sessions sorted by last opened time."
		},
		{
			"id": "cmp:ChatColumn",
			"label": "ChatColumn.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/ai/components/ChatColumn.svelte",
			"loc": 38,
			"summary": "Chat container with session tabs strip and AiChatMain viewer."
		},
		{
			"id": "cmp:SessionRow",
			"label": "SessionRow.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/ai/components/SessionRow.svelte",
			"loc": 50,
			"summary": "Individual session list item displaying titles and pin buttons."
		},
		{
			"id": "cmp:WorkPanel",
			"label": "WorkPanel.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/ai/components/WorkPanel.svelte",
			"loc": 36,
			"summary": "Side tab panel allowing the AI agent to mount files, terminal, or browser views."
		},
		{
			"id": "cmp:AiChatMain",
			"label": "AiChatMain.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/ai/components/AiChatMain.svelte",
			"loc": 805,
			"summary": "Core chat component with autocomplete suggestions, prompt inputs, and history tabs."
		},
		{
			"id": "state:aiWorkspace",
			"label": "ai.svelte.ts",
			"kind": "state",
			"group": "state",
			"path": "src/lib/modules/ai/state/ai.svelte.ts",
			"loc": 333,
			"summary": "Layout state manager for Agent panels, active session tabs, and overlay metadata.",
			"tags": [
				"singleton"
			]
		},
		{
			"id": "state:ideState",
			"label": "ide.svelte.ts",
			"kind": "state",
			"group": "state",
			"path": "src/lib/state/ide.svelte.ts",
			"loc": 2385,
			"summary": "Global workspace state managing active chat streams, messages, and model providers.",
			"tags": [
				"singleton"
			]
		},
		{
			"id": "state:aiState",
			"label": "ai.svelte.ts (global shim)",
			"kind": "state",
			"group": "state",
			"path": "src/lib/state/ai.svelte.ts",
			"loc": 6,
			"summary": "Shim exporting global ideState under the name aiState for compatibility.",
			"tags": [
				"shim"
			]
		},
		{
			"id": "state:modelRegistry",
			"label": "modelRegistry.svelte.ts",
			"kind": "state",
			"group": "state",
			"path": "src/lib/state/modelRegistry.svelte.ts",
			"loc": 420,
			"summary": "Maintains catalog of available models, active selections, and skill bindings.",
			"tags": [
				"singleton"
			]
		},
		{
			"id": "shared:AIChat",
			"label": "AIChat.svelte",
			"kind": "shared",
			"group": "shared",
			"path": "src/lib/components/AIChat.svelte",
			"loc": 946,
			"summary": "Inline copilot chat component imported by other modules for contextual sidebars.",
			"tags": [
				"inline-copilot"
			]
		},
		{
			"id": "shared:BrowserLauncherCard",
			"label": "BrowserLauncherCard.svelte",
			"kind": "shared",
			"group": "shared"
		},
		{
			"id": "ext:code",
			"label": "Code Module",
			"kind": "external",
			"group": "external",
			"summary": "Renders Sidebar/Terminal inside WorkPanel to let AI interact with files/shell."
		},
		{
			"id": "cmd:ai.newSession",
			"label": "ai.newSession",
			"kind": "command",
			"group": "commands",
			"tags": [
				"Header Click"
			]
		},
		{
			"id": "cmd:ai.toggleSessionsSidebar",
			"label": "ai.toggleSessionsSidebar",
			"kind": "command",
			"group": "commands"
		},
		{
			"id": "cmd:ai.toggleWorkPanel",
			"label": "ai.toggleWorkPanel",
			"kind": "command",
			"group": "commands"
		},
		{
			"id": "cmd:ai.openFilesPanel",
			"label": "ai.openFilesPanel",
			"kind": "command",
			"group": "commands"
		},
		{
			"id": "cmd:ai.openTerminalPanel",
			"label": "ai.openTerminalPanel",
			"kind": "command",
			"group": "commands"
		},
		{
			"id": "ipc:onAiUsage",
			"label": "onAiUsage",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:readFile",
			"label": "readFile",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:searchWorkspaceFiles",
			"label": "searchWorkspaceFiles",
			"kind": "ipc",
			"group": "ipc"
		}
	],
	"edges": [
		{
			"from": "cmp:AiLayout",
			"to": "cmp:AiSidebar",
			"kind": "renders"
		},
		{
			"from": "cmp:AiLayout",
			"to": "cmp:ChatColumn",
			"kind": "renders"
		},
		{
			"from": "cmp:AiLayout",
			"to": "cmp:WorkPanel",
			"kind": "renders"
		},
		{
			"from": "cmp:AiSidebar",
			"to": "cmp:SessionRow",
			"kind": "renders"
		},
		{
			"from": "cmp:ChatColumn",
			"to": "cmp:AiChatMain",
			"kind": "renders"
		},
		{
			"from": "cmp:WorkPanel",
			"to": "shared:BrowserLauncherCard",
			"kind": "renders"
		},
		{
			"from": "cmp:WorkPanel",
			"to": "ext:code",
			"kind": "renders"
		},
		{
			"from": "cmp:AiLayout",
			"to": "state:aiWorkspace",
			"kind": "reads",
			"label": "widths and collapsed flags"
		},
		{
			"from": "cmp:AiSidebar",
			"to": "state:aiWorkspace",
			"kind": "reads",
			"label": "sessions lists and sidebar tab"
		},
		{
			"from": "cmp:ChatColumn",
			"to": "state:aiWorkspace",
			"kind": "reads",
			"label": "openTabIds list and active tab"
		},
		{
			"from": "cmp:WorkPanel",
			"to": "state:aiWorkspace",
			"kind": "reads",
			"label": "current workTab category"
		},
		{
			"from": "cmp:AiChatMain",
			"to": "state:aiWorkspace",
			"kind": "reads",
			"label": "history list and active session ids"
		},
		{
			"from": "cmp:AiChatMain",
			"to": "state:aiState",
			"kind": "reads",
			"label": "active chat text and streaming logs"
		},
		{
			"from": "shared:AIChat",
			"to": "state:aiState",
			"kind": "reads",
			"label": "active chat text and streaming logs"
		},
		{
			"from": "state:aiState",
			"to": "state:ideState",
			"kind": "reads",
			"label": "compatibility shim delegation"
		},
		{
			"from": "cmp:AiChatMain",
			"to": "state:modelRegistry",
			"kind": "reads",
			"label": "model catalogue and active config"
		},
		{
			"from": "shared:AIChat",
			"to": "state:modelRegistry",
			"kind": "reads",
			"label": "model catalogue and active config"
		},
		{
			"from": "cmp:AiLayout",
			"to": "state:aiWorkspace",
			"kind": "writes",
			"label": "mutates panel dimensions"
		},
		{
			"from": "cmp:AiSidebar",
			"to": "state:aiWorkspace",
			"kind": "writes",
			"label": "creates fresh chat session"
		},
		{
			"from": "cmp:SessionRow",
			"to": "state:aiWorkspace",
			"kind": "writes",
			"label": "pins session and loads chat ID"
		},
		{
			"from": "cmp:ChatColumn",
			"to": "state:aiWorkspace",
			"kind": "writes",
			"label": "closes tab and manages layout successor"
		},
		{
			"from": "cmp:WorkPanel",
			"to": "state:aiWorkspace",
			"kind": "writes",
			"label": "switches active workTab categories"
		},
		{
			"from": "cmp:AiChatMain",
			"to": "state:aiState",
			"kind": "writes",
			"label": "triggers message stream and cancels stream"
		},
		{
			"from": "shared:AIChat",
			"to": "state:aiState",
			"kind": "writes",
			"label": "triggers message stream and cancels stream"
		},
		{
			"from": "cmd:ai.newSession",
			"to": "state:aiWorkspace",
			"kind": "commands",
			"label": "aiWorkspace.newSession()"
		},
		{
			"from": "cmd:ai.toggleSessionsSidebar",
			"to": "state:aiWorkspace",
			"kind": "commands",
			"label": "aiWorkspace.toggleSidebar()"
		},
		{
			"from": "cmd:ai.toggleWorkPanel",
			"to": "state:aiWorkspace",
			"kind": "commands",
			"label": "aiWorkspace.toggleWorkPanel()"
		},
		{
			"from": "cmd:ai.openFilesPanel",
			"to": "state:aiWorkspace",
			"kind": "commands",
			"label": "aiWorkspace.setWorkTab('files')"
		},
		{
			"from": "cmd:ai.openTerminalPanel",
			"to": "state:aiWorkspace",
			"kind": "commands",
			"label": "aiWorkspace.setWorkTab('terminal')"
		},
		{
			"from": "cmp:AiLayout",
			"to": "state:aiWorkspace",
			"kind": "calls",
			"label": "refreshes sessions in onMount"
		},
		{
			"from": "state:aiWorkspace",
			"to": "state:ideState",
			"kind": "writes",
			"label": "delegates session metadata creation"
		},
		{
			"from": "cmp:AiChatMain",
			"to": "ipc:onAiUsage",
			"kind": "ipc"
		},
		{
			"from": "shared:AIChat",
			"to": "ipc:onAiUsage",
			"kind": "ipc"
		},
		{
			"from": "cmp:AiChatMain",
			"to": "ipc:readFile",
			"kind": "ipc"
		},
		{
			"from": "shared:AIChat",
			"to": "ipc:readFile",
			"kind": "ipc"
		},
		{
			"from": "cmp:AiChatMain",
			"to": "ipc:searchWorkspaceFiles",
			"kind": "ipc"
		},
		{
			"from": "shared:AIChat",
			"to": "ipc:searchWorkspaceFiles",
			"kind": "ipc"
		}
	],
	"flows": [
		{
			"id": "new-session",
			"name": "Start new AI session",
			"trigger": "Click '+ New Session' in AiSidebar",
			"steps": [
				"cmp:AiSidebar",
				"state:aiWorkspace",
				"state:ideState",
				"cmp:AiChatMain"
			],
			"summary": "User starts a fresh chat; a new UUID is generated in ideState and mounted as an active tab in the chat view."
		},
		{
			"id": "open-session",
			"name": "Load existing session",
			"trigger": "Click session item in AiSidebar",
			"steps": [
				"cmp:AiSidebar",
				"state:aiWorkspace",
				"state:ideState",
				"cmp:AiChatMain"
			],
			"summary": "Opens a previous chat session, loads the messages from SQLite, and updates active tab state."
		},
		{
			"id": "pin-session",
			"name": "Pin chat session",
			"trigger": "Click pin icon in SessionRow",
			"steps": [
				"cmp:SessionRow",
				"state:aiWorkspace",
				"cmp:AiSidebar"
			],
			"summary": "Sets pinned state on the session metadata, updating the history sidebar rendering."
		},
		{
			"id": "close-tab",
			"name": "Close session tab",
			"trigger": "Click close icon in ChatColumn tab",
			"steps": [
				"cmp:ChatColumn",
				"state:aiWorkspace",
				"state:ideState",
				"cmp:AiChatMain"
			],
			"summary": "Closes a session tab; loads successor session from the remaining tabs list or falls back to a new chat."
		},
		{
			"id": "autocomplete-file",
			"name": "Type @ file autocomplete",
			"trigger": "Type '@' in PromptInput textbox",
			"steps": [
				"cmp:AiChatMain",
				"ipc:searchWorkspaceFiles",
				"cmp:AiChatMain"
			],
			"summary": "Typing '@' triggers debounced search query to look up workspace files and list autocomplete options."
		},
		{
			"id": "toggle-work-panel",
			"name": "Switch WorkPanel view",
			"trigger": "Click 'Terminal' tab in WorkPanel",
			"steps": [
				"cmp:WorkPanel",
				"state:aiWorkspace",
				"ext:code"
			],
			"summary": "Switches the work panel tab category, mounting the IDE Sidebar, Terminal, or Browser card."
		},
		{
			"id": "cancel-stream",
			"name": "Stop in-flight stream",
			"trigger": "Click 'Stop' button in PromptInput",
			"steps": [
				"cmp:AiChatMain",
				"state:aiState",
				"state:ideState"
			],
			"summary": "Instructs the backend to terminate the LLM stream, and saves the partial response."
		}
	],
	"notes": [
		{
			"title": "Compatibility State Shim delegation",
			"body": "The global state file ai.svelte.ts acts as a compatibility shim. It forwards imports to ideState, which continues to hold the core AI streaming and message persistence logic.",
			"severity": "info",
			"path": "src/lib/state/ai.svelte.ts"
		},
		{
			"title": "Tab successor selection transaction",
			"body": "Closing an active chat tab runs inside a layout transaction. It calculates the successor index and loads the next SQLite session history in a single atomic undo/redo boundary.",
			"severity": "warn",
			"path": "src/lib/modules/ai/state/ai.svelte.ts"
		},
		{
			"title": "WorkPanel component cross-module embedding",
			"body": "WorkPanel embeds components directly from other modules (IDE Sidebar, IDE Terminal, Browser card), allowing the AI agent to execute tasks and observe state within a unified workspace.",
			"severity": "info",
			"path": "src/lib/modules/ai/components/WorkPanel.svelte"
		}
	]
}

	let { data = DEFAULT_DATA, activated = false, inspectorHost = undefined } = $props<{ data?: any, activated?: boolean, inspectorHost?: HTMLElement;  }>();

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
