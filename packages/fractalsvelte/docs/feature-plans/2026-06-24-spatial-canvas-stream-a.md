---
id: sp-plan-2026-06-24-spatial-canvas-stream-a
title: "Superpowers Plan: 2026-06-24-spatial-canvas-stream-a"
type: archive
tags: [superpowers, plan, history]
updated: 2026-07-15
---

> **Historical superpowers implementation plan — kept as reference.**


This plan outlines the re-sequencing and execution steps for Agent 1 to build the Spatial Canvas state layer and Stream A (Board mechanics, tile chrome, viewport pan/zoom, shell swap, Minimap, TileDock, and persistence).

---

## 1. Scope and Guardrails
- **Svelte 5 Runes**: Use `$state`, `$derived`, `$props`, `$effect` only.
- **Indented SASS**: Tab-indented SASS (`.sass` syntax, no braces or semicolons) imported into `src/lib/styles/index.sass`.
- **Zero Hardcoded Colors**: Consume variables from `src/lib/styles/_tokens.sass` and map to semantic colors.
- **IPC Isolation**: Keep Tauri/browser fallback working via `ipc.ts` / `ipc-mock.ts`.
- **Scope Correction**: `TileKind` only includes features present in the app today.

---

## 2. Phase 0 — Shared Prerequisite

### [NEW] `src/lib/state/canvas.svelte.ts`
Scaffold the core Svelte 5 state registry for the canvas board.
- **Types**:
  ```typescript
  export type TileKind =
  	| 'fileTree' | 'editor' | 'terminal' | 'browser' | 'ai'
  	| 'modelMarketplace' | 'skillsMarketplace';
  ```
- **Interfaces**: `Tile`, `Viewport`, `WorkspaceTemplate`.
- **CanvasStore**:
  - `tiles` (`$state`)
  - `viewport` (`$state`)
  - `activeId` (`$state`)
  - `focusedId` (`$state`)
  - `addTile(kind)`: adds a tile near center.
  - `removeTile(id)`: removes from list.
  - `moveTile(id, x, y)`
  - `resizeTile(id, w, h)`
  - `raise(id)`: activeId = id, pushes z to highest + 1.
  - `focusTile(id)`
  - `applyTemplate(tpl)`: sets tiles, calls `fit()`.
  - `saveAsTemplate(name)`
  - `fit()`: bounds calculations to fit all tiles in viewport.

---

## 3. Stream A — Board Mechanics & Shell (Agent 1)

### [NEW] `src/lib/components/Tile.svelte`
Generic tile wrapper. Handles absolute coordinates, header drag handles, resizing corners, and dynamically rendering the inner component.
- pointerdown on header calls `canvas.raise(tile.id)`.
- Dragging header changes `tile.x/y` relative to `viewport.zoom`.
- Resizing changes `tile.w/h` relative to `viewport.zoom`.
- Controls: focus (toggle focusedId), minimize (minimize toggle), close (removeTile).

### [NEW] `src/lib/styles/components/_tile.sass`
Layout classes for `.tile`, `.tile-head`, `.tile-dot`, `.tile-actions`, `.tile-body`, `.tile-resize` following classic indented SASS.

### [NEW] `src/lib/components/Canvas.svelte`
Infinite dotted-grid background, transform viewport offset (`translate(x, y) scale(zoom)`).
- Panning via space-drag or middle-mouse drag.
- Zooming via Ctrl/Cmd + Mouse wheel towards the cursor coordinates.
- Renders `<Minimap />` and `<TileDock />` overlays.
- Dim overlay if `canvas.focusedId` is active.

### [NEW] `src/lib/styles/components/_canvas.sass`
Layout classes for `.board-region`, viewport transforms, and grid dots.

### [MODIFY] `src/routes/+page.svelte`
- Replace `workspace-wrapper` and the three collapsed sidebars with `<main class="board-region"><Canvas /></main>`.
- Remove references to `leftSidebarCollapsed`, `browserCollapsed`, `rightSidebarCollapsed`.

### [MODIFY] `src/lib/styles/components/_layout.sass`
- Retarget shell from three-column panel grids to: header (fixed height) -> `.board-region` (flex: 1) -> footer.

### [MODIFY] `src/lib/styles/_tokens.sass`
- Add `$canvas-bg`, `$canvas-grid-dot`, `$canvas-grid-size`, `$tile-bg`, `$tile-border`, `$tile-border-active`, `$tile-head-h`, `$tile-radius`, `$tile-shadow`, `$z-tile`, `$z-tile-active`, `$z-dock`, `$z-minimap`, `$z-overlay`.

### [MODIFY] `src/lib/styles/index.sass`
- Import `components/canvas` and `components/tile`.

### [NEW] `src/lib/components/Minimap.svelte` / `_minimap.sass`
Displays scaled bounds of all active tiles on the canvas and a viewport box. Dragging pan rect centers viewport.

### [NEW] `src/lib/components/TileDock.svelte` / `_dock.sass`
Launcher bar displaying buttons to spawn active tiles (`code` / `system`) and disabled entries for deferred modules.

### [MODIFY] Workspace Persistence
- Persist viewport and tile layout through IPC config files.

---

## 4. Verification Plan
- Verify compilation with `pnpm check`.
- Run Playwright E2E tests to check regression on home layout.
