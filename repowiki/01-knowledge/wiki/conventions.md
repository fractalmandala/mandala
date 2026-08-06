---
title: Coding Conventions
description: Monorepo-wide rules — indented SASS only, two-layer tokens, Svelte 5 runes, single IPC gateway, hostile-HTML boundary, undo/redo.
tags: [conventions, sass, tokens, svelte-5, runes, ipc, undo-redo, hostile-html]
type: concept
created: 2026-08-04
updated: 2026-08-04
---

# Coding Conventions

Pinned across the mandala monorepo (most strongly codified in `packages/fractals-styler/AGENTS.md` and `apps/shradhapp/AGENTS.md`). These are the rules an agent must follow without exception.

## Styling
1. **Indented SASS only.** `.sass` syntax: single-tab indentation, no curly braces, no semicolons, `//` comments. No SCSS, no CSS. No `<style>` blocks inside Svelte components for shell UI — write styles under `src/lib/styles/components/` or per-module `src/lib/modules/<app>/styles/` and import them in `src/lib/styles/index.sass`.
2. **Tokens-only.** Components never hardcode colors, font sizes, spacing, radii, or shadows — except properties used in ≤2 places, where case-by-case hardcoded overrides are approved to prevent over-tokenization.
3. **Two-layer CSS tokens.** Primitives → Semantic. Components consume semantic CSS variables only (e.g. `--background10`, `--border-secondary`, `--text-primary`, `--theme-color`) defined in `src/lib/styles/_tokens.sass`.
4. **Reusable general classes** over singular-element classes. Create reusable classes for borders/gaps/etc. from `src/lib/styles`; never one-off classes.
5. **Divergence/drift check:** after any styling change, ask: did this increase divergence/drift? If yes, reverse it.

## Svelte 5
6. **Runes only:** `$state`, `$derived`, `$effect`, `$props`. No legacy `$:` reactivity, no `svelte/store` imports for new state.
7. **Reactive derivations** written directly: `let x = $derived(val)`. Never wrap as `$derived(() => val)`.

## Tauri / IPC
8. **Single IPC gateway.** All Tauri commands go through one module (e.g. `src/lib/ipc.ts`) with a browser mock (`ipc-mock.ts`) so `pnpm dev` works fully outside Tauri. Parity enforced by an `IpcApi` interface + contract tests (`tests/unit/ipc-contract.test.ts`). `NATIVE_ONLY` additions require justification (ADR-028).

## State / UX invariants
9. **Design-control color pickers:** never use native `<input type="color">` in design panels — use the custom spectrum/hex picker popover.
10. **Mandatory undo/redo boundary:** any user-editable state (forms, layouts, editor values, sliders, theme selections) must support complete Undo/Redo via `Cmd+Z`/`Ctrl+Z` + native app menus. Wrap mutations in the domain's `UndoHistory.transact()`; define snapshot capture/restore in the domain's own state module and register the domain via `registerUndoDomain` (ADR-026).
11. **Hostile-HTML boundary:** any `{@html}` in a `.svelte` component must render sanitized output via `$lib/sanitizeHtml` profiles (markdown, svg, imported, inline). Enforced by `tests/unit/html-boundary.test.ts`; a new `{@html}` outside the allowlist fails with "route it through sanitizeHtml — see ADR-028".

## Contributions, docs & audits
12. **Settings & contributions check:** after editing/creating components or pages, consider what belongs in settings or the contribution registry. New commands/keybindings/header actions are declared in the module's `contributions.ts` (or `src/lib/state/coreContributions.ts` for shell features); the palette, shortcut handler, and header render from the registry automatically.
13. **Documentation integrity:** update `docs/areas/` for what you touched; add an ADR for decisions; update a guide if a playbook changed; run `tests/unit/docs-contracts.test.ts`; regenerate file tables via `pnpm docs:filetables`. Document styling changes in `docs/design` (use the `styling-docs-builder` skill → `DESIGN.md`); use the `adr-writing` skill for `docs/adr`; regenerate affected rows in `docs/INDEX.md` via the `doc-frontmatter` skill so the index never drifts.
14. **Audit completeness protocol:** green typecheck/build is necessary but never sufficient — build a mutation inventory, verify every user action has one atomic undo entry, exercise async actions under failure/cancellation/out-of-order/mid-nav/teardown, test persisted data with malformed/duplicate/missing/legacy/boundary fixtures, run `contribution-contracts.test.ts` and extend it for new contribution TYPEs, add adjacent regression coverage, then inspect `git diff --check` + the final mutation/documentation inventory.

## Agent process default
15. **Fractal Agentic** is the preferred agent process: detect → select one of seven bosses → `/orchestrate` → primary re-verification → ship|fix-first|rethink. Best-effort, non-blocking. (See [[Fractal Agentic System]].)

See [[overview]], [[Apps Module]], [[Packages Module]].
