---
id: spatial-canvas-migration
title: Spatial Canvas Migration Plan
type: plan
tags: [canvas, plan]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**

# Fractals — Spatial Canvas Migration Brief

Instructions for the coding agent. Reorient the IDE shell from a fixed three-column
layout (sidebar | workspace | browser | sidebar) to a **Spatial Canvas**: an infinite,
pannable/zoomable board of **tiles**, where the user always opens into a furnished
**template** (a preset tile arrangement) rather than a blank ocean.

Stack assumptions — do not deviate:
- SvelteKit + Tauri, **Svelte 5 runes** (`$state` / `$derived` / `$props` / `$effect`), TypeScript.
- Styling is **pure indented Sass** (`.sass`, no braces, no semicolons, **single-tab** indentation).
- Keep the existing **utility-class system** (`box`, `row`, `col`, `w100`, `h100`, `full100`,
  `ycenter`, `xbetween`, `overflow-hidden`, `padleft12`, `text-xs`, `col3`, …).
- All filesystem / shell access stays behind the existing `ipc.ts` / `ipc-mock.ts` boundary.
- **Do not hardcode colors.** Everything visual reads from theme tokens in `_tokens.sass`
  so the existing themes keep working. This change is about *layout*, not color.

---

## 0. Mental model

Three concepts only:

1. **Board (substrate).** One infinite, pannable, zoomable surface with a dotted grid.
   Replaces `workspace-wrapper`. There is exactly one board per workspace.
2. **Tile.** A floating, draggable, resizable panel on the board. Every existing panel
   (Editor, Terminal, Browser, AIChat, file Sidebar, the marketplaces) becomes a tile kind,
   plus new future kinds (Doc/Wiki, Mail, DB, Graph, Results, Preview, Diagnostics, Tasks).
   All tiles share one chrome (`Tile.svelte`); only the inner body differs.
3. **Template.** A named starting arrangement of tiles (positions + sizes + kinds). The user
   opens into one (default **Project Home**) and can switch, combine, rearrange, or save their own.

The header (top bar) and footer (status strip) **stay**. Only the middle region changes.

---

## 1. Target shell — new `+page.svelte`

Replace the current middle region. Keep `app-shell`, `header`, and `footer-strip` essentially
as they are; swap the `workspace-wrapper` + the three `{#if !ideState.*Collapsed}` blocks for a
single `<Canvas />`. Overlays (CommandPalette, SettingsDialog) stay as siblings at the end.

```svelte
<div class="app-shell box full100">
	<header> … existing slim top bar (logo · ⌘K omnibar · global actions) … </header>

	<!-- was: workspace-wrapper with left sidebar / middle zone / browser / right sidebar -->
	<main class="board-region box w100 h100 overflow-hidden">
		<Canvas />
	</main>

	<footer class="footer-strip row ycenter xbetween padleft12 padright12 text-xs col3"> … </footer>

	<!-- Dialogs and palette overlays -->
	<CommandPalette />
	<SettingsDialog />
	<TemplateGallery />   <!-- new: the "open a template" picker -->
</div>
```

Delete the `leftSidebarCollapsed` / `browserCollapsed` / `rightSidebarCollapsed` branches.
Collapse is no longer a shell concern — a panel is either present as a tile on the board or not.

---

## 2. State layer — `src/lib/state/`

Add `canvas.svelte.ts`. Use a class instance exported as a singleton (idiomatic Svelte 5 runes).

```ts
// src/lib/state/canvas.svelte.ts
export type TileKind =
	| 'fileTree' | 'editor' | 'terminal' | 'browser' | 'ai' | 'inspector'
	| 'doc' | 'graph' | 'mail' | 'db' | 'query' | 'results'
	| 'preview' | 'diagnostics' | 'logs' | 'tasks' | 'home'
	| 'modelMarketplace' | 'skillsMarketplace'

export interface Tile {
	id: string
	kind: TileKind
	x: number; y: number        // board coordinates at zoom 1
	w: number; h: number
	z: number                   // stacking order
	props?: Record<string, unknown>
	minimized?: boolean
}

export interface Viewport { x: number; y: number; zoom: number }

class CanvasStore {
	tiles = $state<Tile[]>([])
	viewport = $state<Viewport>({ x: 0, y: 0, zoom: 1 })
	activeId = $state<string | null>(null)
	focusedId = $state<string | null>(null)   // null = normal; set = Focus/Zen mode

	active = $derived(this.tiles.find(t => t.id === this.activeId) ?? null)

	addTile(kind: TileKind, at?: { x: number; y: number }) { /* push with sensible default size */ }
	removeTile(id: string) { /* … */ }
	moveTile(id: string, x: number, y: number) { /* … */ }
	resizeTile(id: string, w: number, h: number) { /* … */ }
	raise(id: string) { /* bump z, set activeId */ }
	focusTile(id: string | null) { this.focusedId = id }
	applyTemplate(tpl: WorkspaceTemplate) { this.tiles = structuredClone(tpl.tiles) ; this.fit() }
	saveAsTemplate(name: string): WorkspaceTemplate { /* snapshot current tiles */ }
	fit() { /* recompute viewport so all tiles are visible (used after applyTemplate) */ }
}

export const canvas = new CanvasStore()
```

Keep the existing `ideState` store for genuinely global stuff (active file, theme, build status,
ipc mode). Remove the three `*Collapsed` booleans; anything that read them now checks tile presence.

---

## 3. Data layer — `src/lib/data/`

Two new files.

### `tileKinds.ts` — registry (label, module, default size, inner component)

```ts
import Editor from '$lib/components/Editor.svelte'
import Terminal from '$lib/components/Terminal.svelte'
// … import the rest, including new stubs (DocEditor, MailView, DbInspector, etc.)

export type ModuleId = 'code' | 'design' | 'wiki' | 'mail' | 'db' | 'system'

export interface TileKindMeta {
	label: string
	module: ModuleId          // drives the legend dot color via a token, see §5
	component: any            // Svelte component for the tile body
	defaultW: number
	defaultH: number
}

export const TILE_KINDS: Record<TileKind, TileKindMeta> = {
	fileTree:  { label: 'Explorer',   module: 'code',   component: Sidebar,    defaultW: 220, defaultH: 600 },
	editor:    { label: 'Editor',     module: 'code',   component: Editor,     defaultW: 640, defaultH: 460 },
	terminal:  { label: 'Terminal',   module: 'code',   component: Terminal,   defaultW: 640, defaultH: 200 },
	browser:   { label: 'Browser',    module: 'design', component: Browser,    defaultW: 480, defaultH: 360 },
	ai:        { label: 'AI Copilot', module: 'system', component: AIChat,     defaultW: 360, defaultH: 520 },
	// … doc, graph, mail, db, query, results, preview, diagnostics, logs, tasks, home, marketplaces
}
```

### `templates.ts` — the nine starter rooms (+ Blank)

Each template is just tiles with coordinates. Numbers below are illustrative — keep proportions,
let `canvas.fit()` handle final framing.

```ts
import type { WorkspaceTemplate } from '$lib/state/canvas.svelte'

export const TEMPLATES: WorkspaceTemplate[] = [
	{
		id: 'home', name: 'Project Home', summary: 'Where a workspace opens',
		tiles: [
			{ kind: 'home',        x: 40,  y: 40,  w: 430, h: 236 },
			{ kind: 'fileTree',    x: 40,  y: 300, w: 430, h: 200 },   // "recent files" view
			{ kind: 'tasks',       x: 500, y: 40,  w: 300, h: 200 },
			{ kind: 'diagnostics', x: 500, y: 264, w: 300, h: 188 },   // "build status"
		],
	},
	{
		id: 'code', name: 'Code — Classic', summary: 'Familiar IDE on-ramp',
		tiles: [
			{ kind: 'fileTree', x: 40,  y: 40,  w: 220, h: 560 },
			{ kind: 'editor',   x: 280, y: 40,  w: 640, h: 400 },
			{ kind: 'terminal', x: 280, y: 460, w: 640, h: 140 },
			{ kind: 'inspector',x: 940, y: 40,  w: 280, h: 560 },
		],
	},
	{ id: 'design',  name: 'Design — Graphics & Web', summary: 'Figma-style canvas', tiles: [ /* layers | artboard | properties */ ] },
	{ id: 'wiki',    name: 'Notes / Wiki Vault',      summary: 'Knowledge room',     tiles: [ /* vault | doc | graph */ ] },
	{ id: 'mail',    name: 'Inbox / Mail',            summary: 'Triage room',        tiles: [ /* folders | list | reader */ ] },
	{ id: 'db',      name: 'DB Inspector',            summary: 'Data room',          tiles: [ /* schema | query | results */ ] },
	{ id: 'run',     name: 'Run & Debug',             summary: 'Runtime room',       tiles: [ /* preview | terminal | logs | diagnostics */ ] },
	{ id: 'focus',   name: 'Focus / Zen',             summary: 'One tile, nothing else', tiles: [ /* single editor, then call focusTile */ ] },
	{ id: 'review',  name: 'Diff / Review',           summary: 'Two surfaces + comments', tiles: [ /* before | after | comments */ ] },
	{ id: 'blank',   name: 'Blank Canvas',            summary: 'The open ocean',     tiles: [] },
]
```

---

## 4. Component layer — `src/lib/components/`

### New components

- **`Canvas.svelte`** — the board viewport. Responsibilities:
  - Renders the dotted-grid background and a translate/scale wrapper driven by `canvas.viewport`.
  - Pan: space-drag or middle-mouse drag; trackpad two-finger scroll pans.
  - Zoom: `ctrl/cmd + wheel` zooms toward the cursor (clamp ~0.4–2.0).
  - `{#each canvas.tiles as tile (tile.id)}` → `<Tile {tile} />`.
  - Renders `<Minimap />` (bottom-right) and `<TileDock />` (bottom-center) as fixed overlays.
  - When `canvas.focusedId` is set, dim the board and center/enlarge that one tile (Focus mode).

- **`Tile.svelte`** — generic tile chrome. Props: `{ tile }`. Responsibilities:
  - Absolutely positioned at `tile.x/y`, sized `tile.w/h`, `z-index: tile.z`.
  - Header = drag handle + module dot + `TILE_KINDS[tile.kind].label` + controls (focus, minimize, close).
  - Body renders the inner component dynamically (Svelte 5 — component as a value, no `<svelte:component>`):
    ```svelte
    <script lang="ts">
      import { TILE_KINDS } from '$lib/data/tileKinds'
      import { canvas } from '$lib/state/canvas.svelte'
      let { tile } = $props()
      const meta = $derived(TILE_KINDS[tile.kind])
      const Body = $derived(meta.component)
    </script>
    <section class="tile box" class:active={canvas.activeId === tile.id}
             style="left:{tile.x}px; top:{tile.y}px; width:{tile.w}px; height:{tile.h}px; z-index:{tile.z}">
      <header class="tile-head row ycenter" onpointerdown={startDrag}>
        <span class="tile-dot" data-module={meta.module}></span>
        <span class="tile-title text-xs">{meta.label}</span>
        <div class="tile-actions row ycenter"> … focus / minimize / close … </div>
      </header>
      <div class="tile-body box overflow-hidden">
        <Body {...(tile.props ?? {})} />
      </div>
      <span class="tile-resize" onpointerdown={startResize}></span>
    </section>
    ```
  - Drag/resize update `canvas.moveTile` / `canvas.resizeTile`; account for `viewport.zoom`
    (divide pointer deltas by zoom). `pointerdown` on header calls `canvas.raise(tile.id)`.

- **`Minimap.svelte`** — scaled overview of all tile bounds + a viewport rectangle; click/drag to pan.
- **`TileDock.svelte`** — floating launcher; one button per module that calls `canvas.addTile(kind)`.
- **`TemplateGallery.svelte`** — overlay shown on first load / "New workspace"; lists `TEMPLATES`
  as cards and calls `canvas.applyTemplate`. Also openable from the CommandPalette.

### New tile-body stubs (build minimal now, fill in later)

`DocEditor.svelte` (wiki), `MailView.svelte`, `DbInspector.svelte`, `BacklinkGraph.svelte`,
`ResultsGrid.svelte`, `Preview.svelte`, `Diagnostics.svelte`, `Tasks.svelte`, `ProjectHome.svelte`,
`Inspector.svelte`. Each is just a tile body — no panel chrome (the chrome lives in `Tile.svelte`).

### Existing components — adapt, don't rewrite

`Editor`, `Terminal`, `Browser`, `AIChat`, `Sidebar`, `ModelMarketplace`, `SkillsMarketplace`
become **tile bodies**. Strip any outer width/height/positioning/collapse logic from them — the
tile owns size and position now. They should fill `100%` of their tile body and nothing more.
`CommandPalette` gains a "tile palette" mode: typing can add a tile or apply a template.

---

## 5. Styles layer — `src/lib/styles/`

Keep the indented-Sass + utility-class conventions. Single tab. No braces/semicolons.
No literal colors — add tokens and reference them.

### New partials in `styles/components/`

- `_canvas.sass` — `.board-region`, `.canvas-viewport`, dotted-grid background, the transform wrapper.
- `_tile.sass` — `.tile`, `.tile-head`, `.tile-title`, `.tile-dot`, `.tile-actions`, `.tile-resize`,
  `.tile.active`, minimized state, the Focus-mode treatment.
- `_minimap.sass`, `_dock.sass`, `_templategallery.sass`.

### Edit existing partials

- `_layout.sass` — retarget from the 3-column grid to: header (fixed height) · `.board-region` (flex:1) · footer.
- `_sidebar.sass`, `_browser.sass`, `_editor.sass`, `_terminal.sass`, `_ai.sass` — remove
  absolute/column positioning and collapse rules; make each fill its tile body (`width/height: 100%`).
- `_tokens.sass` — add the new tokens (below).
- `index.sass` — `@import` the new partials.

### New tokens (`_tokens.sass`) — map to existing theme variables, never raw hex

```sass
// canvas + tiles
$canvas-bg: var(--bg-0)
$canvas-grid-dot: var(--border-subtle)
$canvas-grid-size: 22px
$tile-bg: var(--bg-1)
$tile-border: var(--border-default)
$tile-border-active: var(--accent)
$tile-head-h: 30px
$tile-radius: 8px
$tile-shadow: 0 10px 34px var(--shadow-strong)

// module legend dots — point at theme accents, not literals
$module-code: var(--accent-code)
$module-design: var(--accent-design)
$module-wiki: var(--accent-wiki)
$module-mail: var(--accent-mail)
$module-db: var(--accent-db)
$module-system: var(--text-dim)

// z-index scale
$z-tile: 10
$z-tile-active: 20
$z-dock: 100
$z-minimap: 100
$z-overlay: 1000
```

Example `_tile.sass` (note single-tab indentation, no braces):

```sass
.tile
	position: absolute
	display: flex
	flex-direction: column
	background: $tile-bg
	border: 1px solid $tile-border
	border-radius: $tile-radius
	box-shadow: $tile-shadow
	overflow: hidden

	&.active
		border-color: $tile-border-active

.tile-head
	height: $tile-head-h
	gap: 7px
	padding: 0 10px
	border-bottom: 1px solid $tile-border
	cursor: grab

.tile-dot
	width: 6px
	height: 6px
	border-radius: 2px

	&[data-module='code']
		background: $module-code
	&[data-module='design']
		background: $module-design
	&[data-module='wiki']
		background: $module-wiki
	&[data-module='mail']
		background: $module-mail
	&[data-module='db']
		background: $module-db
	&[data-module='system']
		background: $module-system

.tile-body
	flex: 1
	min-height: 0

.tile-resize
	position: absolute
	right: 0
	bottom: 0
	width: 14px
	height: 14px
	cursor: nwse-resize
```

---

## 6. Behaviors to implement

- **Pan/zoom** in `Canvas.svelte` as in §4. Persist `canvas.viewport` and the tile layout to
  disk via ipc (or localStorage in browser/mock mode) so a workspace reopens where it was left.
- **Focus / Zen** — `canvas.focusTile(id)` dims the board and centers that tile; Esc clears it.
- **Tile palette** — ⌘K (CommandPalette) and the `+` in `TileDock` both call `canvas.addTile`.
  New tiles drop near the viewport center, offset so they don't stack exactly.
- **Templates** — `TemplateGallery` on empty workspace; "Save layout as template" snapshots
  `canvas.tiles` into a user template (persist alongside saved workspaces).
- **Combinable** — nothing prevents mixing kinds; a DB `results` tile can sit next to an `editor`.

---

## 7. Migration plan (incremental, keep the app runnable each step)

1. **State + data scaffolding.** Add `canvas.svelte.ts`, `tileKinds.ts`, `templates.ts`. No UI yet.
2. **Tile chrome.** Build `Tile.svelte` + `_tile.sass`. Render a couple of hardcoded tiles in a
   temporary route to verify drag/resize/raise.
3. **Board.** Build `Canvas.svelte` + `_canvas.sass` with pan/zoom; render `canvas.tiles`.
4. **Swap the shell.** In `+page.svelte`, replace `workspace-wrapper` + the three `*Collapsed`
   blocks with `<main class="board-region"><Canvas /></main>`. Keep header/footer.
   Update `_layout.sass`. App now boots into a board.
5. **Adapt existing bodies.** Move Sidebar/Editor/Terminal/Browser/AIChat into tile bodies; strip
   their positioning/collapse CSS so they fill 100%.
6. **Templates + gallery.** Build `TemplateGallery.svelte`; default-open **Project Home**; wire
   `applyTemplate`. Fill in all nine template coordinate sets.
7. **Dock + minimap.** Add `TileDock.svelte` and `Minimap.svelte`.
8. **Palette integration.** Extend `CommandPalette` to add tiles / switch templates.
9. **Persistence.** Save/restore viewport + layout + user templates via ipc.
10. **Future module stubs.** Add Doc/Mail/DB/Graph/Results/Preview/Diagnostics/Tasks tile bodies.

---

## 8. Guardrails (do not violate)

- Indented Sass only, **single tab**, no braces/semicolons/colons-as-blocks. Reuse utility classes.
- Svelte 5 runes only — no stores-as-`writable`, no `$:` reactive statements.
- No hardcoded colors anywhere; add a token and map it to the active theme.
- Filesystem/shell strictly through `ipc.ts` / `ipc-mock.ts`. Must keep working in BROWSER mock mode.
- Don't delete `Editor`/`Terminal`/etc. — they become tile bodies, adapted in place.
- Each PR/step must leave the app booting and the existing themes intact.
