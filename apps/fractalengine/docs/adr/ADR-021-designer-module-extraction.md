---
id: ADR-021
title: Designer Module Extraction
type: adr
tags: [designer, module, extraction, architecture]
summary: Extracts the designer canvas into a self-contained module under src/lib/modules/designer/ with its own components, state, engine, data, and styles.
relates_to: [ADR-015]
status: accepted
updated: 2026-07-15
---

# ADR-021: Designer Module Extraction

**Status:** Accepted
**Date:** 2026-07-15
**Decision makers:** Architecture Lead

---

## Context

The FractalEngine codebase organises its source under `src/lib/` with flat directories
for components, state, styles, and data. As the application has grown, the Designer
feature (canvas, blocks, inspector, layers, export, templates) has accumulated files
across four separate top-level directories: 12 engine files under `src/lib/designcanvas/`,
7 components under `src/lib/components/designcanvas/`, 2 state files under
`src/lib/state/`, and 1 data file under `src/lib/data/`. This scattering makes it
difficult to determine which files belong to the Designer feature, complicates
feature-level refactoring, and creates cross-directory import chains that obscure
module boundaries.

A planned expansion to add email and bookmarks applications will compound this
problem — without a consistent module boundary pattern, each new application would
continue to scatter its files across the same flat directories, making the codebase
increasingly entangled.

The extraction must be a pure relocation: no behavioural changes, no renames, no new
abstractions. It must preserve `git mv` history and deep import paths, and must
not introduce barrel `index.ts` files.

---

## Decision

We will extract all Designer-specific files into the module directory
`src/lib/modules/designer/` with sub-directories `engine/`, `state/`, `components/`,
`data/`, and `styles/`, following the layout:

```
src/lib/modules/designer/
  engine/          ← CanvasViewport, DragEngine, ResizeEngine, RotateEngine,
                     SelectionEngine, autoscroll, codegen, designblock,
                     designstores, designtypes, patterns, svgpath
  state/           ← design.svelte.ts, designcanvas.svelte.ts
  components/      ← DesignLayout, ComponentLibrary, DesignBlock, DesignInspector,
                     Dock, ExportPanel, Layers
  data/            ← designtemplates.ts
  styles/          ← 7 designer .sass partials
```

We chose this layout over keeping files scattered because a unified directory makes
feature ownership explicit, simplifies future extraction into a separate package,
and establishes a repeatable pattern for upcoming email and bookmarks modules. We
chose deep imports (no barrel `index.ts`) over a public API facade because the
module's internal coupling is still evolving and a barrel would create premature
stability commitments.

Module-owned component styles live under `src/lib/modules/<app>/styles/` and are
still aggregated via `src/lib/styles/index.sass`. Shared styles remain under
`src/lib/styles/`.

---

## Consequences

### Positive

- All Designer files are now reachable under a single directory tree, making
  feature ownership unambiguous
- The `src/lib/modules/<app>/` pattern is established for upcoming email and
  bookmarks applications, preventing future scattering
- `git mv` preserves file history for all relocated files
- Deep import paths keep the module's internal dependencies transparent and avoid
  premature API stabilisation

### Negative

- Import paths for Designer files from outside the module have become longer
  (e.g. `$lib/modules/designer/state/designcanvas.svelte.ts` instead of
  `$lib/state/designcanvas.svelte.ts`)
- External importers (AIChat, CommandPalette, undo.svelte.ts, +page.svelte,
  +layout.svelte) all required path updates, creating a one-time coordination
  cost between the code-relocation and styles/documentation streams
- The flat directory convention under `src/lib/` is now joined by a module
  convention under `src/lib/modules/`, adding one more structural pattern new
  contributors must learn

### Neutral

- Undo-domain self-registration remains in `src/lib/state/undo.svelte.ts` —
  only import paths changed, not the registration logic
- `src/lib/styles/index.sass` now imports 7 partials from
  `src/lib/modules/designer/styles/` instead of `src/lib/styles/components/`

---

## Alternatives Considered

### Keep files scattered in flat directories

Leave all Designer files in their original locations under
`src/lib/designcanvas/`, `src/lib/components/designcanvas/`, `src/lib/state/`,
and `src/lib/data/`. Rejected because this makes feature ownership invisible
from the directory structure and provides no established pattern for future
applications (email, bookmarks), which would compound the scattering problem.

### Extract with barrel index.ts and public API facade

Create `src/lib/modules/designer/index.ts` that re-exports selected symbols
as the module's public API, with all internal imports going through the barrel.
Rejected because the module's internal boundaries are still evolving — a barrel
would create premature stability commitments and obscure internal dependencies.
Deep imports keep the lightweight relocation reversible.

### Extract to a separate npm package

Move Designer into its own npm package within the monorepo. Rejected because
this is a pure relocation phase; cross-package boundaries require a stable API
contract, dependency lifecycle management, and versioning strategy that are not
yet defined. The `src/lib/modules/` convention is an intermediate step that
preserves the option to extract to a separate package later.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-003 | CSS Token System with SASS | Amended: module-owned styles now live under `src/lib/modules/<app>/styles/` but remain aggregated via `src/lib/styles/index.sass` */
| ADR-006 | Undo/Redo Boundary | Import paths for design-domain registration updated |

---

## Notes

This ADR documents a pure relocation. Barrel API design and undo-domain
self-registration inversion are explicitly deferred to a later phase.
