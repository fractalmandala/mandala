---
id: ADR-047
title: Adopt Vendor-Extracted Background Patterns for the New Design Canvas
type: adr
tags: [newdesign, canvas, patterns, undo-redo, styling]
summary: Applies light geometric vendor background patterns to the New Design canvas via static module data, a header pattern picker, and undo-bound selection state.
relates_to: [ADR-026, ADR-045, newdesign]
status: accepted
updated: 2026-07-19
---


**Status:** Accepted
**Date:** 2026-07-19
**Decision makers:** Project owner, implementing agent

---

## Context

The New Design canvas (ADR-045) ships with a single hard-coded token grid as its viewport background. The repository vendors a pattern catalogue at `vendors/patterns/data/patterns.ts` with 99 `geometric` entries — roughly two thirds light variants (white/light bases) and one third dark variants (`#000`-family bases) — each carrying `background`, `backgroundImage`, `backgroundSize`, `backgroundPosition`, and optional mask properties.

The owner wants to evaluate these light geometric patterns as live canvas backgrounds while working in the tester template. Two forces shape the solution space: the mandatory Undo/Redo boundary (AGENTS.md rule 9) requires the selection to be undoable state, and the two-layer token system plus module stylesheet discipline (ADR-043-era rules) forbid component-local `<style>` blocks, so dynamic per-pattern CSS must arrive as inline style bindings driven by state.

---

## Decision

We will extract the 64 light geometric patterns into static module data at `src/lib/modules/newdesign/data/canvasPatterns.ts`, expose them through a `CanvasPatternSelect.svelte` dropdown gallery in the shell header (rendered only when `appState.activeTemplateId === 'tester'`), and apply the selected pattern to the New Design canvas as derived inline styles.

We chose static extraction over importing the vendor file at runtime because the vendor file is React-flavoured TypeScript (`CSSProperties`, JSX `code` blobs, `@/` alias) that cannot be imported directly by the Svelte app, and because extraction lets us drop the 35 dark variants and the unused `code` field at build-authoring time rather than shipping them. We chose undo-bound selection (`newdesign.setCanvasPattern` inside `UndoHistory.transact()`, with `canvasPatternId` captured in the domain snapshot) over transient component state because the canvas background is user-editable surface state, so AGENTS.md rule 9 applies. Two rendering details follow from the token architecture: the dropdown portals into `.app-root-shell` rather than `body` because semantic tokens are theme-class-scoped (the same constraint as the Bits UI tooltip), and the backdrop is split across two layers — base color on the viewport, artwork and masks on a `.newdesign-canvas-grid-pattern` overlay beneath the world layer — because a CSS mask applies to the whole element and would otherwise fade the pattern's light base color along with the artwork.

---

## Consequences

### Positive

- All 64 light geometric patterns are selectable at runtime and swap in realtime; a "Default Grid" option restores the original token grid.
- Pattern selection, unit edits, and camera gestures share one atomic undo/redo history in the registered `newdesign` domain.
- The picker reuses existing header chrome (`.btn-icon-text`, `.icon-svg`) and token-only module SASS (`.newdesign-pattern-*`), so no new visual language or style block is introduced.

### Negative

- `canvasPatterns.ts` duplicates data already present in `vendors/patterns/data/patterns.ts`; if the vendor catalogue is refreshed, the extraction script (or an equivalent manual pass) must be re-run to pick up new or renamed patterns.
- Patterns carry hard-coded light base colors (`#ffffff`, `#f8fafc`, …) by design; they do not adapt to the app theme, so the canvas can clash with dark themes while a light pattern is selected. Accepted because the owner explicitly requested the light variants.

### Neutral

- When a pattern is active, the camera no longer pans/zooms the background (pan/zoom grid sizing only applies to the Default Grid); the pattern is a viewport-fixed backdrop.
- `+page.svelte` gains one more template-conditional header component, consistent with the existing per-template header branches.

---

## Alternatives Considered

### Import `vendors/patterns/data/patterns.ts` directly at runtime

Rejected because the file is React TypeScript with JSX template strings and an `@/` path alias; importing it would require aliasing, type shims, and would bundle the dark variants and unused `code` blobs into the app for zero runtime benefit.

### Store the pattern id outside the undo history (plain `$state`)

Rejected because the canvas background is user-editable state; AGENTS.md rule 9 requires every such mutation to produce one atomic undo entry. A non-undoable picker would silently diverge from the rest of the canvas' undo model (units and camera are already undoable per ADR-045).

### Render patterns as token-driven SASS classes

Rejected because pattern definitions are data (multi-layer gradients, masks, per-pattern sizes) that cannot be expressed as a finite token map; inline style bindings are the project's sanctioned channel for dynamic visual values (same mechanism the camera uses for pan/zoom).

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-045 | Isolate the New Design Canvas Grid | depends on; this picker targets the isolated canvas viewport ADR-045 established |
| ADR-026 | Undo/Redo Boundary for User-Editable State | depends on; pattern selection joins the `newdesign` undo domain |
