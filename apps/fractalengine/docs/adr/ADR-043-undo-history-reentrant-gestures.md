---
id: ADR-043
title: Make UndoHistory Gestures Reentrant-Safe
type: adr
tags: [undo-redo, transactions, engine, designer, gestures, state]
summary: beginGesture/endGesture now track depth like transact() so a mutation helper that wraps its own gesture (e.g. pasteBlock inside an Alt-drag duplicate) cannot prematurely consume the outer gesture's snapshot; fixes a class of undo-boundary holes including the designer Alt-drag duplicate.
relates_to: [ADR-026, ADR-021]
status: accepted
updated: 2026-07-18
---

# ADR-043: Make UndoHistory Gestures Reentrant-Safe

**Status:** Accepted
**Date:** 2026-07-18
**Decision makers:** Agent (designer audit)

## Context

Rule 9 (every user-editable mutation is one atomic undo entry) is enforced by
the core `UndoHistory` engine introduced in ADR-026. The engine exposes two
wrappers for grouping mutations into a single undo entry:

- **`transact(fn)`** — used by discrete mutations. Already reentrant-safe via a
  `transactionDepth` counter: nested `transact` calls coalesce into one entry
  committed by the outermost call.
- **`beginGesture()` / `endGesture()`** — used by continuous pointer gestures
  (drags, resize, rotate, viewport pan/zoom, slider scrubbing). A snapshot is
  captured by `beginGesture` and committed by `endGesture`.

The designer canvas module (`designcanvas.svelte.ts`) wraps every continuous
pointer gesture in `recordGestureStart()` / `commitGesture()` (thin wrappers
over `beginGesture`/`endGesture`). Several discrete mutation helpers — notably
`pasteBlock`, `duplicateSelected`, `createBlockAt`, `insertTemplate`, and the
import paths — *also* wrap themselves in `recordGestureStart` /
`commitGesture` so they remain undoable when invoked standalone (e.g. Cmd+V
paste from the keyboard).

The bug: `endGesture` was **not** reentrant-safe. Its implementation was

```ts
endGesture(): void {
    const before = this.gestureSnapshot;
    this.gestureSnapshot = null;
    if (before === null || this.equals(before, this.capture())) return;
    this.pushEntry(before);
}
```

`beginGesture` was idempotent on start (`if (this.gestureSnapshot === null) …`),
but `endGesture` unconditionally cleared `gestureSnapshot` and pushed an entry.
So when a discrete mutation helper (e.g. `pasteBlock`) was invoked from inside
an in-progress outer gesture (e.g. the Alt-drag duplicate flow in
`DesignLayout.handleSelect`), the inner `endGesture` consumed the outer
gesture's pre-mutation snapshot and pushed an entry immediately. The subsequent
drag movement was then captured by no entry — `gestureSnapshot` was already
null when the outer `endGesture` ran.

**User-visible symptom:** Alt-drag to duplicate a block, drag the duplicate to
a new position, release, then Cmd+Z. Undo restored the canvas to the
pre-duplicate state (deleting the duplicate *and* discarding the drag), and
redo restored the duplicate at its pre-drag position (losing the final drag
location). The entire point of the gesture — coalescing duplicate + drag into
one atomic undo entry — was defeated.

A targeted audit (AGENTS.md Rule 12, mutation inventory) confirmed this was a
class of bug, not a single call site: any discrete mutation helper that wraps
itself in a gesture, when called from inside an outer gesture, would exhibit
the same premature-commit behavior. The Alt-drag duplicate was simply the path
that exercised it.

## Decision

We will make `beginGesture` / `endGesture` reentrant-safe via a `gestureDepth`
counter, mirroring the depth-tracking pattern already used by `transact()`.

- `beginGesture` increments `gestureDepth` and only captures a snapshot when
  depth transitions 0 → 1 (i.e. the outermost gesture owns the snapshot).
- `endGesture` decrements `gestureDepth` and only commits when depth returns
  to 0. Inner `endGesture` calls are no-ops — the outer gesture still owns the
  snapshot.
- `clear()` resets both `gestureSnapshot` and `gestureDepth` so a mid-gesture
  clear cannot leave the depth stuck above zero.
- A stray `endGesture` with no matching `beginGesture` (depth already 0) is a
  safe no-op rather than pushing a spurious entry or throwing.

This was chosen over the alternatives because it fixes the entire class of
nested-gesture bugs at the engine layer with a five-line change, requires no
modification to any call site, and is behaviorally identical to the old
implementation for the already-correct top-level gesture call sites (depth
goes 0 → 1 → 0 and commits as before).

## Consequences

### Positive

- Alt-drag duplicate now produces exactly one undo entry spanning the
  duplicate creation and the subsequent drag, matching the Figma-style
  behavior users expect. Undo restores the pre-duplicate canvas; redo
  restores the duplicate at its final dragged position.
- The fix is structural: any future mutation helper that wraps itself in a
  gesture and is later invoked from inside an outer gesture (e.g. a future
  "paste in place inside a marquee drag") is automatically correct without
  the author having to know about the nesting rule.
- The engine's two coalescing primitives (`transact` and gestures) now share
  the same reentrancy contract, reducing the cognitive surface for call-site
  authors.
- Backward-compatible: all existing top-level gesture call sites
  (`handleViewportWheel`, `applyViewportAction`, `startScaleGesture`, the
  popover auto-commit setter, inspector slider scrubbing) behave identically
  to before — verified by the pre-existing `undo-history.test.ts` suite
  passing unchanged.

### Negative

- A gesture that legitimately *should* commit at an inner boundary (i.e. a
  mutation helper that wants to push its own undo entry even when called
  inside an outer gesture) can no longer do so via `beginGesture` /
  `endGesture`. No such call site exists today — discrete helpers that need
  their own entry are already correct to coalesce when nested — but a future
  need would require either `transact()` (which does not compose with an
  in-progress gesture) or a new explicit "force commit" primitive. Accepted
  as unlikely; if it arises, a dedicated API is preferable to re-introducing
  the premature-commit footgun.
- The depth counter is one more piece of engine state to reason about during
  audits. Rule 12's mutation inventory must now also confirm that every
  `beginGesture` has a matching `endGesture` even across async and error
  paths — a property that was already implicitly required but is now
  load-bearing for correctness (a leaked `gestureDepth > 0` would suppress
  the next commit). Mitigated by `clear()` resetting the depth and by the
  regression tests added in `tests/unit/undo-history.test.ts`.

### Neutral

- `tests/unit/undo-history.test.ts` gains two cases (5a nested-gesture
  coalescing, 5b stray endGesture no-op) pinning the new contract. Total
  suite count is now 12 engine tests / 194 unit tests overall.
- No call-site changes were required; the fix is entirely inside
  `src/lib/state/undoHistory.svelte.ts`.

## Alternatives Considered

### Expose `isGestureActive` and make nested helpers skip their own commit

Add a public `isGestureActive` getter (or `gestureDepth > 0` check) and have
`pasteBlock` / `duplicateSelected` / `createBlockAt` conditionally skip their
`recordGestureStart` / `commitGesture` when an outer gesture is in progress.

Rejected because it scatters the nesting-awareness contract across every
discrete mutation helper — each new helper would need to remember the
conditional, and forgetting it would silently reintroduce the bug. It also
inverts the layering: the helper would have to know whether its caller is in
a gesture, which the helper has no business knowing. The depth-tracking fix
centralizes the contract in the engine where `transact` already had it.

### Convert the discrete helpers from gestures to `transact()`

Replace `recordGestureStart` / `commitGesture` in `pasteBlock`,
`duplicateSelected`, etc. with `this.history.transact(() => { … })`, relying
on `transact`'s existing reentrancy.

Rejected because `transact` and gestures do not compose: `transact` tracks
`transactionBefore` / `transactionDepth`, while gestures track
`gestureSnapshot`. A `transact` invoked inside an in-progress
`beginGesture` would capture its own `transactionBefore` from the mid-gesture
state and push a separate entry keyed to that mid-gesture snapshot — not the
pre-gesture snapshot the outer gesture intended. The two primitives serve
different shapes of mutation (discrete vs. continuous) and unifying them
under `transact` would require either collapsing the distinction (losing the
ergonomics of gesture coalescing for pointer drags) or adding the same
depth-tracking to gestures anyway, at which point this alternative collapses
into the chosen fix.

### Restructure the Alt-drag call site to start the gesture after the duplicate

Move `recordGestureStart()` in `DesignLayout.handleSelect` to *after* the
`duplicateSelected()` call, so the duplicate's own gesture commits cleanly
before the drag's gesture begins.

Rejected because it would produce *two* undo entries for an Alt-drag
duplicate (one for the duplicate creation, one for the drag), violating the
Figma-style single-atomic-entry expectation that Rule 9 calls for. It also
leaves the underlying engine bug in place for any other nested-gesture call
site, including future ones.

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-026 | Core Undo Engine (Snapshot Transactions) | Builds on this ADR; the `transact()` depth pattern is the template for the gesture depth fix |
| ADR-021 | Designer Module Extraction | The designer module whose audit surfaced the bug; its `recordGestureStart` / `commitGesture` wrappers are the call sites that exercise nesting |

## Notes

The dead-code state-layer `commitDrawBlock` path
(`CanvasState.commitDrawBlock`, which calls `commitGesture` without a matching
`recordGestureStart`) was identified during the same audit but left unfixed:
it is unreachable in the current architecture because `DesignLayout` owns the
live pointer path and routes block creation through `createBlockAt` (which is
correctly wrapped). If the state-layer pointer path is ever revived, the
missing `recordGestureStart` must be added — or, with this ADR applied, the
stray `commitGesture` is at least a safe no-op rather than a spurious entry.
