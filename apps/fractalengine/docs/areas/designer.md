---
id: designer
title: Designer Area
type: area
tags: [designer, canvas, modules]
relates_to: [ADR-005, ADR-006, ADR-008, ADR-014, ADR-021, ADR-026, ADR-043]
summary: Covers modules/designer/** including engine, state, components, data, and styles.
updated: 2026-07-22
---

# Designer Area

## Purpose & boundaries

The Designer area manages the Svelte-native graphics designer and page builder components housed under `src/lib/modules/designer/`. It enables users to drag and drop layout blocks, configure inspector properties, and export Svelte/HTML code.

## State & persistence

- **Design Canvas State**: Handled in `state/designcanvas.svelte.ts` using Svelte 5 runes (`$state`, `$derived`). Tracks block nodes, layout selections, and active properties.
- **Layout State**: Handled in `state/design.svelte.ts`.
- **Persistence**: Cached in localStorage under `fractalengine-designer-state` keys and supports file serialization to the local workspace via Tauri IPC boundaries (ADR-008).

## Extension points

- **Contributions**: Registers layout-building commands and shortcuts inside `modules/designer/contributions.ts` (ADR-025).
- **Undo Domain**: Registers its mutation state under the undo coordinator via `UndoHistory.registerUndoDomain('designer', ...)` (ADR-026).
- **Typography adapter**: `engine/typography.ts` serializes the inspector’s text controls into the existing block `style` record. It mirrors standards-based CSS keys for rendering/export while retaining `_typography` metadata for vertical alignment and sizing modes; legacy text-only style records remain readable.

## Cross-area edges

- **AI Integration**: Renders the `<AIChat showHeader={false} />` panel inside the right inspector sidebar panel (ADR-024).
- **Three-pane shell**: `DesignLayout.svelte` supplies the Layers/Components sidebar, canvas viewport, and Style/Export/AI sidebar to `WorkspaceShell` under the `design` profile. The central pane has `min-width: 0`, so opening the right inspector consumes layout width instead of overlaying the canvas; the canvas dock remains centered within that central pane.
- **Kernel Bridge**: Imports global `ideState` to resolve workspace paths and execute exports.

## Gotchas

- **Library insertion drag**: Cards in the Components sidebar use one pointer-captured drag path. On pointer release inside `.design-viewport`, the card converts screen coordinates to canvas coordinates and inserts the selected template, primitive, or saved component in one `designcanvas` mutation. Do not combine this with native HTML drag events: WebKit can cancel the pointer sequence without delivering a matching native `drop` event.
- **Drag-Resize Pattern**: Node resize mouse movements use a document-level event listener (ADR-014) to avoid dropping the selection target.
- **Color Pickers**: Never use native browser `<input type="color">`; use the custom spectrum/hex picker popover.
- **Text styles**: All inspector edits start and commit a designer gesture, so a complete text-style change is one undo entry. Rich text within a text block remains explicitly deferred; B2 configures a whole block only.
- **Reentrant gestures (ADR-043)**: `recordGestureStart` / `commitGesture` (and the underlying `UndoHistory.beginGesture` / `endGesture`) are reentrant-safe via a depth counter, mirroring `transact()`. A discrete mutation helper that wraps its own gesture — e.g. `pasteBlock` / `duplicateSelected` invoked inside an Alt-drag duplicate gesture — coalesces into the outer gesture rather than prematurely committing the caller's snapshot. Do not rely on an inner `commitGesture` pushing its own entry when called inside an outer gesture; if a mutation must produce its own undo entry unconditionally, use `transact()` (and accept that it does not compose with an in-progress gesture) or restructure the call site so the gesture boundaries do not nest.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`ComponentLibrary.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/components/ComponentLibrary.svelte) | designcanvas/ComponentLibrary |
| [`DesignBlock.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/components/DesignBlock.svelte) | designcanvas/DesignBlock |
| [`DesignInspector.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/components/DesignInspector.svelte) | designcanvas/DesignInspector |
| [`DesignLayout.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/components/DesignLayout.svelte) | DesignLayout.svelte |
| [`Dock.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/components/Dock.svelte) | src/lib/components/TemplateDock.svelte |
| [`ExportPanel.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/components/ExportPanel.svelte) | designcanvas/ExportPanel |
| [`Layers.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/components/Layers.svelte) | designcanvas/Layers |
| [`NewDesignLayout.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/components/NewDesignLayout.svelte) | NewDesignLayout.svelte |
| [`contributions.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/contributions.ts) | contributions.ts |
| [`designtemplates.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/data/designtemplates.ts) | src/lib/utils/templates.ts |
| [`autoscroll.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/autoscroll.ts) | * Pointer position cached from the most recent move event. |
| [`CanvasViewport.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/CanvasViewport.svelte.ts) | CanvasViewport.svelte.ts |
| [`codegen.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/codegen.ts) | --------------------------------------------------------------------------- |
| [`designblock.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/designblock.ts) | designblock.ts |
| [`designstores.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/designstores.svelte.ts) | designstores.svelte.ts |
| [`designtypes.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/designtypes.ts) | designtypes.ts |
| [`DragEngine.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/DragEngine.svelte.ts) | DragEngine.svelte.ts |
| [`paint.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/paint.ts) | paint.ts |
| [`patterns.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/patterns.ts) | patterns.ts |
| [`ResizeEngine.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/ResizeEngine.svelte.ts) | ResizeEngine.svelte.ts |
| [`RotateEngine.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/RotateEngine.svelte.ts) | RotateEngine.svelte.ts |
| [`SelectionEngine.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/SelectionEngine.svelte.ts) | SelectionEngine.svelte.ts |
| [`svgpath.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/svgpath.ts) | src/lib/utils/svgpath.ts |
| [`typography.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/engine/typography.ts) | typography.ts |
| [`design.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/state/design.svelte.ts) | design.svelte.ts |
| [`designcanvas.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/state/designcanvas.svelte.ts) | src/lib/states/canvasstate.svelte.ts |
| [`DesignBlock.stories.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/stories/DesignBlock.stories.svelte) | DesignBlock.stories.svelte |
| [`DesignInspector.stories.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/stories/DesignInspector.stories.svelte) | DesignInspector.stories.svelte |
| [`Layers.stories.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/stories/Layers.stories.svelte) | Layers.stories.svelte |
| [`_canvas.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_canvas.sass) | _canvas.sass |
| [`_componentlibrary.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_componentlibrary.sass) | ── ComponentLibrary (left sidebar tab) ──────────────────────────────────── |
| [`_designblock.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_designblock.sass) | _designblock.sass |
| [`_designcanvas.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_designcanvas.sass) | ── Outer layout ────────────────────────────────────────────────────────── |
| [`_designinspector.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_designinspector.sass) | ── DesignInspector (right-rail styling panel) ───────────────────────────── |
| [`_designtemplategallery.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_designtemplategallery.sass) | ── Design-block template gallery modal (designcanvas/Dock.svelte) — moved out |
| [`_draggable.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_draggable.sass) | _draggable.sass |
| [`_exportpanel.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_exportpanel.sass) | ── ExportPanel ──────────────────────────────────────────────────────────── |
| [`_layers.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_layers.sass) | ── Layers panel (Figma-style scene-graph tree) ───────────────────────────── |
| [`_tile.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_tile.sass) | _tile.sass |
| [`design.spec.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/design.spec.ts) | design.spec.ts |

<!-- filetable:end -->
