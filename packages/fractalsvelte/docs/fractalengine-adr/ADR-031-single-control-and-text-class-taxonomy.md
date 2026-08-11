---
id: ADR-031
title: Single Control and Text Class Taxonomy
type: adr
tags: [styling, css-classes, buttons, typography, tabs, sidebars]
summary: Consolidates four competing button conventions, the panel-text-* family, and three tab implementations into single canonical families — btn-*, text-* roles, and sidebar-tab-item — with the active state always marked via .active.
relates_to: [ADR-003, 13-control-text-taxonomy, src/lib/styles/_commons.sass, src/lib/styles/_typography.sass]
status: accepted
updated: 2026-07-16
---


**Status:** Accepted
**Date:** 2026-07-16
**Decision makers:** Amrit, agent session

---

## Context

As modules were extracted (ADR-021/022/023/024), each grew its own vocabulary
for the same UI concepts:

- **Buttons:** four base conventions coexisted — `.icon-button`
  (`_primitives.sass`), `.btn-icon`/`.btn-text`/`.btn-app` (`_commons.sass`),
  plus one-off bases `.panel-button-std`, `.strip-button`,
  `.inspector-icon-btn`.
- **Text:** an eight-variant `panel-text-*` family with exact duplicates
  (`panel-text-bs` ≡ `panel-text-std`) and color forks encoded in class names
  (`-accent`, `-muted`, `-alive`).
- **Tabs:** three implementations — `.sidebar-tab-pill` (dead), `.ai-sidebar-tab`,
  and designer/AIChat reusing `.icon-button` with an inverted `class:muted`
  marking the *inactive* tab. State conventions disagreed (`.active` vs
  `.is-active` vs `.muted` inversion).

New markup could not be written without picking among conventions, and visual
drift between modules was structural, not accidental. This also blocked the
planned shared `ModuleLayout` component, which assumes one sidebar vocabulary.

## Decision

One family per concept, defined once in shared styles:

1. **Buttons** (`_commons.sass`): `.btn-icon`, `.btn-icon-text`, `.btn-text`,
   `.btn-app`. Module-specific appearance layers on top as skin-delta classes
   (e.g. `btn-icon inspector-icon-btn`), never as parallel base classes. The
   contribution registry's `kind: 'strip' | 'icon'` maps to
   `.btn-icon-text` / `.btn-icon`.
2. **Text roles** (`_typography.sass`): `.text-header`, `.text-item`,
   `.text-item-lg`, `.text-item-sm`, `.text-meta`, with chainable color
   modifiers (`.muted`, `.accent`, `.alive`) instead of per-color class names.
   Named app-wide (not `sidebar-*`) because the same roles appear in dialogs,
   marketplaces, and panels.
3. **Sidebar tabs** (`_commons.sass`): `.sidebar-tab-item` +
   `.sidebar-tab-item-text`, icons `icon-svg-sm`, with `role="tab"` /
   `aria-selected` and the **active tab marked via `.active`** — inactive is
   the unmarked default everywhere.

All legacy classes were migrated and their definitions deleted in the same
change (no deprecation window), so grep finds exactly one convention.

## Alternatives considered

- **Keep `panel-*` naming and add `sidebar-*` aliases** (as originally
  sketched): rejected — two coexisting families for the same roles is the
  problem this ADR removes, and `sidebar-` scoping was wrong for text that
  also renders in dialogs.
- **Deprecate gradually with alias classes:** rejected — SASS-level aliases
  keep both names greppable and let new code adopt the old convention; the
  codebase is small enough for an atomic migration (verified by grep +
  svelte-check + visual pass).
- **CSS `@extend` from old to new names:** rejected for the same reason, plus
  extend-chains complicate the flat utility layer.

## Consequences

- Sidebar/tab markup is now uniform across IDE, notes, designer, and AI
  modules — a precondition for the planned shared `ModuleLayout` component.
- Designer and AIChat tab icons dropped from `icon-svg` to `icon-svg-sm`, and
  notes list titles moved from 12px to 14px (`text-item-lg`) — intentional
  visual normalization.
- Tabs gained `role="tablist"`/`role="tab"`/`aria-selected` semantics.
- The retired-class table lives in the design doc
  (`docs/design/13-control-text-taxonomy.md`); any reappearance of a retired
  class is a defect.
- `_ai.sass` no longer styles tab internals; segmented-bar layout deltas live
  with the owning module (`.ai-sidebar-tabs .sidebar-tab-item`).
