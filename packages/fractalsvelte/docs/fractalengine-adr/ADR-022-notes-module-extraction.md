---
id: ADR-022
title: Notes Module Extraction
type: adr
tags: [notes, module, extraction, architecture]
summary: Extracts notes and wiki features into a self-contained module under src/lib/modules/notes/ with its own components, state, styles, and frontmatter parser.
relates_to: [ADR-015]
status: accepted
updated: 2026-07-15
---


**Status:** Accepted
**Date:** 2026-07-15
**Decision makers:** Architecture Lead

---

## Context

The Notes feature (layout, sidebars, editor, vault tree, frontmatter parser) was
scattered across `src/lib/components/` (NotesLayout, NotesSidebar1, NotesSidebar2,
NotesEditor, VaultTreeNode), `src/lib/state/` (notes.svelte.ts), and
`src/lib/notes/` (frontmatter.ts). Its styles lived in
`src/lib/styles/components/_notes.sass`. This scattering made feature ownership
unclear and prevented the module from being treated as a cohesive unit.

Following the designer module extraction (ADR-021), the `src/lib/modules/<app>/`
pattern is now established. Extracting Notes into the same structure creates
consistency and prepares for future module-level operations.

The extraction is a pure relocation: no behavioural changes, no renames, no new
abstractions. It uses `git mv` for history preservation and deep imports without
a barrel `index.ts`.

---

## Decision

We will extract all Notes-specific files into the module directory
`src/lib/modules/notes/` with sub-directories `components/`, `state/`, `styles/`,
and a top-level `frontmatter.ts`:

```
src/lib/modules/notes/
  components/      ← NotesLayout, NotesSidebar1, NotesSidebar2, NotesEditor,
                     VaultTreeNode
  state/           ← notes.svelte.ts
  styles/          ← _notes.sass
  frontmatter.ts   ← Lossless Notes Frontmatter Parser
```

We chose this layout over keeping files scattered because it makes Notes feature
ownership explicit, follows the pattern established by ADR-021, and simplifies
future extraction or restructuring. We chose deep imports over a barrel because
the module's internal coupling is still evolving.

Module-owned component styles live under `src/lib/modules/notes/styles/` and are
aggregated via `src/lib/styles/index.sass`.

---

## Consequences

### Positive

- All Notes files are now reachable under a single directory tree, matching the
  designer module pattern from ADR-021
- Feature ownership is unambiguous
- `git mv` preserves file history for all relocated files
- The vault bridge between notes state and IDEState is documented in both the
  notes-state and ide-state routing docs

### Negative

- Import paths for Notes files from outside the module have become longer
  (e.g. `$lib/modules/notes/state/notes.svelte.ts` instead of
  `$lib/state/notes.svelte.ts`)
- External importers (+page.svelte, +layout.svelte, ADR-014) all required path
  updates

### Neutral

- The notes-domain undo/redo integration remains in `src/lib/state/undo.svelte.ts`
  — only import paths changed
- `src/lib/styles/index.sass` now imports `@use '../modules/notes/styles/notes'`
  instead of `@use 'components/notes'`
- Vault operations are still delegated to legacy `ideState`; the notes state
  boundary isolates components from that dependency

---

## Alternatives Considered

### Keep files scattered in flat directories

Leave all Notes files in their original locations. Rejected because this would
prevent establishing a consistent module pattern across the codebase and provide
no structure for future modules.

### Extract with barrel index.ts and public API facade

Create `src/lib/modules/notes/index.ts` re-exporting selected symbols. Rejected
following the same rationale as ADR-021: the module's internal boundaries are
still evolving and a barrel would create premature stability commitments.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-021 | Designer Module Extraction | Establishes the `src/lib/modules/<app>/` pattern this ADR follows |

---

## Notes

This ADR documents a pure relocation. Barrel API design and vault-storage
extraction from IDEState are explicitly deferred to a later phase.
