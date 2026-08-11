---
id: ADR-006
title: Mandatory Undo/Redo Boundary for User-Editable State
type: adr
tags: [undo-redo, state-management, ide-state]
summary: Requires every user-editable state surface to expose snapshot/restore history through the active-template undo coordinator.
relates_to: [ADR-002, ADR-005, ADR-015]
status: accepted
updated: 2026-07-13
---


**Status:** Accepted
**Date:** 2026-06-24
**Decision makers:** Frontend Lead, Product Owner

---

## Context

FractalEngine is an IDE where users constantly modify state: typing in the editor, adjusting panel layouts (tile positions, sizes, stacking), changing theme settings, resizing the browser panel, editing AI provider configurations, modifying password vault entries, and adjusting font preferences. Without undo/redo support, every action is permanent — a mistaken keystroke, accidental tile drag, or incorrect configuration change cannot be rolled back.

Desktop IDE users expect undo/redo to work system-wide (Cmd+Z / Ctrl+Z) across all editable surfaces, not just within the text editor. VS Code and IntelliJ provide universal undo/redo, and the FractalEngine user experience must meet the same standard.

However, implementing undo/redo for complex state is difficult:

- Different state domains (editor content, tile layout, settings, AI config, vault) have different snapshot representations.
- Simply debouncing keystrokes for undo snapshots is insufficient — the user expects undo granularity at the action level (one undo per paste, per delete, per tile move).
- Performance matters: taking full-state snapshots on every change (via `JSON.stringify`) has a cost, especially for large editor documents.
- The undo stack must be bounded to prevent unbounded memory growth.

The application has both a text editor (CodeMirror with its own built-in undo/redo) and IDE state (layout, settings, configuration). The decision covers only the IDE state layer — CodeMirror's native undo/redo handles editor content independently.

---

## Decision

We will implement a mandatory undo/redo boundary covering all user-editable IDE state outside text editors, using snapshot/restore histories routed by the active-template coordinator in `undo.svelte.ts`.

**Mechanism:**

1.  **Snapshot representation** — an `IDEStateSnapshot` interface captures all mutable state fields (window sizes, active tabs, browser URL, password vault list, editor preferences, AI provider configuration, attached files, local model paths) as serializable values.

2.  **`takeSnapshot()`** — serializes the current IDE state into an `IDEStateSnapshot` object.

3.  **`restoreSnapshot(snapshot)`** — applies a snapshot back to the IDE state, restoring every field to the captured values.

4.  **Undo stack (`undoStack: string[]`)** and **redo stack (`redoStack: string[]`)** — both store `JSON.stringify`'d snapshots for safe deep cloning. The undo stack is capped at 50 entries.

5.  **`pushUndo()`** — invoked before every state mutation. If the current state is identical to the top of the stack, the snapshot is skipped (no duplicate entries). The redo stack is cleared on new actions per standard undo/redo semantics.

6.  **`undo()` / `redo()`** — pop from one stack, push current state to the other, call `restoreSnapshot()`. An `isApplyingUndoRedo` guard prevents `pushUndo()` from firing during restoration and creating infinite loops.

7.  **`isApplyingUndoRedo` guard** — prevents recursive snapshot capture when `restoreSnapshot()` triggers reactive updates that would call `pushUndo()` again.

**Coverage:** The Home/code shell uses `ideState`; Notes layout uses `notes`; FractalDesign merges its layout and scene histories using a shared sequence clock; and the Blank spatial canvas uses `canvas`. Every discrete mutation calls `pushUndo()` before changing state, while continuous pointer/wheel gestures call `beginGesture()` and `endGesture()` once per interaction.

`undoCoordinator` selects the visible template's domain, so Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, and native Edit → Undo/Redo all reach the same active history. Inputs, CodeMirror, and TipTap retain their own native text histories and are not intercepted by the coordinator.

**Enforcement:** The rule is documented in AGENTS.md (Rule 8: "Any user-editable state must support a complete Undo/Redo boundary") and enforced in code review — any new state mutation pathway must call `pushUndo()` before modifying state.

For design-canvas gestures that temporarily mutate a renderer-owned scene copy, the boundary starts on pointer-down against the canonical `designcanvas` snapshot and commits on pointer-up after the moved/resized/rotated scene replaces the canonical scene. Capturing both snapshots on pointer-up is invalid because it records the already-mutated state twice and produces no undo entry.

The design-domain snapshot also includes the reusable component library. Saving, renaming, duplicating, or deleting a user component must record and commit a design gesture just like moving or resizing a canvas node.

Snapshots must cover the complete logical mutation, not merely the fields visible in the active panel. IDE snapshots therefore include workspace roots, directory entries, expanded paths, tab topology, file buffers, and saved workspace/vault metadata. Async mutations capture before starting, commit only after durable success, and roll back on failure. A request-generation guard prevents a slower file read from overwriting a later selection.

Animated and debounced interactions expose a synchronous settle boundary. Before undo, redo, reload, or native close, the shell notifies mounted surfaces to finalize their intended state and commit the gesture; persistence then serializes that canonical snapshot. This prevents an animation frame or debounce timer from escaping history or being lost during teardown.

Composite UI actions must create exactly one history entry. Secondary state changes required to finish the action—such as selecting the neighboring tab after closing the active tab—use the same captured boundary and must not call `pushUndo()` independently.

---

## Consequences

### Positive

- Users can undo/redo all IDE state changes with Cmd+Z / Ctrl+Z, matching the muscle memory expectation from VS Code and other desktop IDEs.
- The snapshot/restore pattern is straightforward to reason about — there is no command pattern, no event sourcing, no complex delta computation.
- The `isApplyingUndoRedo` guard prevents infinite recursion without requiring listeners to be torn down and reattached during restoration.
- The 50-entry cap bounds memory usage — each snapshot is roughly 2-8KB JSON, so the stack stays under ~400KB even in the worst case.

### Negative

- `JSON.stringify` + `JSON.parse` on every undo/redo action has a computational cost. For the current state size (dozens of fields, none containing large blobs beyond the active file content), the cost is negligible (&lt; 1ms). If the snapshot grows to include large data (e.g., full password vault with 10,000 entries or AI conversation history with megabytes of messages), the cost will become noticeable and the approach may need optimization.
- The snapshot captures _all_ state, not just the changed domain — undoing a vault entry change also restores editor font size to its value at snapshot time. This means undo granularity is tied to `pushUndo()` call points rather than to logical action boundaries. If two independent settings are changed in quick succession, undoing the second will not preserve the first change.
- CodeMirror has its own undo/redo stack, creating two separate undo systems: one for editor content (Cmd+Z within the editor) and one for IDE state (Cmd+Z outside the editor). Users must learn which context they are in, though this matches VS Code's behavior (editor undo vs. command undo).

### Neutral

- The snapshot model means adding a new state field requires updating three locations: the field declaration, `takeSnapshot()`, and `restoreSnapshot()`. This is mechanical but must be done for every new field.
- The terminal commands `undo` and `redo` expose the system to mock terminal users, ensuring the feature is testable outside the Cmd+Z binding.

---

## Alternatives Considered

### Command pattern (individual undoable commands)

Each state mutation would be wrapped in a Command object with an `execute()` and `undo()` method. Rejected because the command pattern requires implementing inverse operations for every mutation, which doubles development effort. For example, a "change font size" command would need to store the previous font size, a "move tile" command would need to store both the old and new positions, and a "delete vault entry" command would need to store the entire deleted entry. The snapshot approach achieves the same result with a fraction of the code.

### Event sourcing / delta-based undo

Store a log of state diffs (patches) and reverse-apply them. Rejected because computing and applying deltas for complex nested state objects is error-prone. Patch conflicts (e.g., undoing an action whose dependent state has since changed) require conflict resolution logic that the snapshot approach avoids entirely.

### User-selectable independent undo stacks

Rejected because users should not choose an undo stack manually. Internally scoped histories are still required to keep unrelated app templates from restoring each other's invisible state; `undoCoordinator` selects the correct domain automatically from the visible template.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-002 | Svelte 5 Runes-Only State Management | The undo/redo system is implemented using `$state` arrays in `ide.svelte.ts` |
