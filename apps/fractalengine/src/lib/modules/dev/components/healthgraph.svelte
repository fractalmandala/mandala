<script>
	// @ts-nocheck — ported legacy renderer, checked at runtime via #err
	import { onMount } from 'svelte';
	const DATA = {
	"version": 1,
	"scan": "health",
	"project": {
		"name": "FractalEngine Studio",
		"slug": "fractalengine",
		"tagline": "Spatial canvas, notes wiki, and native IDE for creative developers",
		"date": "2026-07-18",
		"windowDays": 34,
		"commitCount": 147
	},
	"stats": {
		"files": 193,
		"loc": 55026,
		"commits": 110,
		"authors": 1
	},
	"notes": [
		{
			"title": "Core IDE State is a Churn and Complexity Hub",
			"body": "src/lib/state/ide.svelte.ts has 95% complexity and 2,384 LOC. It absorbed 32 commits and 5,778 lines changed, acting as a global mutable god-object that concentrates regression risk.",
			"severity": "alert",
			"path": "src/lib/state/ide.svelte.ts"
		},
		{
			"title": "High Parity Tax on Browser IPC Mocking",
			"body": "src/lib/ipc.ts and src/lib/ipc-mock.ts each had 30 commits. Every IPC endpoint addition requires a parallel mock change, adding significant maintenance overhead to keep the test suite green.",
			"severity": "warn",
			"path": "src/lib/ipc-mock.ts"
		},
		{
			"title": "Stable but Highly Complex Design Engine",
			"body": "src/lib/modules/designer/state/designcanvas.svelte.ts has 95% complexity but only 5 commits. While stable now, its 4,017 LOC of vector and SVG coordinate math makes future changes high risk.",
			"severity": "info",
			"path": "src/lib/modules/designer/state/designcanvas.svelte.ts"
		},
		{
			"title": "Concentrated Code Churn in Top Files",
			"body": "The top 3 files by churn (ide.svelte.ts, lib.rs, SettingsDialog.svelte) absorb 18.1% of all lines changed (15,150 lines), showing that risk is highly concentrated in a small set of modules.",
			"severity": "warn"
		},
		{
			"title": "Massive Native Rust Layer Complexity",
			"body": "src-tauri/src/lib.rs acts as the sole Rust command hub (2,997 LOC, 27 commits, 4,705 lines changed). Centralized state and command registrations make it a single point of native failure.",
			"severity": "warn",
			"path": "src-tauri/src/lib.rs"
		}
	],
	"files": [
		{
			"path": "src-tauri/src/lib.rs",
			"loc": 2997,
			"commits": 27,
			"linesChanged": 4705,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 60,
			"summary": "Core Rust native hub orchestrating system commands, file grants, and dictation."
		},
		{
			"path": "src/lib/state/ide.svelte.ts",
			"loc": 2384,
			"commits": 32,
			"linesChanged": 5778,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 95,
			"summary": "Global IDE workspace, editor buffers, and settings reactive state engine."
		},
		{
			"path": "src/lib/ipc-mock.ts",
			"loc": 2268,
			"commits": 30,
			"linesChanged": 2674,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 70,
			"summary": "Simulated in-memory browser fallback mock layer for all native Tauri APIs."
		},
		{
			"path": "src/lib/ipc.ts",
			"loc": 1396,
			"commits": 30,
			"linesChanged": 1820,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 48,
			"summary": "Single gateway router delegating API calls between Tauri and the browser mock."
		},
		{
			"path": "src/lib/components/SettingsDialog.svelte",
			"loc": 893,
			"commits": 24,
			"linesChanged": 4667,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 70,
			"summary": "Preferences modal governing editor, local AI, and media vault settings."
		},
		{
			"path": "src/lib/components/AIChat.svelte",
			"loc": 945,
			"commits": 22,
			"linesChanged": 2555,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 65,
			"summary": "AI Copilot panel managing chat turns, model selections, and autocompletion."
		},
		{
			"path": "src/lib/modules/designer/state/designcanvas.svelte.ts",
			"loc": 4017,
			"commits": 5,
			"linesChanged": 4171,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 95,
			"summary": "Vector design canvas state model owning shape trees, layout, and undo history."
		},
		{
			"path": "src/routes/+page.svelte",
			"loc": 502,
			"commits": 29,
			"linesChanged": 1934,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 65,
			"summary": "Application shell routing main headers, active templates, and layout docks."
		},
		{
			"path": "src/lib/styles/components/_ai.sass",
			"loc": 770,
			"commits": 14,
			"linesChanged": 1730,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 1,
			"summary": "Classic indented SASS style rules for the AI workspace panels and logs."
		},
		{
			"path": "src/lib/modules/designer/components/DesignInspector.svelte",
			"loc": 1813,
			"commits": 5,
			"linesChanged": 2303,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 65,
			"summary": "Figma-style sidebar inspector for multi-select block paint and stroke styles."
		},
		{
			"path": "src/lib/styles/_tokens.sass",
			"loc": 277,
			"commits": 29,
			"linesChanged": 701,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0,
			"summary": "Primitive and semantic CSS design tokens specifying the unified theme palette."
		},
		{
			"path": "src/lib/modules/notes/styles/_notes.sass",
			"loc": 675,
			"commits": 11,
			"linesChanged": 1425,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 1,
			"summary": "Styling rules for the collaborative notes editor and vault sidebar."
		},
		{
			"path": "src/lib/modules/designer/components/DesignLayout.svelte",
			"loc": 1329,
			"commits": 5,
			"linesChanged": 1415,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 90
		},
		{
			"path": "src/lib/styles/components/_layout.sass",
			"loc": 302,
			"commits": 21,
			"linesChanged": 752,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/styles/components/_ai-elements.sass",
			"loc": 528,
			"commits": 11,
			"linesChanged": 958,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/state/canvas.svelte.ts",
			"loc": 437,
			"commits": 11,
			"linesChanged": 595,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/notes/state/notes.svelte.ts",
			"loc": 795,
			"commits": 6,
			"linesChanged": 881,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 99
		},
		{
			"path": "src-tauri/src/storage.rs",
			"loc": 1399,
			"commits": 3,
			"linesChanged": 1449,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 10
		},
		{
			"path": "src/lib/modules/designer/styles/_designinspector.sass",
			"loc": 587,
			"commits": 7,
			"linesChanged": 689,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src-tauri/src/browser/mod.rs",
			"loc": 1016,
			"commits": 4,
			"linesChanged": 1066,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 35
		},
		{
			"path": "src-tauri/src/memory.rs",
			"loc": 491,
			"commits": 8,
			"linesChanged": 851,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 21
		},
		{
			"path": "src/routes/+layout.svelte",
			"loc": 168,
			"commits": 20,
			"linesChanged": 404,
			"authors": 1,
			"lastCommit": "2026-07-18",
			"complexity": 100
		},
		{
			"path": "src/lib/components/PromptInput.svelte",
			"loc": 670,
			"commits": 5,
			"linesChanged": 788,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 73
		},
		{
			"path": "src/lib/modules/ide/styles/_sidebar.sass",
			"loc": 302,
			"commits": 11,
			"linesChanged": 500,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/styles/_primitives.sass",
			"loc": 206,
			"commits": 16,
			"linesChanged": 512,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src-tauri/src/media.rs",
			"loc": 1614,
			"commits": 2,
			"linesChanged": 1630,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 46
		},
		{
			"path": "src/lib/components/CommandPalette.svelte",
			"loc": 219,
			"commits": 14,
			"linesChanged": 535,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 55
		},
		{
			"path": "src/lib/modules/designer/styles/_designcanvas.sass",
			"loc": 505,
			"commits": 6,
			"linesChanged": 571,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/styles/components/_settings.sass",
			"loc": 267,
			"commits": 9,
			"linesChanged": 583,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/styles/_typography.sass",
			"loc": 149,
			"commits": 14,
			"linesChanged": 301,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 3
		},
		{
			"path": "src/lib/modules/designer/engine/codegen.ts",
			"loc": 496,
			"commits": 4,
			"linesChanged": 518,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/notes/components/NotesEditor.svelte",
			"loc": 661,
			"commits": 3,
			"linesChanged": 671,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 54
		},
		{
			"path": "src-tauri/src/docs_index.rs",
			"loc": 472,
			"commits": 4,
			"linesChanged": 534,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 51
		},
		{
			"path": "src/lib/state/modelRegistry.svelte.ts",
			"loc": 373,
			"commits": 5,
			"linesChanged": 425,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 71
		},
		{
			"path": "src/lib/modules/designer/data/designtemplates.ts",
			"loc": 930,
			"commits": 2,
			"linesChanged": 932,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 1
		},
		{
			"path": "src/lib/modules/ide/components/ClassicIdeLayout.svelte",
			"loc": 220,
			"commits": 8,
			"linesChanged": 258,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 75
		},
		{
			"path": "src/lib/styles/_commons.sass",
			"loc": 236,
			"commits": 7,
			"linesChanged": 248,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 2
		},
		{
			"path": "src/lib/modules/notes/components/NotesLayout.svelte",
			"loc": 323,
			"commits": 5,
			"linesChanged": 347,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 68
		},
		{
			"path": "src/lib/data/templates.ts",
			"loc": 115,
			"commits": 14,
			"linesChanged": 211,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/ai/components/AiChatMain.svelte",
			"loc": 804,
			"commits": 2,
			"linesChanged": 804,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 63
		},
		{
			"path": "src/lib/modules/ide/components/TreeNode.svelte",
			"loc": 528,
			"commits": 3,
			"linesChanged": 534,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 84
		},
		{
			"path": "src/lib/modules/designer/components/DesignBlock.svelte",
			"loc": 455,
			"commits": 3,
			"linesChanged": 457,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 57
		},
		{
			"path": "src/lib/modules/ai/state/ai.svelte.ts",
			"loc": 332,
			"commits": 4,
			"linesChanged": 454,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 69
		},
		{
			"path": "src/lib/modules/browser/components/BrowserShell.svelte",
			"loc": 297,
			"commits": 4,
			"linesChanged": 325,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 59
		},
		{
			"path": "src/lib/components/Canvas.svelte",
			"loc": 220,
			"commits": 5,
			"linesChanged": 244,
			"authors": 1,
			"lastCommit": "2026-07-13",
			"complexity": 100
		},
		{
			"path": "src/lib/styles/components/_ai-data.sass",
			"loc": 157,
			"commits": 7,
			"linesChanged": 257,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/state/undo.svelte.ts",
			"loc": 78,
			"commits": 14,
			"linesChanged": 160,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 19
		},
		{
			"path": "src/lib/modules/fractaldocs/styles/_layout.sass",
			"loc": 267,
			"commits": 4,
			"linesChanged": 503,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/bookmarks/components/BookmarksLayout.svelte",
			"loc": 224,
			"commits": 4,
			"linesChanged": 516,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 40
		},
		{
			"path": "src/lib/modules/designer/styles/_componentlibrary.sass",
			"loc": 293,
			"commits": 3,
			"linesChanged": 391,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/designer/styles/_designtemplategallery.sass",
			"loc": 293,
			"commits": 3,
			"linesChanged": 369,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/fractaldocs/state/docs.svelte.ts",
			"loc": 291,
			"commits": 3,
			"linesChanged": 455,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 55
		},
		{
			"path": "src/lib/styles/index.sass",
			"loc": 46,
			"commits": 18,
			"linesChanged": 78,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/browser/state/browser.svelte.ts",
			"loc": 272,
			"commits": 3,
			"linesChanged": 274,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 81
		},
		{
			"path": "src/lib/components/ai-elements/ModelSelector.svelte",
			"loc": 163,
			"commits": 5,
			"linesChanged": 179,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 67
		},
		{
			"path": "src/lib/modules/designer/components/ComponentLibrary.svelte",
			"loc": 402,
			"commits": 2,
			"linesChanged": 428,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 65
		},
		{
			"path": "src/lib/components/SkillsMarketplace.svelte",
			"loc": 132,
			"commits": 6,
			"linesChanged": 218,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 64
		},
		{
			"path": "src/lib/components/Tile.svelte",
			"loc": 193,
			"commits": 4,
			"linesChanged": 219,
			"authors": 1,
			"lastCommit": "2026-07-13",
			"complexity": 70
		},
		{
			"path": "src/lib/modules/bookmarks/state/bookmarks.svelte.ts",
			"loc": 251,
			"commits": 3,
			"linesChanged": 329,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 72
		},
		{
			"path": "src/lib/modules/bookmarks/styles/_bookmarks.sass",
			"loc": 186,
			"commits": 4,
			"linesChanged": 246,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/designer/styles/_exportpanel.sass",
			"loc": 177,
			"commits": 4,
			"linesChanged": 237,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/browser/styles/_browser-shell.sass",
			"loc": 234,
			"commits": 3,
			"linesChanged": 234,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 6
		},
		{
			"path": "src/lib/modules/ide/styles/_editor.sass",
			"loc": 139,
			"commits": 5,
			"linesChanged": 225,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 4
		},
		{
			"path": "src/lib/modules/designer/engine/CanvasViewport.svelte.ts",
			"loc": 346,
			"commits": 2,
			"linesChanged": 346,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 20
		},
		{
			"path": "src/lib/modules/ai/styles/_ai-sidebar.sass",
			"loc": 114,
			"commits": 6,
			"linesChanged": 343,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/styles/components/_templategallery.sass",
			"loc": 73,
			"commits": 9,
			"linesChanged": 439,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/ai/components/AiLayout.svelte",
			"loc": 130,
			"commits": 5,
			"linesChanged": 244,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 38
		},
		{
			"path": "src/lib/components/SearchOverlay.svelte",
			"loc": 160,
			"commits": 4,
			"linesChanged": 206,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 88
		},
		{
			"path": "src/lib/modules/designer/engine/paint.ts",
			"loc": 640,
			"commits": 1,
			"linesChanged": 640,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/media/state/media.svelte.ts",
			"loc": 210,
			"commits": 3,
			"linesChanged": 238,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 98
		},
		{
			"path": "src/lib/modules/designer/styles/_designblock.sass",
			"loc": 151,
			"commits": 4,
			"linesChanged": 165,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/designer/engine/ResizeEngine.svelte.ts",
			"loc": 291,
			"commits": 2,
			"linesChanged": 293,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 82
		},
		{
			"path": "src/lib/modules/designer/engine/patterns.ts",
			"loc": 562,
			"commits": 1,
			"linesChanged": 562,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 1
		},
		{
			"path": "src/lib/components/ModelMarketplace.svelte",
			"loc": 92,
			"commits": 6,
			"linesChanged": 172,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 49
		},
		{
			"path": "src/lib/state/contributions.svelte.ts",
			"loc": 136,
			"commits": 4,
			"linesChanged": 148,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 70
		},
		{
			"path": "src/lib/modules/ide/components/Editor.svelte",
			"loc": 180,
			"commits": 3,
			"linesChanged": 240,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 97
		},
		{
			"path": "src/lib/state/app.svelte.ts",
			"loc": 127,
			"commits": 4,
			"linesChanged": 133,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 91
		},
		{
			"path": "src/lib/components/VirtualList.svelte",
			"loc": 125,
			"commits": 4,
			"linesChanged": 141,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 72
		},
		{
			"path": "src/lib/styles/components/_dock.sass",
			"loc": 99,
			"commits": 5,
			"linesChanged": 177,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/editorTheme.ts",
			"loc": 163,
			"commits": 3,
			"linesChanged": 169,
			"authors": 1,
			"lastCommit": "2026-06-25",
			"complexity": 77
		},
		{
			"path": "src/lib/styles/components/_commandpalette.sass",
			"loc": 121,
			"commits": 4,
			"linesChanged": 189,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/designer/styles/_layers.sass",
			"loc": 154,
			"commits": 3,
			"linesChanged": 188,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/styles/components/_searchoverlay.sass",
			"loc": 92,
			"commits": 5,
			"linesChanged": 128,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/browser/components/Omnibox.svelte",
			"loc": 152,
			"commits": 3,
			"linesChanged": 212,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 86
		},
		{
			"path": "src-tauri/Cargo.toml",
			"loc": 49,
			"commits": 9,
			"linesChanged": 61,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/components/TileDock.svelte",
			"loc": 110,
			"commits": 4,
			"linesChanged": 124,
			"authors": 1,
			"lastCommit": "2026-07-13",
			"complexity": 18
		},
		{
			"path": "src/lib/modules/designer/engine/svgpath.ts",
			"loc": 432,
			"commits": 1,
			"linesChanged": 432,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 87
		},
		{
			"path": "src/lib/components/ai-elements/Code.svelte",
			"loc": 107,
			"commits": 4,
			"linesChanged": 159,
			"authors": 1,
			"lastCommit": "2026-07-13",
			"complexity": 56
		},
		{
			"path": "src/lib/modules/browser/styles/_vault.sass",
			"loc": 209,
			"commits": 2,
			"linesChanged": 215,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 5
		},
		{
			"path": "src/lib/modules/ai/styles/_ai-chat-column.sass",
			"loc": 83,
			"commits": 5,
			"linesChanged": 199,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/styles/components/_tile.sass",
			"loc": 83,
			"commits": 5,
			"linesChanged": 137,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/designer/engine/designblock.ts",
			"loc": 407,
			"commits": 1,
			"linesChanged": 407,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 54
		},
		{
			"path": "src/lib/modules/ide/styles/_terminal.sass",
			"loc": 128,
			"commits": 3,
			"linesChanged": 152,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/components/ai-elements/Mermaid.svelte",
			"loc": 94,
			"commits": 4,
			"linesChanged": 108,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 48
		},
		{
			"path": "src/lib/modules/ai/components/AiSidebar.svelte",
			"loc": 94,
			"commits": 4,
			"linesChanged": 250,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 32
		},
		{
			"path": "src/lib/modules/browser/state/vault.svelte.ts",
			"loc": 364,
			"commits": 1,
			"linesChanged": 364,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/designer/components/Layers.svelte",
			"loc": 357,
			"commits": 1,
			"linesChanged": 357,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 77
		},
		{
			"path": "src/lib/styles/_globals.sass",
			"loc": 51,
			"commits": 7,
			"linesChanged": 73,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/state/coreContributions.ts",
			"loc": 71,
			"commits": 5,
			"linesChanged": 77,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 7
		},
		{
			"path": "src/lib/styles/components/_draggable.sass",
			"loc": 88,
			"commits": 4,
			"linesChanged": 122,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/fractaldocs/components/DocsLayout.svelte",
			"loc": 109,
			"commits": 3,
			"linesChanged": 145,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 28
		},
		{
			"path": "src/lib/modules/fractaldocs/components/DocsSidebarLeft.svelte",
			"loc": 65,
			"commits": 5,
			"linesChanged": 121,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 69
		},
		{
			"path": "src/lib/modules/notes/components/NotesSidebar2.svelte",
			"loc": 108,
			"commits": 3,
			"linesChanged": 132,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 69
		},
		{
			"path": "src/lib/components/Minimap.svelte",
			"loc": 158,
			"commits": 2,
			"linesChanged": 160,
			"authors": 1,
			"lastCommit": "2026-07-13",
			"complexity": 22
		},
		{
			"path": "src-tauri/src/crypto.rs",
			"loc": 153,
			"commits": 2,
			"linesChanged": 157,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 29
		},
		{
			"path": "src/lib/modules/designer/components/ExportPanel.svelte",
			"loc": 305,
			"commits": 1,
			"linesChanged": 305,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 56
		},
		{
			"path": "src/lib/modules/designer/engine/DragEngine.svelte.ts",
			"loc": 304,
			"commits": 1,
			"linesChanged": 304,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 43
		},
		{
			"path": "src/lib/modules/designer/engine/designtypes.ts",
			"loc": 291,
			"commits": 1,
			"linesChanged": 291,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 46
		},
		{
			"path": "src/lib/modules/ai/styles/_ai-work-panel.sass",
			"loc": 58,
			"commits": 5,
			"linesChanged": 128,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/components/ai-elements/Response.svelte",
			"loc": 71,
			"commits": 4,
			"linesChanged": 97,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 77
		},
		{
			"path": "src-tauri/src/browser/session.rs",
			"loc": 276,
			"commits": 1,
			"linesChanged": 276,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 20
		},
		{
			"path": "src/lib/components/AppDock.svelte",
			"loc": 53,
			"commits": 5,
			"linesChanged": 85,
			"authors": 1,
			"lastCommit": "2026-07-13",
			"complexity": 47
		},
		{
			"path": "src/lib/data/tileKinds.ts",
			"loc": 53,
			"commits": 5,
			"linesChanged": 71,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 19
		},
		{
			"path": "src/lib/modules/designer/state/design.svelte.ts",
			"loc": 131,
			"commits": 2,
			"linesChanged": 203,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 46
		},
		{
			"path": "src/lib/modules/designer/engine/SelectionEngine.svelte.ts",
			"loc": 261,
			"commits": 1,
			"linesChanged": 261,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 65
		},
		{
			"path": "src/lib/state/undoHistory.svelte.ts",
			"loc": 125,
			"commits": 2,
			"linesChanged": 129,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 64
		},
		{
			"path": "src/lib/modules/browser/styles/_omnibox.sass",
			"loc": 121,
			"commits": 2,
			"linesChanged": 121,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/ide/components/Sidebar.svelte",
			"loc": 40,
			"commits": 6,
			"linesChanged": 64,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 62
		},
		{
			"path": "src/lib/modules/fractaldocs/components/DocsSidebarRight.svelte",
			"loc": 47,
			"commits": 5,
			"linesChanged": 71,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 43
		},
		{
			"path": "src/lib/modules/designer/components/Dock.svelte",
			"loc": 229,
			"commits": 1,
			"linesChanged": 229,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 44
		},
		{
			"path": "src/lib/modules/designer/engine/autoscroll.ts",
			"loc": 218,
			"commits": 1,
			"linesChanged": 218,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/media/styles/_media.sass",
			"loc": 215,
			"commits": 1,
			"linesChanged": 215,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/state/shell.svelte.ts",
			"loc": 66,
			"commits": 3,
			"linesChanged": 66,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 30
		},
		{
			"path": "src/lib/components/ai-elements/context/Context.svelte",
			"loc": 48,
			"commits": 4,
			"linesChanged": 58,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 73
		},
		{
			"path": "src/lib/state/dictation.svelte.ts",
			"loc": 188,
			"commits": 1,
			"linesChanged": 188,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/ide/fileIcons.ts",
			"loc": 175,
			"commits": 1,
			"linesChanged": 175,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 37
		},
		{
			"path": "src/lib/styles/components/_minimap.sass",
			"loc": 53,
			"commits": 3,
			"linesChanged": 97,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/designer/engine/RotateEngine.svelte.ts",
			"loc": 156,
			"commits": 1,
			"linesChanged": 156,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 29
		},
		{
			"path": "src/lib/totp.ts",
			"loc": 156,
			"commits": 1,
			"linesChanged": 156,
			"authors": 1,
			"lastCommit": "2026-06-24",
			"complexity": 48
		},
		{
			"path": "src/routes/browser/+page.svelte",
			"loc": 31,
			"commits": 5,
			"linesChanged": 81,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 97
		},
		{
			"path": "src/lib/modules/ai/styles/_ai-layout.sass",
			"loc": 76,
			"commits": 2,
			"linesChanged": 78,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/browser/styles/_history.sass",
			"loc": 145,
			"commits": 1,
			"linesChanged": 145,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/components/ai-elements/Reasoning.svelte",
			"loc": 71,
			"commits": 2,
			"linesChanged": 73,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 77
		},
		{
			"path": "src/lib/modules/browser/state/history.svelte.ts",
			"loc": 139,
			"commits": 1,
			"linesChanged": 139,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 54
		},
		{
			"path": "src/lib/modules/designer/engine/typography.ts",
			"loc": 133,
			"commits": 1,
			"linesChanged": 133,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 64
		},
		{
			"path": "src/lib/modules/browser/components/vault/VaultPopover.svelte",
			"loc": 122,
			"commits": 1,
			"linesChanged": 122,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 61
		},
		{
			"path": "src/lib/modules/browser/components/vault/VaultForm.svelte",
			"loc": 120,
			"commits": 1,
			"linesChanged": 120,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 75
		},
		{
			"path": "src/lib/modules/browser/styles/_tabstrip.sass",
			"loc": 116,
			"commits": 1,
			"linesChanged": 116,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src-tauri/native/dictation_bridge.swift",
			"loc": 115,
			"commits": 1,
			"linesChanged": 115,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 48
		},
		{
			"path": "src/lib/modules/notes/components/VaultTreeNode.svelte",
			"loc": 56,
			"commits": 2,
			"linesChanged": 60,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 71
		},
		{
			"path": "src/lib/modules/designer/contributions.ts",
			"loc": 27,
			"commits": 4,
			"linesChanged": 33,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/ai/components/WorkPanel.svelte",
			"loc": 35,
			"commits": 3,
			"linesChanged": 47,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 57
		},
		{
			"path": "src/lib/modules/browser/state/overlayCoordinator.svelte.ts",
			"loc": 52,
			"commits": 2,
			"linesChanged": 84,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 48
		},
		{
			"path": "src/lib/modules/browser/state/registrableDomain.ts",
			"loc": 101,
			"commits": 1,
			"linesChanged": 101,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/browser/components/BrowserLauncherCard.svelte",
			"loc": 50,
			"commits": 2,
			"linesChanged": 70,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 60
		},
		{
			"path": "src/lib/modules/browser/components/HistoryPanel.svelte",
			"loc": 100,
			"commits": 1,
			"linesChanged": 100,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 70
		},
		{
			"path": "src/lib/styles/components/_appdock.sass",
			"loc": 20,
			"commits": 5,
			"linesChanged": 28,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/browser/components/BookmarkStar.svelte",
			"loc": 99,
			"commits": 1,
			"linesChanged": 99,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 61
		},
		{
			"path": "src/lib/modules/ai/components/SessionRow.svelte",
			"loc": 49,
			"commits": 2,
			"linesChanged": 59,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 61
		},
		{
			"path": "src-tauri/src/dictation.rs",
			"loc": 96,
			"commits": 1,
			"linesChanged": 96,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 47
		},
		{
			"path": "src/lib/sanitizeHtml.ts",
			"loc": 47,
			"commits": 2,
			"linesChanged": 79,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 21
		},
		{
			"path": "src/lib/components/HomeTilesLayout.svelte",
			"loc": 31,
			"commits": 3,
			"linesChanged": 55,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 65
		},
		{
			"path": "src/lib/modules/browser/types.ts",
			"loc": 93,
			"commits": 1,
			"linesChanged": 93,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 5
		},
		{
			"path": "src/lib/modules/media/types.ts",
			"loc": 92,
			"commits": 1,
			"linesChanged": 92,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 16
		},
		{
			"path": "src/lib/data/aiProviders.ts",
			"loc": 22,
			"commits": 4,
			"linesChanged": 82,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/media/components/MediaLayout.svelte",
			"loc": 44,
			"commits": 2,
			"linesChanged": 46,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 68
		},
		{
			"path": "src/lib/modules/fractaldocs/components/DocsContent.svelte",
			"loc": 27,
			"commits": 3,
			"linesChanged": 73,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 100
		},
		{
			"path": "src/lib/state/modelRegistry.contract.ts",
			"loc": 79,
			"commits": 1,
			"linesChanged": 79,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 6
		},
		{
			"path": "src/lib/modules/browser/state/suggestions.svelte.ts",
			"loc": 78,
			"commits": 1,
			"linesChanged": 78,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 45
		},
		{
			"path": "src/lib/modules/browser/components/vault/VaultList.svelte",
			"loc": 77,
			"commits": 1,
			"linesChanged": 77,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 78
		},
		{
			"path": "src/lib/data/modelContextWindows.ts",
			"loc": 75,
			"commits": 1,
			"linesChanged": 75,
			"authors": 1,
			"lastCommit": "2026-06-25",
			"complexity": 47
		},
		{
			"path": "src/lib/modules/ai/components/ChatColumn.svelte",
			"loc": 37,
			"commits": 2,
			"linesChanged": 75,
			"authors": 1,
			"lastCommit": "2026-07-16",
			"complexity": 41
		},
		{
			"path": "src/lib/styles/components/_canvas.sass",
			"loc": 37,
			"commits": 2,
			"linesChanged": 43,
			"authors": 1,
			"lastCommit": "2026-07-13",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/browser/components/BrowserMenu.svelte",
			"loc": 73,
			"commits": 1,
			"linesChanged": 73,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 27
		},
		{
			"path": "src/lib/components/ai-elements/Conversation.svelte",
			"loc": 71,
			"commits": 1,
			"linesChanged": 71,
			"authors": 1,
			"lastCommit": "2026-06-25",
			"complexity": 70
		},
		{
			"path": "src/lib/modules/browser/components/TabStrip.svelte",
			"loc": 71,
			"commits": 1,
			"linesChanged": 71,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 35
		},
		{
			"path": "src/lib/modules/browser/state/bookmarks.svelte.ts",
			"loc": 65,
			"commits": 1,
			"linesChanged": 65,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 38
		},
		{
			"path": "src/lib/globalstores.svelte.ts",
			"loc": 32,
			"commits": 2,
			"linesChanged": 38,
			"authors": 1,
			"lastCommit": "2026-07-13",
			"complexity": 78
		},
		{
			"path": "src/lib/modules/browser/components/BrowserConfirm.svelte",
			"loc": 62,
			"commits": 1,
			"linesChanged": 62,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 32
		},
		{
			"path": "src/lib/modules/designer/engine/designstores.svelte.ts",
			"loc": 59,
			"commits": 1,
			"linesChanged": 59,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 34
		},
		{
			"path": "src/lib/modules/notes/frontmatter.ts",
			"loc": 59,
			"commits": 1,
			"linesChanged": 59,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/media/components/MediaSidebar.svelte",
			"loc": 29,
			"commits": 2,
			"linesChanged": 33,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/media/contributions.ts",
			"loc": 29,
			"commits": 2,
			"linesChanged": 31,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/notes/components/NotesSidebar1.svelte",
			"loc": 29,
			"commits": 2,
			"linesChanged": 31,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 34
		},
		{
			"path": "src/lib/modules/media/components/MediaCard.svelte",
			"loc": 28,
			"commits": 2,
			"linesChanged": 34,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 100
		},
		{
			"path": "src/lib/modules/browser/components/NavControls.svelte",
			"loc": 55,
			"commits": 1,
			"linesChanged": 55,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/modules/ide/components/Terminal.svelte",
			"loc": 54,
			"commits": 1,
			"linesChanged": 54,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 46
		},
		{
			"path": "src/lib/fractalui/bits-tooltip.svelte",
			"loc": 53,
			"commits": 1,
			"linesChanged": 53,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 19
		},
		{
			"path": "src-tauri/build.rs",
			"loc": 26,
			"commits": 2,
			"linesChanged": 26,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 19
		},
		{
			"path": "src/lib/modules/media/components/MediaGrid.svelte",
			"loc": 25,
			"commits": 2,
			"linesChanged": 31,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 100
		},
		{
			"path": "src/lib/styles/components/_tooltip.sass",
			"loc": 49,
			"commits": 1,
			"linesChanged": 49,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 10
		},
		{
			"path": "src/lib/modules/notes/contributions.ts",
			"loc": 24,
			"commits": 2,
			"linesChanged": 30,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/components/ai-elements/CopyButton.svelte",
			"loc": 47,
			"commits": 1,
			"linesChanged": 47,
			"authors": 1,
			"lastCommit": "2026-06-25",
			"complexity": 32
		},
		{
			"path": "src/lib/components/ai-elements/types.ts",
			"loc": 22,
			"commits": 2,
			"linesChanged": 22,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 23
		},
		{
			"path": "src/lib/modules/browser/components/BookmarksRow.svelte",
			"loc": 44,
			"commits": 1,
			"linesChanged": 44,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 57
		},
		{
			"path": "src/lib/actions/focusTrap.ts",
			"loc": 43,
			"commits": 1,
			"linesChanged": 43,
			"authors": 1,
			"lastCommit": "2026-07-12",
			"complexity": 81
		},
		{
			"path": "src/lib/components/ai-elements/Actions.svelte",
			"loc": 39,
			"commits": 1,
			"linesChanged": 39,
			"authors": 1,
			"lastCommit": "2026-06-25",
			"complexity": 77
		},
		{
			"path": "src/lib/fractalui/animated-logo.svelte",
			"loc": 39,
			"commits": 1,
			"linesChanged": 39,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 0
		},
		{
			"path": "src/lib/fractalui/bits-dropdown.svelte",
			"loc": 39,
			"commits": 1,
			"linesChanged": 39,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 13
		},
		{
			"path": "src/lib/modules/browser/components/showConfirm.ts",
			"loc": 31,
			"commits": 1,
			"linesChanged": 31,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 32
		},
		{
			"path": "src/lib/modules/browser/contributions.ts",
			"loc": 29,
			"commits": 1,
			"linesChanged": 29,
			"authors": 1,
			"lastCommit": "2026-07-17",
			"complexity": 17
		},
		{
			"path": "src/lib/modules/bookmarks/contributions.ts",
			"loc": 25,
			"commits": 1,
			"linesChanged": 25,
			"authors": 1,
			"lastCommit": "2026-07-15",
			"complexity": 0
		},
		{
			"path": "src/lib/styles/_mixins.sass",
			"loc": 24,
			"commits": 1,
			"linesChanged": 24,
			"authors": 1,
			"lastCommit": "2026-06-24",
			"complexity": 42
		}
	]
};

		let { activated = false } = $props();
	const CDN = ["https://cdn.jsdelivr.net/npm/d3-hierarchy@3.1.2/dist/d3-hierarchy.min.js"];
	function loadScript(src) {
		return new Promise((resolve, reject) => {
			const el = document.createElement('script');
			el.src = src;
			el.onload = () => resolve();
			el.onerror = () => reject(new Error('failed to load ' + src));
			document.head.appendChild(el);
		});
	}
	onMount(() => {
		let destroyed = false;
		const run = () => {
			if (destroyed) return;

"use strict";

/* ============================================================
   Code Health scan renderer — treemap heatmap (foglamp family)
   ============================================================ */

// DATA injected by component scope

const ICONS = {
  pulse: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21a1 1 0 0 1 -.9 -.55l-4.1-8.45h-2.9a1 1 0 1 1 0-2h3.5a1 1 0 0 1 .9 .55l3.5 7.22l4.42-11.04a1 1 0 0 1 1.86 .06l2.32 6.21h2.5a1 1 0 1 1 0 2h-3a1 1 0 0 1 -.93 -.63l-1.61-4.3l-4.42 11.37a1 1 0 0 1 -.95 .56z"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a1 1 0 0 1 .93 .63c.5 1.24 1.57 2.87 2.57 4.37c1.1 1.65 2.5 3.5 2.5 6a6 6 0 0 1 -12 0c0-1.57 .5-2.96 1.19-4.22a1 1 0 0 1 1.72 .4c.13 .47 .37 1.02 .72 1.52c.32-1.4 1.13-3.13 2.44-4.83a9.6 9.6 0 0 0 .93-3.24z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20zm3.5 5.5l-2 5a1 1 0 0 1 -.5 .5l-5 2a1 1 0 0 1 -1.3-1.3l2-5a1 1 0 0 1 .5-.5l5-2a1 1 0 0 1 1.3 1.3z"/></svg>',
};
document.getElementById("brand-icon").innerHTML = ICONS.pulse;

const EXT_COLORS = { ts:"#3178c6", js:"#f7df1e", svelte:"#ff3e00", rs:"#dea584", sass:"#cd6799", scss:"#cd6799", css:"#663399", toml:"#9c4221", swift:"#f05138", py:"#3572a5", json:"#a3a3a3", md:"#a3a3a3", html:"#e34c26", go:"#00add8" };
const SEV_COLORS = { alert:"#f43f5e", warn:"#f59e0b", info:"#0ea5e9" };

/* ---------- derived metrics (computed uniformly by renderer) ---------- */
const files = DATA.files.map((f) => ({ ...f, name: f.path.split("/").pop(), dir: f.path.split("/").slice(0, -1).join("/") || "." }));
const maxCommits = Math.max(...files.map((f) => f.commits), 1);
const maxChanged = Math.max(...files.map((f) => f.linesChanged), 1);
const normLog = (v, max) => Math.log1p(v) / Math.log1p(max);

for (const f of files) {
  f.nChurn = normLog(f.commits, maxCommits);
  f.nChanged = normLog(f.linesChanged, maxChanged);
  f.nComplex = f.complexity / 100;
  f.risk = Math.round(100 * (0.45 * f.nChurn + 0.35 * f.nComplex + 0.20 * f.nChanged));
}
const byPath = new Map(files.map((f) => [f.path, f]));

let colorMode = "risk";
const metricOf = (f) => colorMode === "risk" ? f.risk / 100 : colorMode === "churn" ? f.nChurn : f.nComplex;

/* percentile stretch per mode: guarantees full color spread across the map */
const pctCache = new Map();
function percentileMaps(mode) {
  if (!pctCache.has(mode)) {
    const sorted = [...files].sort((a, b) =>
      (mode === "risk" ? a.risk : mode === "churn" ? a.nChurn : a.nComplex) -
      (mode === "risk" ? b.risk : mode === "churn" ? b.nChurn : b.nComplex));
    const m = new Map();
    sorted.forEach((f, i) => m.set(f.path, sorted.length > 1 ? i / (sorted.length - 1) : 0.5));
    pctCache.set(mode, m);
  }
  return pctCache.get(mode);
}
const colorT = (f) => percentileMaps(colorMode).get(f.path) ?? metricOf(f);

/* green -> amber -> rose ramp */
function ramp(t) {
  const stops = [[16,185,129],[245,158,11],[244,63,94]];
  const x = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
  const i = Math.min(Math.floor(x), stops.length - 2);
  const u = x - i;
  const c = stops[i].map((a, k) => Math.round(a + (stops[i + 1][k] - a) * u));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function tileColors(f) {
  const c = ramp(colorT(f));
  return { bg: c.replace("rgb", "rgba").replace(")", ",0.28)"), border: c.replace("rgb", "rgba").replace(")", ",0.6)"), text: c };
}

/* ---------- hierarchy ---------- */
function buildTree(list) {
  const root = { name: DATA.project.slug || "root", children: new Map(), files: [] };
  for (const f of list) {
    const parts = f.path.split("/");
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node.children.has(parts[i])) node.children.set(parts[i], { name: parts[i], children: new Map(), files: [] });
      node = node.children.get(parts[i]);
    }
    node.files.push(f);
  }
  const toHierarchy = (node, path) => {
    const kids = [...node.children.values()].map((c) => toHierarchy(c, path ? path + "/" + c.name : c.name));
    const leaves = node.files.map((f) => ({ name: f.name, value: f.loc, file: f, path: f.path }));
    return { name: node.name, path: path || node.name, children: [...kids, ...leaves] };
  };
  return toHierarchy(root, "");
}

let currentRoot = null;   // hierarchy node being viewed
let rootHierarchy = null;

function hierarchyFrom(tree) {
  const h = d3.hierarchy(tree, (d) => d.children)
    .sum((d) => d.value || 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));
  h.each((n) => { n.path = n.data.path ?? (n.data.file ? n.data.file.path : ""); });
  return h;
}

/* ---------- treemap render ---------- */
const mapEl = document.getElementById("map");
const tooltip = document.getElementById("tooltip");
const popover = document.getElementById("popover");
let leafEls = new Map();

function renderMap() {
  const w = mapEl.clientWidth, h = mapEl.clientHeight;
  if (!w || !h) return;
  mapEl.innerHTML = "";
  leafEls = new Map();

  d3.treemap()
    .tile(d3.treemapSquarify.ratio(1))
    .size([w, h])
    .paddingInner(3)
    .paddingLeft((d) => (d.depth === 0 ? 0 : 4))
    .paddingRight((d) => (d.depth === 0 ? 0 : 4))
    .paddingBottom((d) => (d.depth === 0 ? 0 : 4))
    .paddingTop((d) => (d.depth === 0 ? 0 : d.depth <= 2 ? 20 : 6))
    (currentRoot);

  const frag = document.createDocumentFragment();

  currentRoot.descendants().forEach((d) => {
    const x = d.x0, y = d.y0, dw = d.x1 - d.x0, dh = d.y1 - d.y0;
    if (dw < 2 || dh < 2) return;
    if (d.children) {
      if (d.depth === 0) return;
      const div = document.createElement("div");
      div.className = "tm-dir depth-" + Math.min(d.depth, 3);
      div.style.cssText = `left:${x}px;top:${y}px;width:${dw}px;height:${dh}px`;
      if (d.depth <= 2 && dw >= 44 && dh >= 24) {
        div.innerHTML = `<span class="tm-dlabel" title="zoom into ${escapeHTML(d.path)}">${escapeHTML(d.data.name)}</span>`;
        div.querySelector(".tm-dlabel").addEventListener("click", (e) => {
          e.stopPropagation();
          zoomTo(d);
        });
      }
      frag.appendChild(div);
    } else if (d.data.file) {
      const f = d.data.file;
      const c = tileColors(f);
      const div = document.createElement("div");
      div.className = "tm-leaf";
      div.style.cssText = `left:${x}px;top:${y}px;width:${dw}px;height:${dh}px;background:${c.bg};border-color:${c.border};animation-delay:${Math.min(d.x0 / w * 0.35, 0.35)}s`;
      if (dw > 66 && dh > 30) {
        div.innerHTML = `<span class="tm-lname" style="color:${c.text}">${escapeHTML(f.name)}</span>` +
          (dh > 44 ? `<span class="tm-lsub">${fmtNum(f.loc)} loc · ${f.commits}c</span>` : "");
      } else if (dw > 34 && dh > 18) {
        div.innerHTML = `<span class="tm-lname" style="color:${c.text};font-size:9.5px;top:3px;left:5px">${escapeHTML(f.name)}</span>`;
      }
      div.addEventListener("pointerenter", (e) => showTooltip(f, e));
      div.addEventListener("pointermove", (e) => moveTooltip(e));
      div.addEventListener("pointerleave", hideTooltip);
      div.addEventListener("click", (e) => { e.stopPropagation(); showPopover(f, e.clientX, e.clientY); });
      frag.appendChild(div);
      leafEls.set(f.path, div);
    }
  });

  mapEl.appendChild(frag);
  renderCrumbs();
}

function zoomTo(node) {
  // rebuild a treemap root from this subtree
  const sub = d3.hierarchy(node.data, (d) => d.children)
    .sum((d) => d.value || 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));
  sub.each((n) => { n.path = n.data.path ?? (n.data.file ? n.data.file.path : ""); });
  currentRoot = sub;
  hidePopover();
  renderMap();
}

function renderCrumbs() {
  const el = document.getElementById("crumbs");
  const chain = [];
  let n = currentRoot;
  const parts = currentRoot.path ? currentRoot.path.split("/") : [];
  el.innerHTML = "";
  const mk = (label, path, isCurrent) => {
    const b = document.createElement("button");
    b.className = "crumb" + (isCurrent ? " current" : "");
    b.textContent = label;
    if (!isCurrent) b.addEventListener("click", () => zoomToPath(path));
    return b;
  };
  el.appendChild(mk(DATA.project.slug || "root", "", parts.length === 0));
  parts.forEach((p, i) => {
    const sep = document.createElement("span"); sep.className = "crumb-sep"; sep.textContent = "/";
    el.appendChild(sep);
    el.appendChild(mk(p, parts.slice(0, i + 1).join("/"), i === parts.length - 1));
  });
}
function zoomToPath(path) {
  if (!path) { currentRoot = rootHierarchy; hidePopover(); renderMap(); return; }
  const target = rootHierarchy.descendants().find((d) => d.children && d.path === path);
  if (target) zoomTo(target);
}

/* ---------- tooltip ---------- */
function showTooltip(f, e) {
  const c = tileColors(f);
  tooltip.innerHTML = `
    <div class="t-name">${escapeHTML(f.name)}</div>
    <div class="t-path">${escapeHTML(f.path)}</div>
    <div class="t-row">
      <span><b>${fmtNum(f.loc)}</b> <span class="t-dim">loc</span></span>
      <span><b>${f.commits}</b> <span class="t-dim">commits</span></span>
      <span><b>${fmtNum(f.linesChanged)}</b> <span class="t-dim">changed</span></span>
      <span><b style="color:${c.text}">${f.risk}</b> <span class="t-dim">risk</span></span>
    </div>`;
  tooltip.style.opacity = "1";
  moveTooltip(e);
}
function moveTooltip(e) {
  const r = tooltip.getBoundingClientRect();
  let x = e.clientX + 14, y = e.clientY + 14;
  if (x + r.width > innerWidth - 10) x = e.clientX - r.width - 14;
  if (y + r.height > innerHeight - 10) y = e.clientY - r.height - 14;
  tooltip.style.left = x + "px"; tooltip.style.top = y + "px";
}
const hideTooltip = () => (tooltip.style.opacity = "0");

/* ---------- popover ---------- */
function showPopover(f, cx, cy) {
  const ext = f.name.includes(".") ? f.name.split(".").pop() : "";
  const c = tileColors(f);
  const dotColor = EXT_COLORS[ext] || "#a3a3a3";
  popover.innerHTML = `
    <div class="p-kind"><span class="p-dot" style="background:${dotColor}"></span>${ext || "file"} · <span style="color:${c.text}">risk ${f.risk}</span></div>
    <div class="p-label">${escapeHTML(f.name)}</div>
    ${f.summary ? `<p class="p-summary">${escapeHTML(f.summary)}</p>` : ""}
    <div class="p-grid">
      <div class="p-metric"><b>${fmtNum(f.loc)}</b><span>lines</span></div>
      <div class="p-metric"><b>${f.commits}</b><span>commits</span></div>
      <div class="p-metric"><b>${fmtNum(f.linesChanged)}</b><span>changed</span></div>
      <div class="p-metric"><b>${f.complexity}</b><span>complexity</span></div>
      <div class="p-metric"><b>${f.authors}</b><span>authors</span></div>
      <div class="p-metric"><b>${f.lastCommit || "—"}</b><span>last touch</span></div>
    </div>
    <p class="p-path">${escapeHTML(f.path)}</p>`;
  popover.classList.add("show");
  const r = popover.getBoundingClientRect();
  let x = Math.min(Math.max(12, cx + 12), innerWidth - r.width - 12);
  let y = Math.min(Math.max(12, cy + 12), innerHeight - r.height - 12);
  popover.style.left = x + "px"; popover.style.top = y + "px";
}
const hidePopover = () => popover.classList.remove("show");
addEventListener("pointerdown", (e) => {
  if (!popover.contains(e.target) && !e.target.closest(".tm-leaf") && !e.target.closest(".hot-row")) hidePopover();
});

/* ---------- rail ---------- */
function buildRail() {
  const hot = [...files].sort((a, b) => b.risk - a.risk).slice(0, 8);
  const el = document.getElementById("hotspots");
  hot.forEach((f, i) => {
    const c = ramp(f.risk / 100);
    const row = document.createElement("div");
    row.className = "hot-row";
    row.innerHTML = `
      <span class="hot-rank">${i + 1}</span>
      <span class="hot-body">
        <span class="hot-name">${escapeHTML(f.name)}</span>
        <span class="hot-bar"><i style="width:${f.risk}%;background:${c}"></i></span>
      </span>
      <span class="hot-val" style="color:${c}">${f.risk}</span>`;
    row.title = f.path;
    row.addEventListener("click", () => {
      // drill to the file's directory, then flash + popover
      const dirPath = f.dir === "." ? "" : f.dir;
      const target = dirPath
        ? rootHierarchy.descendants().find((d) => d.children && d.path === dirPath)
        : null;
      if (target) zoomTo(target); else { currentRoot = rootHierarchy; renderMap(); }
      setTimeout(() => {
        const tile = leafEls.get(f.path);
        if (tile) {
          tile.classList.remove("tm-flash"); void tile.offsetWidth; tile.classList.add("tm-flash");
          const r = tile.getBoundingClientRect();
          showPopover(f, r.left + r.width / 2, r.top + r.height / 2);
        }
      }, 80);
    });
    el.appendChild(row);
  });

  const notesEl = document.getElementById("notes");
  for (const n of DATA.notes ?? []) {
    const color = SEV_COLORS[n.severity] || SEV_COLORS.info;
    const div = document.createElement("div");
    div.className = "note";
    div.style.borderColor = color;
    div.innerHTML = `
      <div class="n-title" style="color:${color}">${escapeHTML(n.title)}</div>
      <div class="n-body">${escapeHTML(n.body)}</div>
      ${n.path ? `<div class="n-path">${escapeHTML(n.path)}</div>` : ""}`;
    if (n.path && byPath.has(n.path)) {
      div.style.cursor = "pointer";
      div.addEventListener("click", () => {
        const f = byPath.get(n.path);
        document.querySelector(`#hotspots`)?.scrollTo?.(0, 0);
        const dirPath = f.dir === "." ? "" : f.dir;
        const target = dirPath ? rootHierarchy.descendants().find((d) => d.children && d.path === dirPath) : null;
        if (target) zoomTo(target);
        setTimeout(() => {
          const tile = leafEls.get(f.path);
          if (tile) { tile.classList.remove("tm-flash"); void tile.offsetWidth; tile.classList.add("tm-flash"); const r = tile.getBoundingClientRect(); showPopover(f, r.left + r.width / 2, r.top + r.height / 2); }
        }, 80);
      });
    }
    notesEl.appendChild(div);
  }
}

/* ---------- header ---------- */
function buildHeader() {
  const p = DATA.project;
  document.getElementById("p-name").textContent = p.name;
  document.getElementById("p-tagline").textContent = p.tagline ?? "";
  document.getElementById("p-date").textContent = `${p.date} · ${p.windowDays}d window`;
  document.title = `${p.name} — Code Health Scan`;
  const defs = [
    ["files", "Files", "#fafafa", fmtNum(DATA.stats.files)],
    ["loc", "Lines", "#fafafa", fmtNum(DATA.stats.loc)],
    ["commits", "Commits", "#fafafa", fmtNum(DATA.stats.commits)],
    ["authors", "Authors", "#fafafa", fmtNum(DATA.stats.authors)],
    ["hotspots", "Hotspots", "#f43f5e", files.filter((f) => f.risk >= 60).length],
  ];
  const stats = document.getElementById("stats");
  for (const [, label, color, val] of defs) {
    const d = document.createElement("div");
    d.className = "stat";
    d.innerHTML = `<b style="color:${color}">${val}</b><span>${label}</span>`;
    stats.appendChild(d);
  }
}

/* ---------- color mode ---------- */
const MODE_CAPS = {
  risk: "blended risk from commits × complexity × lines changed",
  churn: "commit frequency in the window (log scale)",
  complexity: "branch-density score, agent-adjusted on hot files",
};
document.getElementById("seg").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  colorMode = b.dataset.mode;
  document.querySelectorAll("#seg button").forEach((x) => x.classList.toggle("active", x === b));
  document.getElementById("mode-cap").textContent = MODE_CAPS[colorMode];
  renderMap();
});

function fmtNum(n) { return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n); }
function escapeHTML(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ---------- boot ---------- */
let resizeT = null;
new ResizeObserver(() => { clearTimeout(resizeT); resizeT = setTimeout(renderMap, 120); }).observe(mapEl);

(async function boot() {
  buildHeader();
  const tree = buildTree(files);
  rootHierarchy = hierarchyFrom(tree);
  rootHierarchy.path = "";
  currentRoot = rootHierarchy;
  buildRail();
  renderMap();
  document.getElementById("loading").style.opacity = "0";
  setTimeout(() => document.getElementById("loading")?.remove(), 450);
})();

		};
		if (CDN.length) Promise.all(CDN.map(loadScript)).then(run).catch(() => {});
		else run();
		return () => { destroyed = true; };
	});
</script>

{#if activated}
<div class="healthgraph">
<div id="grid-bg"></div>
<div id="glow"></div>

<header>
  <div class="brand">
    <div class="brand-icon" id="brand-icon"></div>
    <div>
      <!-- svelte-ignore a11y_missing_content -->
<h1 id="p-name"></h1>
      <p><span id="p-tagline"></span><span class="date" id="p-date"></span></p>
    </div>
  </div>
  <div class="stats" id="stats"></div>
</header>

<div id="wrap">
  <div id="rail">
    <div class="card">
      <h3>Color by</h3>
      <div class="seg" id="seg">
        <button data-mode="risk" class="active">Risk</button>
        <button data-mode="churn">Churn</button>
        <button data-mode="complexity">Complexity</button>
      </div>
      <div class="gradient-bar" style="margin-top:12px"></div>
      <div class="gradient-cap"><span id="leg-low">low</span><span id="leg-high">high</span></div>
      <p class="size-note">Tile area = lines of code. Color = <span id="mode-cap">blended risk from commits × complexity × lines changed</span>.</p>
    </div>
    <div class="card">
      <h3 id="hot-cap">Top hotspots</h3>
      <div id="hotspots"></div>
    </div>
    <div class="card">
      <h3>Findings</h3>
      <div id="notes"></div>
    </div>
  </div>
  <div id="main">
    <div id="crumbs"></div>
    <div id="map"></div>
  </div>
</div>

<div id="tooltip"></div>
<div id="popover"></div>
<div id="loading"><div class="pulse"></div>rendering scan…</div>
</div>
{/if}