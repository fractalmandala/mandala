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
		"id": "media",
		"name": "fractalMedia",
		"entryLayout": "src/lib/modules/media/components/MediaLayout.svelte",
		"root": "src/lib/modules/media",
		"summary": "Asset manager module for copy/move operations, image caching, video thumbnail generation, and tag indexing.",
		"externalModules": []
	},
	"stats": {
		"nodes": 33,
		"edges": 46,
		"components": 7,
		"stateFiles": 1,
		"commands": 8,
		"ipcCalls": 17,
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
			"id": "cmp:MediaLayout",
			"label": "MediaLayout.svelte",
			"kind": "layout",
			"group": "layout",
			"path": "src/lib/modules/media/components/MediaLayout.svelte",
			"loc": 45,
			"summary": "Entry workspace layout managing split panes, drag-drop imports, and toolbar.",
			"tags": [
				"entry"
			]
		},
		{
			"id": "cmp:MediaSidebar",
			"label": "MediaSidebar.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/media/components/MediaSidebar.svelte",
			"loc": 30,
			"summary": "Sidebar column for choosing sections, filtering tags, and rendering folder trees."
		},
		{
			"id": "cmp:MediaToolbar",
			"label": "MediaToolbar.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/media/components/MediaToolbar.svelte",
			"loc": 18,
			"summary": "Header toolbar housing search input, type filters, sort menus, and thumbnail sizes."
		},
		{
			"id": "cmp:MediaGrid",
			"label": "MediaGrid.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/media/components/MediaGrid.svelte",
			"loc": 26,
			"summary": "Virtualised scrolling grid of media cards using IntersectionObserver load cues."
		},
		{
			"id": "cmp:MediaCard",
			"label": "MediaCard.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/media/components/MediaCard.svelte",
			"loc": 29,
			"summary": "Individual asset card rendering image/video thumbnails and drag payloads."
		},
		{
			"id": "cmp:MediaInspector",
			"label": "MediaInspector.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/media/components/MediaInspector.svelte",
			"loc": 20,
			"summary": "Right sidebar panel for previewing videos/images, editing tags, and renaming."
		},
		{
			"id": "cmp:MediaProgressStrip",
			"label": "MediaProgressStrip.svelte",
			"kind": "component",
			"group": "components",
			"path": "src/lib/modules/media/components/MediaProgressStrip.svelte",
			"loc": 10,
			"summary": "Bottom panel tracking active asset import tasks and cancellation handlers."
		},
		{
			"id": "state:mediaState",
			"label": "media.svelte.ts",
			"kind": "state",
			"group": "state",
			"path": "src/lib/modules/media/state/media.svelte.ts",
			"loc": 211,
			"summary": "Singleton state store managing asset lists, folders, selection states, and undo.",
			"tags": [
				"singleton"
			]
		},
		{
			"id": "cmd:media.addToGallery",
			"label": "media.addToGallery",
			"kind": "command",
			"group": "commands",
			"tags": [
				"Import Button"
			]
		},
		{
			"id": "cmd:media.importFolder",
			"label": "media.importFolder",
			"kind": "command",
			"group": "commands"
		},
		{
			"id": "cmd:media.newFolder",
			"label": "media.newFolder",
			"kind": "command",
			"group": "commands",
			"tags": [
				"cmd+shift+n"
			]
		},
		{
			"id": "cmd:media.focusSearch",
			"label": "media.focusSearch",
			"kind": "command",
			"group": "commands",
			"tags": [
				"cmd+f"
			]
		},
		{
			"id": "cmd:media.toggleInspector",
			"label": "media.toggleInspector",
			"kind": "command",
			"group": "commands",
			"tags": [
				"cmd+shift+i"
			]
		},
		{
			"id": "cmd:media.trashSelection",
			"label": "media.trashSelection",
			"kind": "command",
			"group": "commands",
			"tags": [
				"cmd+backspace"
			]
		},
		{
			"id": "cmd:media.selectAll",
			"label": "media.selectAll",
			"kind": "command",
			"group": "commands",
			"tags": [
				"cmd+a"
			]
		},
		{
			"id": "cmd:media.pinSelection",
			"label": "media.pinSelection",
			"kind": "command",
			"group": "commands"
		},
		{
			"id": "ipc:mediaGetLibrary",
			"label": "mediaGetLibrary",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaListTree",
			"label": "mediaListTree",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaListItems",
			"label": "mediaListItems",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaListAllTags",
			"label": "mediaListAllTags",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaImport",
			"label": "mediaImport",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaCancelImport",
			"label": "mediaCancelImport",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaCreateFolder",
			"label": "mediaCreateFolder",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaRenameEntry",
			"label": "mediaRenameEntry",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaMoveEntries",
			"label": "mediaMoveEntries",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaTrashEntries",
			"label": "mediaTrashEntries",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaSetTags",
			"label": "mediaSetTags",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaSetPinned",
			"label": "mediaSetPinned",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaAssetUrl",
			"label": "mediaAssetUrl",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaGetThumbnail",
			"label": "mediaGetThumbnail",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaSaveVideoThumbnail",
			"label": "mediaSaveVideoThumbnail",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaSetVideoProbe",
			"label": "mediaSetVideoProbe",
			"kind": "ipc",
			"group": "ipc"
		},
		{
			"id": "ipc:mediaPickImportSources",
			"label": "mediaPickImportSources",
			"kind": "ipc",
			"group": "ipc"
		}
	],
	"edges": [
		{
			"from": "cmp:MediaLayout",
			"to": "cmp:MediaSidebar",
			"kind": "renders"
		},
		{
			"from": "cmp:MediaLayout",
			"to": "cmp:MediaToolbar",
			"kind": "renders"
		},
		{
			"from": "cmp:MediaLayout",
			"to": "cmp:MediaGrid",
			"kind": "renders"
		},
		{
			"from": "cmp:MediaLayout",
			"to": "cmp:MediaProgressStrip",
			"kind": "renders"
		},
		{
			"from": "cmp:MediaLayout",
			"to": "cmp:MediaInspector",
			"kind": "renders"
		},
		{
			"from": "cmp:MediaGrid",
			"to": "cmp:MediaCard",
			"kind": "renders"
		},
		{
			"from": "cmp:MediaLayout",
			"to": "state:mediaState",
			"kind": "reads",
			"label": "library info and loading flags"
		},
		{
			"from": "cmp:MediaSidebar",
			"to": "state:mediaState",
			"kind": "reads",
			"label": "scopes, folders cache, and tags count"
		},
		{
			"from": "cmp:MediaToolbar",
			"to": "state:mediaState",
			"kind": "reads",
			"label": "search query, sorting dropdown, and thumbnail size"
		},
		{
			"from": "cmp:MediaGrid",
			"to": "state:mediaState",
			"kind": "reads",
			"label": "visible items, selection mapping, and scope properties"
		},
		{
			"from": "cmp:MediaCard",
			"to": "state:mediaState",
			"kind": "reads",
			"label": "current thumbnail width dimensions"
		},
		{
			"from": "cmp:MediaInspector",
			"to": "state:mediaState",
			"kind": "reads",
			"label": "selected assets, tag counts, and visibility lists"
		},
		{
			"from": "cmp:MediaProgressStrip",
			"to": "state:mediaState",
			"kind": "reads",
			"label": "active import progresses and total list size"
		},
		{
			"from": "cmp:MediaLayout",
			"to": "state:mediaState",
			"kind": "writes",
			"label": "toggles right inspector panel"
		},
		{
			"from": "cmp:MediaSidebar",
			"to": "state:mediaState",
			"kind": "writes",
			"label": "sets scope, creates folder, and triggers moves"
		},
		{
			"from": "cmp:MediaToolbar",
			"to": "state:mediaState",
			"kind": "writes",
			"label": "modifies active search terms and sort variables"
		},
		{
			"from": "cmp:MediaGrid",
			"to": "state:mediaState",
			"kind": "writes",
			"label": "moves dropped items, selects all, clears selection"
		},
		{
			"from": "cmp:MediaCard",
			"to": "state:mediaState",
			"kind": "writes",
			"label": "toggles item selection key modifiers"
		},
		{
			"from": "cmp:MediaInspector",
			"to": "state:mediaState",
			"kind": "writes",
			"label": "updates tags, renames assets, and toggles pins"
		},
		{
			"from": "cmp:MediaProgressStrip",
			"to": "state:mediaState",
			"kind": "writes",
			"label": "cancels current active import task"
		},
		{
			"from": "cmd:media.addToGallery",
			"to": "state:mediaState",
			"kind": "commands",
			"label": "media.importPaths()"
		},
		{
			"from": "cmd:media.importFolder",
			"to": "state:mediaState",
			"kind": "commands",
			"label": "media.pickImportSources('folder')"
		},
		{
			"from": "cmd:media.newFolder",
			"to": "state:mediaState",
			"kind": "commands",
			"label": "media.createFolder()"
		},
		{
			"from": "cmd:media.focusSearch",
			"to": "cmp:MediaToolbar",
			"kind": "commands",
			"label": "document.querySelector('.media-search').focus()"
		},
		{
			"from": "cmd:media.toggleInspector",
			"to": "state:mediaState",
			"kind": "commands",
			"label": "media.setInspectorOpen()"
		},
		{
			"from": "cmd:media.trashSelection",
			"to": "state:mediaState",
			"kind": "commands",
			"label": "media.trash()"
		},
		{
			"from": "cmd:media.selectAll",
			"to": "state:mediaState",
			"kind": "commands",
			"label": "media.selectAll()"
		},
		{
			"from": "cmd:media.pinSelection",
			"to": "state:mediaState",
			"kind": "commands",
			"label": "media.setPinned()"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaGetLibrary",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaListTree",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaListItems",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaListAllTags",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaImport",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaCancelImport",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaCreateFolder",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaRenameEntry",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaMoveEntries",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaTrashEntries",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaSetTags",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaSetPinned",
			"kind": "ipc"
		},
		{
			"from": "state:mediaState",
			"to": "ipc:mediaPickImportSources",
			"kind": "ipc"
		},
		{
			"from": "cmp:MediaCard",
			"to": "ipc:mediaAssetUrl",
			"kind": "ipc"
		},
		{
			"from": "cmp:MediaCard",
			"to": "ipc:mediaGetThumbnail",
			"kind": "ipc"
		},
		{
			"from": "cmp:MediaCard",
			"to": "ipc:mediaSaveVideoThumbnail",
			"kind": "ipc"
		},
		{
			"from": "cmp:MediaCard",
			"to": "ipc:mediaSetVideoProbe",
			"kind": "ipc"
		},
		{
			"from": "cmp:MediaInspector",
			"to": "ipc:mediaAssetUrl",
			"kind": "ipc"
		}
	],
	"flows": [
		{
			"id": "import-media",
			"name": "Import Media files",
			"trigger": "Click 'Import...' button in MediaToolbar",
			"steps": [
				"cmd:media.addToGallery",
				"state:mediaState",
				"ipc:mediaPickImportSources",
				"ipc:mediaImport",
				"cmp:MediaProgressStrip"
			],
			"summary": "User clicks import; a file selector is displayed, and the selected assets are imported on the backend."
		},
		{
			"id": "create-folder",
			"name": "Create a Folder",
			"trigger": "Click '+' folder button in MediaSidebar",
			"steps": [
				"cmd:media.newFolder",
				"state:mediaState",
				"ipc:mediaCreateFolder",
				"ipc:mediaListTree",
				"cmp:MediaSidebar"
			],
			"summary": "Prompts for a folder name and creates it on disk, refreshing the tree hierarchy."
		},
		{
			"id": "lazy-load-thumb",
			"name": "Lazy-load image thumbnail",
			"trigger": "Scroll MediaGrid viewport window",
			"steps": [
				"cmp:MediaGrid",
				"cmp:MediaCard",
				"ipc:mediaGetThumbnail"
			],
			"summary": "When a card enters the viewport, the IntersectionObserver fires, requesting the cached JPG thumbnail from the backend."
		},
		{
			"id": "move-assets",
			"name": "Drag and drop move assets",
			"trigger": "Drag media card and drop onto sidebar folder",
			"steps": [
				"cmp:MediaCard",
				"cmp:MediaSidebar",
				"state:mediaState",
				"ipc:mediaMoveEntries",
				"ipc:mediaListItems",
				"cmp:MediaGrid"
			],
			"summary": "Dragging elements and dropping them onto a folder row triggers move calls on the backend, updating the grid list."
		},
		{
			"id": "add-tag",
			"name": "Add tag to selection",
			"trigger": "Press Enter inside tag input in MediaInspector",
			"steps": [
				"cmp:MediaInspector",
				"state:mediaState",
				"ipc:mediaSetTags",
				"ipc:mediaListAllTags",
				"cmp:MediaInspector"
			],
			"summary": "Appends a tag label to all multi-selected assets, refreshing the tag datalist in the inspector."
		},
		{
			"id": "trash-selection",
			"name": "Trash selected media",
			"trigger": "Keybinding Cmd+Backspace",
			"steps": [
				"cmd:media.trashSelection",
				"state:mediaState",
				"ipc:mediaTrashEntries",
				"ipc:mediaListItems",
				"cmp:MediaGrid"
			],
			"summary": "Deletes the selected media items from the library database and disk, updating the visible grid."
		},
		{
			"id": "rename-folder",
			"name": "Rename sidebar folder",
			"trigger": "Double click folder name in MediaSidebar",
			"steps": [
				"cmp:MediaSidebar",
				"state:mediaState",
				"ipc:mediaRenameEntry",
				"ipc:mediaListTree",
				"cmp:MediaSidebar"
			],
			"summary": "Prompts a name input to rename the chosen folder, refreshing the directory trees."
		}
	],
	"notes": [
		{
			"title": "Rich Undo/Redo Replay Model",
			"body": "Unlike pure layout-undo domains, mediaState implements a custom replay operation queue. Undoing folder creation, renaming, moving, or tagging triggers reverse backend IPC calls (e.g. rename back, delete folder, restore pins) to maintain database parity.",
			"severity": "warn",
			"path": "src/lib/modules/media/state/media.svelte.ts"
		},
		{
			"title": "IntersectionObserver Card Virtualisation",
			"body": "MediaCard defers loading thumbnails until it intersects the viewport. For videos, it seeks metadata, draws a frame onto an offscreen canvas, and generates/saves a JPEG thumbnail using IPC.",
			"severity": "info",
			"path": "src/lib/modules/media/components/MediaCard.svelte"
		},
		{
			"title": "Split Pane Layout via PaneForge",
			"body": "MediaLayout uses PaneGroup/Pane/PaneResizer components from the external paneforge package to manage collapsibles and drag resizing, rather than building custom resizing math like the notes or design modules.",
			"severity": "info",
			"path": "src/lib/modules/media/components/MediaLayout.svelte"
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
