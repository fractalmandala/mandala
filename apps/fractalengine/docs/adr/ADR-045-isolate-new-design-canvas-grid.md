---
id: ADR-045
title: Isolate the New Design Canvas Grid
type: adr
tags: [newdesign, canvas, pan-zoom, undo-redo, isolation]
summary: Establishes a standalone pan-and-zoom canvas grid for the New Design surface without reusing production Designer canvas code.
relates_to: [ADR-026, ADR-043, newdesign]
status: accepted
updated: 2026-07-19
---

# ADR-045: Isolate the New Design Canvas Grid

## Context

The New Design surface is a fresh interaction area. Reusing the production Designer canvas would carry seeded content, selection behavior, transforms, and engine dependencies into a workspace intended to begin empty.

The surface needs a stable world coordinate system for draggable units today and panning and zooming tomorrow. Its camera mutations must also participate in the application undo boundary.

## Decision

We will use a standalone `newdesign` canvas grid component and camera state for the New Design surface.

`CanvasGrid.svelte` owns viewport clipping, grid rendering, panning, zooming, and coordinate conversion. `canvasGrid.svelte.ts` owns the camera state and its history; the existing New Design unit history composes with it through the core undo engine.

## Consequences

### Positive

- The new surface has no imports from the production Designer canvas, blocks, or interaction engines.
- Units remain in stable world coordinates as the grid pans or zooms.
- Camera and unit mutations remain individually undoable through one template domain.

### Negative

- The New Design area now owns a small dedicated camera interaction implementation that must be maintained separately from the production Designer.

### Neutral

- Future grid features, such as fit-to-content or rulers, extend the standalone grid files rather than the layout.

## Alternatives Considered

### Reuse the production Designer canvas

Rejected because it carries pre-existing canvas state and interaction dependencies into a deliberately clean surface.

### Keep the grid as a layout background

Rejected because a background cannot provide a stable world coordinate system for panning, zooming, and unit placement.

## Related Decisions

| ADR | Title | Relationship |
|---|---|---|
| ADR-026 | Core Undo Engine | Enables composed camera and unit histories. |
| ADR-043 | Make UndoHistory Gestures Reentrant-Safe | Supports continuous camera gestures. |
