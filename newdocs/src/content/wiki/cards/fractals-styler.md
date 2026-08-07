---
title: fractals-styler
description: npm package scaffolding house SASS styling + preset classes; enforces tokens, runes, IPC gateway, hostile-HTML, undo/redo.
tags: [package, fractals-styler, sass, scaffolding, tokens]
type: card
module: packages/fractals-styler
path: packages/fractals-styler
created: 2026-08-04
updated: 2026-08-06
---

- **Path:** `packages/fractals-styler`
- **What:** A public npm package that scaffolds the house SASS styling + preset classes into any new project.
- **Codifies (the canonical monorepo rules):**
  - Tokens-only; two-layer CSS tokens (primitives→semantic) consumed via semantic vars in `src/lib/styles/_tokens.sass`.
  - Svelte 5 runes only (`$state`/`$derived`/`$effect`/`$props`; derived written directly (`$derived(val)`, not `$derived(() => val)`.
  - Indented SASS discipline; no `<style>` blocks in Svelte (styles under `src/lib/styles/`.
  - Single IPC gateway (`src/lib/ipc.ts` + `ipc-mock.ts`, `IpcApi` interface + contract tests; `NATIVE_ONLY` needs justification — ADR-028).
  - Design-control color pickers: custom spectrum/hex popover, never native `<input type="color">`.
  - Mandatory undo/redo boundary on all editable state via `UndoHistory.transact()` + `registerUndoDomain` (ADR-026).
  - Hostile-HTML boundary: `{@html}` must route through `$lib/sanitizeHtml` profiles; enforced by `tests/unit/html-boundary.test.ts` (ADR-028).
  - Documentation integrity + audit completeness protocol (mutation inventory, async adversarial tests, persisted-data fixtures, `contribution-contracts.test.ts`.
