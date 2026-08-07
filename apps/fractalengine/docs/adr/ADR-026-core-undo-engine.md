---
id: ADR-026
title: Core Undo Engine (Snapshot Transactions)
type: adr
tags: [undo-redo, transactions, engine, state, architecture]
summary: Replaces five hand-rolled per-domain undo stacks with one core UndoHistory engine; mutations run inside transact() so rule 9's one-atomic-entry-per-mutation invariant is enforced structurally instead of verified per audit.
relates_to: [ADR-006, ADR-015, ADR-021, ADR-022, ADR-024, fractaldocs, src/lib/state/undoHistory.svelte.ts, src/lib/state/undo.svelte.ts]
status: accepted
updated: 2026-07-15
---

# ADR-026: Core Undo Engine (Snapshot Transactions)

**Status:** Accepted

## Context

Rule 9 (every user-editable mutation is one atomic undo entry) was enforced by five
independently hand-rolled stack implementations — the kernel (`ide.svelte.ts`), the
blank-template canvas, notes layout, the designer pair (`design` + `designcanvas`),
and the AI workspace. They had quietly diverged: the kernel capped at 50 entries with
dedupe-identical-top and a skip-equal-top-on-undo trick; every other domain capped at
100 with neither; the designer kept order-stamped parallel arrays for cross-store
routing; three separate gesture-coalescing implementations existed. Each whole-app
audit re-verified the same stack semantics five times (rule 12's mutation inventory).

## Decision

One core engine, `src/lib/state/undoHistory.svelte.ts`:

- **`UndoHistory<S>`** owns stack semantics — capacity, redo invalidation,
  dedupe-identical-top, skip-equal-top-on-undo, historyClock order stamping, gesture
  begin/end coalescing. Domains keep their own snapshot shapes and provide only
  `capture`/`restore` (plus `capacity`/`equals` options).
- **`transact(fn)`** makes atomicity structural: one entry per outermost transaction,
  nested transactions coalesce, a no-change transaction produces no entry. `push()`
  remains for not-yet-converted call sites and is transaction-aware (no double
  entries).
- **`compositeUndoDomain(id, histories, primary)`** generalizes the designer pattern:
  undo/redo route to the history holding the most recent order stamp.
- The coordinator maps each template to its registered domain. FractalDocs registers the
  `docs` domain while all domains keep the `{id, undo, redo, pushUndo}` contract backed by
  the shared engine.

This is deliberately a **snapshot-transaction engine, not command objects**: every
domain was already snapshot-based, and the audit pain lived in stack semantics, not
snapshot shapes.

## Scope and deferrals

- Canvas, notes, designer (both stores), AI, and FractalDocs converted their user-editable
  layout mutations to the shared history boundary. FractalDocs uses gesture coalescing for
  pointer resizing and a discrete pre-mutation entry for keyboard resizing.
- The kernel **adopted the engine** (its hand-rolled stack code is deleted; capacity
  50 and both historical tricks preserved via engine options/built-ins) but its ~28
  `pushUndo()` call sites are NOT yet converted to `transact()` — that conversion
  belongs to the kernel-decomposition phase (see ADR-023's deferral).
- One sanctioned behavior delta: transactions that change nothing no longer push
  phantom no-op entries.

## Consequences

- `grep -rn "undoStack\|redoStack" src` matching only `undoHistory.svelte.ts` is the
  structural completeness check — no hand-rolled stack survives.
- `tests/unit/undo-history.test.ts` pins ten engine invariants (atomicity, nested
  coalescing, no-op suppression, redo clearing, gesture coalescing, capacity,
  dedupe, undo-skip, round-trip restore, composite routing); rule 12's mutation
  inventory now verifies that new mutations run inside `transact()` rather than
  re-verifying stack mechanics per domain.
- `compositeUndoDomain` required widening its parameters to `UndoHistory<any>[]`
  post-contract (generic variance); the API is otherwise as frozen in the plan.
