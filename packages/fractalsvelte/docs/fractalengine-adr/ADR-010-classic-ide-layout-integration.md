---
id: ADR-010
title: Classic IDE Layout Integration and Restoration
type: adr
tags: [layout, ide, sidebar, editor]
summary: Restores and integrates a classic IDE-style layout (sidebar/editor/terminal/browser panes) alongside the spatial canvas layout.
relates_to: [ADR-005]
status: accepted
updated: 2026-06-25
---


**Status:** Accepted
**Date:** 2026-06-24
**Decision makers:** Architecture Committee, UX Design Lead, Frontend Lead

---

## Context

During the Spatial Canvas Board migration (ADR-005), the rigid three-column IDE layout was replaced with an infinite canvas of draggable/resizable floating tile panels.

While the spatial canvas is excellent for visual modeling, diagramming, and multi-window workspace setups, users requested the return of the classic docked developer interface (Left Sidebar Explorer, Center Editor, Right Inspector, and Bottom Collapsible Terminal) as a focused preset template. This is the standard "Code Classic" template layout.

We needed a way to restore the classic docked layout with all its native features (resizing handles, drag-to-dock terminal, and panel collapsing) while still maintaining the spatial canvas substrate for other templates.

---

## Decision

We will isolate the classic developer layout into a dedicated `<ClassicIdeLayout />` component and load it conditionally in `+page.svelte` depending on the active workspace template.

### 1. Template Routing Layout Swap (`+page.svelte`)
In the main page wrapper, we read the active template. If it matches the `"code"` (Classic Developer) layout, we bypass the spatial canvas and render `<ClassicIdeLayout />`:
```html
{#if canvas.activeTemplateId === 'code'}
  <ClassicIdeLayout />
{:else}
  <Canvas />
{/if}
```

### 2. Panel Position & Resizing State (`ide.svelte.ts`)
We restored state parameters and mouse listeners in `ideState` to support classic layout panel controls:
- **Collapsible States**: `leftSidebarCollapsed`, `rightSidebarCollapsed`, `terminalCollapsed`.
- **Panel Widths/Heights**: `leftSidebarWidth` (clamped 200px–450px), `rightSidebarWidth` (clamped 240px–500px), `terminalHeight` (clamped 150px–600px).
- **Draggable Handle Listeners**: Resizing handles (`.resize-handle-v`, `.resize-handle-h`) use mouse move pointer capture handlers to recalculate dimensions on drag.

### 3. Drag-and-Drop Terminal Docking
The terminal can be repositioned using standard HTML5 drag gestures:
- Dragging the terminal header triggers standard drag event listeners.
- Drop overlay targets in the Left Sidebar, Right Sidebar, and Middle-Bottom panels highlight dynamically.
- Dropping updates `ideState.terminalLocation` (`'left' | 'right' | 'bottom'`), reactively moving the terminal component container while keeping terminal logs intact.

---

## Consequences

### Positive
- **Parity & Flexibility**: Restores 100% of the original classic developer experience for users who prefer standard IDE structures.
- **Clean Isolation**: Encapsulating the docked layout inside `ClassicIdeLayout.svelte` keeps the spatial `Canvas.svelte` code clean and free of sidebars/columns CSS logic.
- **Dynamic Transition**: Users can switch templates (e.g. from Canvas to Classic) at runtime, and Svelte reactively redraws the workspace without reloading.

### Negative
- **Layout Redundancy**: We maintain two layouts in the codebase. However, because both consume the exact same underlying sub-modules (Explorer Sidebar, CodeMirror Editor, Terminal, Web Browser, AI Chat), code duplication is limited purely to structural columns/sizing containers.

---

## Alternatives Considered

### 1. Representing the Classic Layout as Rigid Canvas Tiles
We considered spawning the Explorer, Editor, and Terminal as tiles in a locked grid layout on the spatial canvas. Rejected because:
- The infinite zoom/pan and tile borders interfere with the rigid pixel alignments developers expect in a classic layout.
- Managing resizes, auto-collapsing panels, and drag-and-dock terminal mechanics inside zoomable coordinate spaces introduces severe complexity.
- A dedicated layout wrapper guarantees stable, pixel-perfect layout resizing.
