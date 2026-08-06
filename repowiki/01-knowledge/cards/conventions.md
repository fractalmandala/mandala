---
title: Coding Conventions
description: Monorepo-wide rules — indented SASS, two-layer tokens, Svelte 5 runes, single IPC gateway, hostile-HTML, undo/redo, audit protocol.
tags: [conventions, sass, tokens, svelte-5, runes, ipc, undo-redo, hostile-html, audit]
type: card
module: cross-cutting/conventions
path: /Users/amrit/mandala
created: 2026-08-04
updated: 2026-08-04
relates_to: [mandala-root, fractals-styler, shradhapp, fracta, fractalsvelte]
---

# Coding Conventions (cross-cutting)

Pinned most strongly in `packages/fractals-styler/AGENTS.md` and `apps/shradhapp/AGENTS.md`. Followed without exception.

## Styling
- **Indented SASS only** (`.sass`, single-tab, no braces/semicolons). No SCSS/CSS; no `<style>` blocks in Svelte for shell UI (styles under `src/lib/styles/`).
- **Tokens-only** (colors/sizes/spacing/radii/shadows) except ≤2-place low-usage overrides.
- **Two-layer tokens:** primitives → semantic; consume semantic vars (`--background10`, `--text-primary`, `--theme-color`) from `_tokens.sass`.
- **Reusable general classes** over singular-element classes.
- **Divergence/drift self-check** after every styling change.

## Svelte 5
- Runes only: `$state`, `$derived`, `$effect`, `$props`. No legacy `$:`, no `svelte/store` for new state.
- Derivations direct: `let x = $derived(val)`, never `$derived(() => val)`.

## Tauri / IPC
- Single IPC gateway (`src/lib/ipc.ts` + `ipc-mock.ts`); `IpcApi` interface + `tests/unit/ipc-contract.test.ts` parity; `NATIVE_ONLY` needs justification (ADR-028).

## State / UX invariants
- No native `<input type="color">` in design panels — custom spectrum/hex popover.
- Mandatory undo/redo on all editable state (`UndoHistory.transact()` + `registerUndoDomain`, ADR-026).
- Hostile-HTML boundary: `{@html}` → `$lib/sanitizeHtml` profiles; `tests/unit/html-boundary.test.ts` (ADR-028).

## Contributions / docs / audits
- New commands/keybindings/header actions declared in module `contributions.ts` (or `coreContributions.ts`); registry drives palette/shortcuts/header.
- Documentation integrity: update `docs/areas/` + ADRs + guides; run `docs-contracts.test.ts`; `pnpm docs:filetables`; styling → `docs/design` (styling-docs-builder skill); ADRs via adr-writing skill; regenerate `docs/INDEX.md` via doc-frontmatter skill.
- Audit completeness protocol: mutation inventory + atomic undo per action; async adversarial tests; persisted-data fixtures; `contribution-contracts.test.ts`; adjacent regression coverage; final `git diff --check`.

## Agent process
- Fractal Agentic default: detect → one of seven bosses → `/orchestrate` → primary re-verification → ship|fix-first|rethink. Best-effort, non-blocking.
