---
id: undo-system
title: Undo System Area
type: area
tags: [undo-redo, state, history]
relates_to: [ADR-006, ADR-014, ADR-026]
summary: Covers the transaction-based global undo/redo history engine and domain boundaries.
updated: 2026-07-22
---

# Undo System Area

## Purpose & boundaries

The Undo System area manages transaction history stacks, snapshot capture, restore coordinates, and the cross-domain history clock.

## State & persistence

- **History Registry**: State fields in `state/undoHistory.svelte.ts` and `state/undo.svelte.ts`.
- **Clock**: `state/historyClock.ts`.

## Extension points

- **Domain Registration**: Register domain state snapshot hooks via `registerUndoDomain(id, hooks)`.
- **Transactions**: Execute mutable operations within `UndoHistory.transact('Label', () => { ... })` boundaries (ADR-026).

## Cross-area edges

- **State mutators**: Integrates with designer canvas, notes workspace, and bookmarks state domains.
- **Workspace surfaces**: Each `WorkspaceShell` profile keeps its own pane history, so undoing a Code sidebar change cannot affect the Design, Agent, Media, Docs, Notes, or Dev profile after a module switch.

## Gotchas

- **Boundary enforcement**: Every user-editable UI change (sliders, text inputs, form options) must route through transactions to satisfy undo contracts.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`historyClock.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/historyClock.ts) | historyClock.ts |
| [`undo.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/undo.svelte.ts) | Matches what ideState/designcanvas actually implement (their own internal undo/redo |
| [`undoHistory.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/undoHistory.svelte.ts) | undoHistory.svelte.ts |
| [`undo-history.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/undo-history.test.ts) | undo-history.test.ts |

<!-- filetable:end -->
