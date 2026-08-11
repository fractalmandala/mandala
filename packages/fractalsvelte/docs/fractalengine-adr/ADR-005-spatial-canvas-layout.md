---
id: ADR-005
title: Adopt Spatial Canvas Board Layout with Draggable Tiles
type: adr
tags: [canvas, layout, tiles]
summary: Introduces an infinite spatial canvas board layout where panels are draggable/resizable tiles, as an alternative to the classic IDE layout.
relates_to: [ADR-010]
status: accepted
updated: 2026-07-15
---


**Status:** Accepted
**Date:** 2026-06-24
**Decision makers:** Frontend Lead, Product Owner, Backend Lead

---

## Context

FractalEngine's initial user interface used a rigid three-column layout: a left sidebar (file explorer), a central workspace (editor, terminal), and a right sidebar (AI copilot, diagnostics). As the application grew to include more panels — browser, password vault, model marketplace, skills marketplace, template gallery, minimap — the fixed-column layout became increasingly constrained:

- The right sidebar could only show one panel at a time (tab switcher), hiding AI copilot content when the browser was active.
- The terminal was fixed to the bottom of the central column, consuming vertical space even when collapsed.
- Users could not rearrange panels to suit their workflow — a developer working on AI prompt engineering might want the AI panel on the left and the editor on the right, while a developer debugging might want the terminal side by side with the editor.
- Adding new panels (Wiki, Mail, Database, Design Canvas, planned in the roadmap) would further crowd the sidebars.

Modern IDEs like VS Code, IntelliJ, and Zed support flexible panel arrangements. However, even these use a grid/flexbox metaphor that limits panels to predefined zones. A spatial canvas — where panels are freely draggable, resizable, and positionable on an infinite 2D plane — offers maximum flexibility and aligns with FractalEngine's positioning as an experimental, AI-native IDE.

The team evaluated the implementation effort: a canvas with pan/zoom, draggable tiles, minimap, and dock launcher was estimated at 3-4 weeks, including the migration from the existing layout.

---

## Decision

We will replace the rigid three-column layout with an infinite spatial canvas board where all IDE panels are draggable, resizable tiles on a pannable/zoomable 2D plane.

The architecture has five components:

1.  **Canvas substrate** (`Canvas.svelte`) — an infinite board with a dotted grid background. Supports pointer-drag panning, space-bar + drag panning, and scroll-wheel zooming centered on the cursor position. The viewport state (x, y, zoom) is managed in `canvas.svelte.ts`.

2.  **Tile containers** (`Tile.svelte`) — each IDE panel is wrapped in a draggable, resizable tile. Tiles have a title header with a module legend dot (color-coded by module: code=blue, design=green, system=gray), a close button, and resize handles on the bottom and right edges. Drag deltas are divided by the zoom factor so tiles stay under the pointer at any zoom level.

3.  **Tile Dock** (`TileDock.svelte`) — a launcher dock at the bottom-center of the screen. Active panel types appear as clickable buttons; future module placeholders (Wiki, Mail, Database, Design Canvas) appear as greyed-out disabled entries imported from `FUTURE_MODULES` in `tileKinds.ts`.

4.  **Interactive Minimap** (`Minimap.svelte`) — a bottom-right overlay showing all active tiles as rectangles and the visible viewport as a bordered frame. Clicking or dragging on the minimap pans the main canvas to the corresponding location.

5.  **Template Gallery** (`TemplateGallery.svelte`) — a modal gallery that opens on first launch (and via command palette) showing pre-configured workspace layouts users can apply with one click, replacing the blank initial state.

The state store (`canvas.svelte.ts`) manages tiles array, viewport coordinates, active/focused tile IDs, and gallery visibility. Layout is persisted to the ignored workspace-metadata path `.fractal/canvas_layout.json` via Tauri, with `localStorage` fallback in browser mode. A legacy root-level `canvas_layout.json` is migrated on first native load when no new-path layout exists.

---

## Consequences

### Positive

- Users can arrange panels freely — any tile can be positioned at any coordinate, stacked in any z-order, resized to any dimensions (minimum 150×100px). This supports diverse workflows from AI-focused layouts to debug-focused layouts.
- The canvas scales naturally with new panels — adding Wiki or Mail modules means adding a new `TileKind` entry in `tileKinds.ts` and a dock button; no layout re-engineering.
- The minimap provides spatial awareness on the infinite canvas — users can see where all their panels are relative to each other and the viewport without scrolling.
- Template gallery gives new users immediate productivity — they can load curated workspace layouts rather than manually arranging tiles from scratch.
- Focus/Zen mode (`focusedId`) lets users isolate a single tile for distraction-free work on a specific panel.

### Negative

- The infinite canvas is unfamiliar to users accustomed to fixed-layout IDEs — there is a learning curve for panning, zooming, and tile management that does not exist in VS Code or IntelliJ.
- Tile stacking (z-order) requires explicit raise-on-click behavior — if the user clicks a tile partially obscured by another, the clicked tile must come to the front. This is handled but adds complexity compared to non-overlapping fixed layouts.
- Layout persistence depends on serializing tile positions as pixel coordinates — if the user switches to a different screen resolution, tiles may appear off-screen or clustered. The `fit()` method provides a recovery path but is not automatic on resolution change.
- The legacy three-column layout code and its state properties in `ide.svelte.ts` had to be removed or deprecated — a clean migration was required, but some legacy CSS (`_layout.sass`, `_sidebar.sass`) still carries layout assumptions that may conflict with canvas styles.

### Neutral

- The `tileKinds.ts` registry centralizes all panel metadata (label, module, component reference, default dimensions). Adding a new panel type is a single-entry addition.
- Future module placeholders in the dock are rendered with disabled styling — when the actual module ships, the entry is switched from placeholder to live tile launcher without dock rework.

---

## Alternatives Considered

### Flexible grid layout (CSS Grid with drag-to-resize zones)

We considered implementing a VS Code-style grid layout where panels snap to zones (left, right, bottom, center) with resizable dividers. Rejected because zone-based layouts still limit panel positioning — a user cannot place the terminal above the editor or the AI panel floating in the center. Adding new zones for future modules requires layout re-engineering. The grid approach also makes it harder to implement focus/zen mode.

### Tabbed panel container (single panel at a time per zone)

The simplest alternative — all panels share the same space via tabs. Rejected because the user can only see one panel at a time per zone, defeating the purpose of having multiple tool windows visible concurrently (e.g., editor + terminal + AI copilot all visible).

### Third-party layout library (Golden Layout, React Mosaic)

Rejected because these libraries are designed for React or Angular and do not integrate cleanly with Svelte 5's runes-based state management. Wrapping a jQuery-based layout library would introduce a foreign DOM manipulation paradigm alongside Svelte's compiler-driven approach, leading to unpredictable rendering conflicts.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-002 | Svelte 5 Runes-Only State Management | Canvas state (`canvas.svelte.ts`) uses runes for reactive tile/viewport management |
| ADR-003 | Two-Layer CSS Token System with Indented SASS | Canvas, tile, minimap, dock, and template gallery styles all consume tokens |
| ADR-006 | Mandatory Undo/Redo Boundary | Tile arrangement changes are recorded in the undo stack |

---

## Notes

The minimap rendering uses a canvas element for performance at 20+ tiles. If tile count exceeds 50, consider virtualizing the minimap or switching to WebGL-backed rendering. The `fit()` viewport method and template gallery provide recovery paths if tiles become scattered or lost off-screen.
