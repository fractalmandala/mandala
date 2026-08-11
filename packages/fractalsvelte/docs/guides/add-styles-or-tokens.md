---
id: add-styles-or-tokens
title: Adding Styles or Tokens
type: guide
tags: [styling, sass, tokens, guide]
relates_to: [ADR-003]
summary: Guide on defining variables, mapping semantic tokens, and structuring component stylesheets in SASS.
updated: 2026-07-18
---


We strictly use two-layer CSS tokens with classical indented SASS.

## Playbook & Steps

### 1. Add color primitives
If introducing a new raw color, add it to `src/lib/styles/_primitives.sass` (e.g., `$slate-900: #0f172a`).

### 2. Map semantic variables
Map primitives to semantic tokens inside `src/lib/styles/_tokens.sass`:
```sass
:root
	--background-primary: #{$slate-900}
```
Define light/dark theme overrides in mapping entries.

### 3. Add component styles
- **Exclusive Components**: If the component is exclusive to a single functional module, create its stylesheet inside that module's styles folder: `src/lib/modules/<module-name>/styles/_<component-name>.sass` (e.g., `_tile.sass` in the `designer` module).
- **Shared Components**: If the component is shared across multiple modules or is part of the global layout/shell, create it under `src/lib/styles/components/` (e.g., `_appdock.sass`).
- Write using classical indented SASS (tab indentation, no curly braces, no semicolons).
- Import it inside `src/lib/styles/index.sass`.
- Never include `<style>` blocks in Svelte components.

## Verification Checklist

- [ ] Run `npx vitest run tests/unit/style-contracts.test.ts` to verify stylesheets.
- [ ] Confirm no component `.svelte` file contains a `<style>` block.
- [ ] Verify light and dark mode appearances.

## Sidebar & Component Styling Rules

To maintain styling consistency across sidebar panels and components:
1. **Borders & Spacing**: Do not put sections in sidebars inside borders. Prefer clean `16px` gaps between items, using `border-bottom` only at the most.
2. **Buttons & Text** (see [13-control-text-taxonomy](../design/13-control-text-taxonomy.md)):
   - Buttons use exactly one of the `btn-*` bases: `.btn-icon` (icon only), `.btn-icon-text` (icon + text), `.btn-text` (bare text), `.btn-app` (filled visual, with `:hover` / `.activated` states).
   - Text inside buttons must be wrapped in `<span>` tags with class `.button-text` (exception: `TreeNode` folder/file buttons wrap text in `<span>` with class `.text-item`).
   - Module-specific button appearance is a skin-delta class layered on a base (e.g. `class="btn-icon inspector-icon-btn"`), never a new base class.
3. **Typography Classes**:
   - Use `.truncate` for any text needing overflow ellipsis.
   - Sidebar major labels/titles use `<span>` with class `.text-header`.
   - Sidebar standard text uses `<span>` with class `.text-item` (chain `muted` / `accent` modifiers for color states).
   - Item titles in list rows use `.text-item-lg`; description or metadata text uses `.text-item-sm` (line-height controlled; chain `alive` for emphasis); tags/pills/counters use `.text-meta`.
4. **Sidebar Tabs**: tab strips in sidebar headers use `.sidebar-tab-item` buttons (`role="tab"`, `aria-selected`) with `<span class="sidebar-tab-item-text">` labels and `icon-svg-sm` icons, inside a `role="tablist"` container. Mark the active tab with `.active`; the inactive state is the unmarked default.
