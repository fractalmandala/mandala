---
id: newdesign
title: New Design Area
type: area
tags: [newdesign, designer, canvas, drag-drop, resize, rotation, undo-redo]
summary: Provides a clean, isolated canvas playground with a standalone pan-and-zoom grid and one interactive sidebar unit.
relates_to: [ADR-026, ADR-043, ADR-045, ADR-047]
updated: 2026-07-19
---

## Purpose

The New Design module is a clean, isolated canvas playground for validating a reusable canvas unit. Its left sidebar contains one draggable `Interactive unit`; releasing that source inside the standalone canvas grid creates a unit at the release point.

## Interaction and state boundary

- `components/unit.svelte` owns the drag source. It reports the pointer release coordinates to `NewDesignLayout.svelte`, including releases outside the sidebar.
- `CanvasGrid.svelte` is the new canvas boundary. It owns the grid pattern, panning (Space-drag or middle mouse), pointer-centred zooming, viewport clipping, world transform, and client-to-world coordinate conversion.
- `CanvasGridControls.svelte` owns the visible zoom controls and reset action. `state/canvasGrid.svelte.ts` owns the isolated camera state and its snapshot history.
- `NewDesignLayout.svelte` consumes the canvas grid through its public coordinate API; it does not implement grid mechanics or import any production Designer canvas code.
- `CanvasUnit.svelte` owns direct pointer interactions for moving, resizing, and rotating a unit in world coordinates. Hold Shift while rotating to snap in 15-degree steps.
- `CanvasPatternSelect.svelte` renders the canvas background pattern picker in the shell header (visible only when `appState.activeTemplateId === 'tester'`). It is a Bits UI dropdown gallery of visual tiles — scaled live pattern previews grouped into Gradient Glow, Fade Grids, Diagonal Cross, Dashed Grids, Masked, and Textures & Lines — listing the light geometric patterns from `data/canvasPatterns.ts` (extracted from `vendors/patterns/data/patterns.ts`, dark variants excluded) plus a "Default Grid" tile that restores the standard pan/zoom grid. The dropdown portals into `.app-root-shell` (not `body`) so theme-class-scoped semantic tokens resolve.
- `state/newdesign.svelte.ts` holds the selected `canvasPatternId`; selection changes are wrapped in `UndoHistory.transact()` so background swaps are atomic undo/redo entries alongside unit edits.
- `CanvasGrid.svelte` derives the viewport backdrop from the selected pattern: with no pattern it applies the camera-driven grid position/size; with a pattern the viewport keeps only the pattern's base color and a dedicated `.newdesign-canvas-grid-pattern` overlay layer carries the artwork (background image/size/position and mask layers) beneath the world layer — so masks fade the artwork without ever fading the base color.
- The registered `newdesign` undo domain composes the unit and camera histories. Insert, drag, resize, rotate, pan, zoom, and pattern selection each produce an atomic undo/redo entry and do not touch the production Designer canvas.

## Styling

`styles/_newdesign.sass` is imported from `src/lib/styles/index.sass`. It uses semantic design tokens for the sidebar, unit card, grid viewport, canvas controls, pattern overlay layer, and the pattern picker gallery (`newdesign-pattern-*`: trigger, dropdown menu, group headings, tile grid, scaled preview/thumb layers). Dynamic camera position, zoom scale, size, and rotation are supplied as Svelte style directives; the selected canvas pattern is applied as derived inline `style` strings on the viewport (base color) and its pattern overlay (artwork + masks).
