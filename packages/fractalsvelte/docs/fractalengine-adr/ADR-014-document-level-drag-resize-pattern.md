---
id: ADR-014
title: Document-Level Pointer and Keyboard Resize Pattern
type: adr
tags: [notes, layout, drag-resize, accessibility, undo-redo, svelte-5, runes]
summary: Resize separators use document-level pointer continuation, keyboard arrows, accessible values, and one undo snapshot per completed gesture.
relates_to: [ADR-012, ADR-010, src/lib/modules/notes/components/NotesLayout.svelte, src/lib/modules/notes/components/NotesEditor.svelte, src/lib/modules/designer/components/DesignLayout.svelte]
status: accepted
updated: 2026-07-13
---


**Status:** Accepted
**Date:** 2026-06-25
**Deciders:** Frontend fixes pass during Notes template stabilization

**Amended:** 2026-07-13 — separators now support keyboard arrows and ARIA values; pointer gestures open and close one domain undo boundary. FractalDesign uses the same contract for both shell panels.

---

## Context

The Notes workspace ([ADR-012](ADR-012-markdown-notes-wiki-with-tiptap.md)) needs four user-resizable regions: the left vault sidebar, the middle file list sidebar, the right AI sidebar, and the raw/rich split inside the editor. Each region is separated by a thin handle (6 px for the editor split, similar for sidebar handles). When the user starts dragging a handle, the drag must continue uninterrupted even if the cursor leaves the handle's narrow hit-area and enters an adjacent panel — otherwise the drag breaks mid-motion and the panel "snaps back."

Three naive implementations were tried and failed:

1. **Handle-only mousemove.** The `mousedown` and `mousemove` handlers were both on the 6 px-wide handle. As soon as the cursor left the handle, no `mousemove` fired and the drag stalled. This was the original NotesEditor bug.
2. **`document.addEventListener('mousemove', ...)` per handle.** Each handle adds and removes its own global listener. This works but produces four near-identical handler pairs and is easy to leak listeners on teardown.
3. **Svelte `bind:clientWidth` / `bind:offsetWidth`.** These bindings are *output-only* and do not fire during user drags; they only fire when the layout actually changes, which is the opposite of what we need.

The existing Classic IDE layout ([ADR-010](ADR-010-classic-ide-layout-integration.md)) already uses approach (2) successfully for its four sidebar/terminal handles. The Notes layout additionally needs the handle to be **inside a different component** than the parent that owns the resize state — NotesEditor's split handle emits an event up to NotesLayout, which owns the actual `editorSplitRatio` state. This rules out the simplest version of approach (2) and forces a clean separation.

The CSS split itself was also broken: the original `.notes-editor-inside` had `display: flex` AND `grid-template-columns: 1fr 1fr`, which silently dropped the grid rule. Flex-basis was the correct fix.

---

## Decision

We will use the **document-level mousemove** pattern for every drag-resize handle in the app, with two implementations selected per use case:

### Variant A — Wrapper-level mousemove + flag dispatcher (Notes layout)

Best when a **parent component owns the resize state** and a **child emits a `mousedown` start callback**:

1. The child handle sets a flag via `onmousedown={...}` callback that takes the start geometry (`{ x, ratio }` or similar).
2. The parent wrapper has a single `onmousemove={handleGlobalMouseMove}` that reads each flag and updates the relevant state.
3. A global `window.addEventListener('mouseup', stopResize)` clears all flags (the wrapper may not see `mouseup` if the cursor leaves the window).

This is what `NotesLayout` does for all four regions — including the editor split, where the `mousedown` callback propagates up from `NotesEditor`'s split handle via the `onSplitResize` prop.

### Variant B — Per-handle window listeners (Classic IDE layout)

Best when **the same component owns both the handle and the state**, and the handles are conceptually independent. Each handle's `mousedown` adds its own `window.mousemove` / `window.mouseup` listeners and removes them on `mouseup`. This is what `ClassicIdeLayout` does.

### CSS split

Split panes must use **`display: flex`** with `flex-basis: var(--split-ratio)` — never `display: grid` with `grid-template-columns` because the two are mutually exclusive on the same element. The split ratio is exposed as an inline CSS custom property (`--split-ratio: 50%`) on the flex container, and each pane reads it via `flex: 0 0 var(--split-ratio, 50%)`. The rich pane uses `flex: 1 1 0` to take remaining space. Inline `width: 100%` rules on the panes are forbidden — they fight flex-basis.

### Defaults

| Region | Default | Min | Max |
|--------|---------|-----|-----|
| Sidebar 1 (vault) | 220 px | 160 px | viewport − other widths − 40 |
| Sidebar 2 (files) | 260 px | 180 px | viewport − other widths − 40 |
| Sidebar 3 (AI) | 320 px | 200 px | viewport − other widths − 40 |
| Editor split | 50 % | 20 % | 80 % |

The `- 40` magic constant reserves room for the vertical resize handles.

---

## Consequences

### Positive

- Drag-breaks-mid-motion is eliminated across all four Notes regions and all four Classic IDE regions. Resize handles feel solid in both directions of motion.
- The wrapper-level dispatcher (Variant A) keeps each region's resize state co-located with the rest of that region's state in `NotesLayout`. There is exactly one mousemove listener per wrapper, not four.
- The flag-based pattern composes cleanly with Svelte 5 runes: flags are `$state<boolean>`, the dispatcher reads them, and Svelte schedules re-renders during the drag.
- Variant B (per-handle listeners) is preserved for `ClassicIdeLayout` because removing it would be a backwards-incompatible behavior change with no measured benefit — both variants work.
- The CSS split fix unblocks any future use of `display: flex` in split panes; the old grid+flex mix was an outright bug.

### Negative

- The wrapper-level dispatcher must guard against each flag being stale (e.g., a sidebar resize flag set when the sidebar is later removed). We rely on `mouseup` always firing eventually; if the browser tab is closed mid-drag, the next mount starts fresh, so this is acceptable.
- The editor split requires `NotesEditor` to emit a structured `{ x, ratio }` callback rather than a raw `MouseEvent`, because the parent does not have access to the handle's DOM node. This is a slightly heavier contract than a bare `MouseEvent`, but it makes the geometry snapshot explicit.
- The `- 40` magic constant for the `- 40` slack in sidebar widths is not symbolic. If more vertical handles are added between sidebars, this number must be revisited. Documenting it in this ADR is the only mitigation short of a CSS variable.
- Variant B leaks listeners if `mouseup` does not fire (e.g., `iframe` focus loss). The current handler cleanup is in `stopResize` which is wired to `window.mouseup` — adequate for normal use, fragile for corner cases.

### Neutral

- We now have two resize implementations in the codebase (NotesLayout Variant A, ClassicIdeLayout Variant B). Each component is self-contained and they do not share helpers. A future consolidation is possible but not required today.
- The old `isUpdatingEditor` / `lastSyncedContent` flags in `NotesEditor` were renamed to `isApplyingExternal` / `lastPushedContent` during this same change to express intent more clearly. This was incidental, not part of the resize decision.

---

## Alternatives Considered

### Pointer capture (`element.setPointerCapture`)

Use the Pointer Events API's capture-and-release to keep mousemove firing on the handle regardless of cursor position. This is technically the cleanest solution. Rejected for now because (a) it is not yet used elsewhere in the codebase, (b) it has subtle behavior differences with `touch` and `pen` pointer types that the current implementation does not need, and (c) the document-level approach is already proven in `ClassicIdeLayout` and ports easily. Re-evaluate if we add touch / pen support to the resizable regions.

### CSS `resize` property

Use the browser's native `resize: horizontal` on the textarea or a `<div>`. Rejected because it gives no way to clamp to a min/max, no way to drive an external state variable, and produces inconsistent visual affordances across browsers.

### Svelte `use:` action with pointer events

Wrap each handle in a `use:draggable` action that internally uses pointer events. Rejected because it inverts the data flow — the parent should own the geometry, not the handle. Also adds a third-party-style abstraction to a problem that is solved cleanly with two well-understood primitives (`mousedown` flag + `mousemove` dispatcher).

### Two `$effect`s for editor create + content sync (rejected earlier)

The original NotesEditor had separate effects for TipTap creation and content sync. These raced: the sync effect ran before the create effect on first mount, leaving the rich editor empty. Combining them into one effect that handles both creation (no editor yet) and sync (editor exists) is the fix adopted in this change. Documented here for context, not as a rejected alternative for the resize decision itself.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|--------------|
| ADR-010 | Classic IDE Layout Integration and Restoration | Sibling; uses Variant B (per-handle listeners) for the same problem class |
| ADR-012 | Markdown Notes & Wiki Workspace with TipTap | Enables; the Notes workspace is where Variant A is applied |
| ADR-006 | Mandatory Undo/Redo Boundary | Sidebar widths and split ratio should be undoable; not yet implemented but flagged for future work |

---

## Notes

- The `- 40` magic constant in sidebar width constraints should be promoted to a SASS variable or a CSS custom property if a fourth vertical handle is ever added.
- Variant A's wrapper-level dispatcher could be extracted into a generic `use:resizeGroup` action if a third layout needs it. Today, only `NotesLayout` uses Variant A.
- Touch / pen pointer support is not yet implemented in either layout. The Pointer Events API path (see Alternatives) is the recommended upgrade path when needed.
