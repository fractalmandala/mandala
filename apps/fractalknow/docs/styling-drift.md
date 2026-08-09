# Styling Drift & Redundancy Audit — `apps/fractalknow/src`

**Re-run of T044** (supersedes `auditing/findings/T044-styling-drift.md`). Read-only; no files modified.
**Date basis:** current working tree on `audit/replication-review`.
**Scope:** `/Users/amrit/fractals/apps/fractalknow/src` only. `open-knowledge-main/`, `node_modules/`, `build/`, `.svelte-kit/` excluded.
**Convention baseline:** `fractal-agentic/skills/svelte-styling-patterns/SKILL.md` — zero in-component `<style>` blocks, external indented `.sass` (tabs, no braces/semicolons), two-layer semantic tokens, no hard-coded colors/radii/spacing/font-sizes (≤2-instance hardcodes tolerated).

---

## 0. Changes since T044 — RESOLVED items

The theming remediation landed. Every P0 is now closed:

| Prior | Status | Evidence |
|---|---|---|
| **F1 (P0)** — ~267 unthemed `t.$<color>` compile-time constants broke `[data-theme]` flips | **✅ RESOLVED** | **0** color constants remain in component styles. The only residual `t.$…` that matched the old color regex is `t.$line-height-tight` (a line-height, not a color). `global.sass` now publishes the full diff/highlight/selection/focus-ring/shadow/scrim palette as **per-theme** `--ok-*` custom properties across `light`/`dark`/`hc`. |
| **F2 (P0)** — `var(--ok-ok)` undefined (CommandPalette) | **✅ RESOLVED** | Cross-check of all 38 referenced `var(--…)` vs 50 defined props → **zero undefined**. |
| **F3 (P0)** — `var(--ok-overlay-surface)` undefined (overlays/DropdownMenu) | **✅ RESOLVED** | Same cross-check; overlay dropdown now uses `var(--ok-shadow-lg)` + `var(--ok-panel)`. |
| **F8 (P1)** — focus rings reimplemented 3 ways | **✅ mostly RESOLVED** | `m.focus-ring` now has **28** includes (was 20); `global.sass` routes `:focus-visible` and skip-link through the mixin. Only 1 raw `outline:` remains — `ShellSidebar.svelte:1171` `outline: 1px dashed transparent` (a reduced-motion placeholder, not a focus ring). |
| **F15 (P2)** — two `DropdownMenu` components | **✅ RESOLVED** | `lib/components/ui/DropdownMenu.svelte` deleted; a single themed `overlays/DropdownMenu.svelte` remains, now wrapped by the new `overlays/ContextMenu.svelte`. |

**Theme coverage matrix is therefore now green** for all 26 styled components: colors are consumed exclusively via `var(--ok-*)`, and the shared mixins reference `var(--ok-*)` with a Sass fallback, so dark/hc flips reach every surface (including diffs, shadows, scrim, focus rings). No component is left on a compile-time light palette.

---

## 1. Style File Map (current line counts)

### External style files (3)

| File | Lines | Notes |
|---|---|---|
| `src/lib/styles/_tokens.sass` | 210 | Primitive + per-theme (`light`/`dark`/`hc`) palette; radius/shadow/z/motion/spacing/typography/layout scales |
| `src/lib/styles/_mixins.sass` | 106 | 11 mixins (focus-ring, divider, scrollbar, kbd-chip, panel, overlay-surface, press-feedback, hover-transition + 3 `*-reduced`) |
| `src/lib/styles/global.sass` | 180 | Publishes `--fk-*` primitives + `--ok-*` aliases per theme, base resets, skip-link, reduced-motion guard |

### In-component `<style lang="sass">` blocks — **26 of 28** Svelte files (~3,400 style lines)

| File | Total | Style @ | Style lines |
|---|---|---|---|
| `lib/components/DialogHost.svelte` | 1703 | 1191 | 513 |
| `lib/components/ShellSidebar.svelte` | 1367 | 888 | 480 |
| `lib/components/EditorSurface.svelte` | 898 | 509 | 390 |
| `lib/components/CommandPalette.svelte` | 956 | 613 | 344 |
| `lib/components/RightPanel.svelte` | 500 | 284 | 218 |
| `lib/components/AppShell.svelte` | 532 | 388 | 145 |
| `lib/components/editor/RichEditor.svelte` | 438 | 297 | 142 |
| `lib/components/ShellToolbar.svelte` | 163 | 52 | 113 |
| `lib/components/ui/Tooltip.svelte` | 167 | 58 | 110 |
| `lib/components/ProjectSwitcher.svelte` | 216 | 119 | 99 |
| `lib/components/editor/MarkdownViewer.svelte` | 163 | 70 | 94 |
| `lib/components/ui/Toast.svelte` | 130 | 45 | 86 |
| `lib/migration/MigrationBoard.svelte` | 121 | 37 | 85 |
| `lib/components/overlays/DropdownMenu.svelte` | 357 | 277 | 81 |
| `lib/components/editor/FrontmatterEditor.svelte` | 201 | 132 | 70 |
| `lib/components/editor/SourceEditor.svelte` | 488 | 421 | 68 |
| `lib/components/editor/DiffViewer.svelte` | 108 | 42 | 67 |
| `lib/components/editor/SkillViewer.svelte` | 125 | 65 | 61 |
| `lib/components/editor/VersionList.svelte` | 86 | 28 | 59 |
| `lib/components/editor/AssetViewer.svelte` | 126 | 72 | 55 |
| `lib/components/editor/CollabStatus.svelte` | 81 | 28 | 54 |
| `lib/components/editor/DocumentHeader.svelte` | 99 | 53 | 47 |
| `lib/components/ui/Popover.svelte` | 127 | 91 | 37 |
| `lib/components/ui/StatusBadge.svelte` | 61 | 26 | 36 |
| `lib/components/ShellTitleBar.svelte` | 36 | 22 | 15 |
| `lib/icons/Icon.svelte` | 81 | 76 | 6 |
| `lib/components/overlays/ContextMenu.svelte` | 32 | — | **0** (delegates to DropdownMenu; uses one dynamic inline `style=` for cursor x/y — acceptable) |
| `routes/+page.svelte` | 5 | — | **0** |

Net vs T044: `ui/DropdownMenu` removed; `overlays/ContextMenu` added; `ShellSidebar` (+196 lines), `overlays/DropdownMenu` (+202), `EditorSurface` (+70), `Tooltip` (+29) grew.

---

## 2. Ranked Findings (open)

### P1 — Convention violations (skill rules)

**F4. 26 in-component `<style>` blocks (~3,400 lines) — violates the zero-`<style>`-block rule.**
Every Svelte file except `overlays/ContextMenu.svelte` and `routes/+page.svelte` carries its own style block; 4 exceed 300 lines (`DialogHost` 513, `ShellSidebar` 480, `EditorSurface` 390, `CommandPalette` 344).
→ **Extract** to `src/lib/styles/components/*.sass` (one file per component).
*Enforceable: ESLint `svelte` rule / CI grep gate banning `<style>` in `.svelte`.*

**F5. ~404 px literals on spacing/typography/position; ~50 are raw `font-size` px bypassing the `$font-size-*` scale.**
Font-size offenders span nearly every editor component (`12px`/`11px`/`13px`/`10px` recurring; off-scale `17px` `MigrationBoard:65`, `24px` `EditorSurface:535`/`AppShell:489`, `28px` `AssetViewer:94`, `18px` `EditorSurface:869`). Hotspots overall: `EditorSurface` (85), `ShellSidebar` (65), `RichEditor`/`AppShell` (29 each).
→ **Snap** to `$font-size-*` / `$space-*`; extend scale (2px/10px/14px steps) or approve ≤2-instance exceptions.
*Enforceable: `declaration-property-value-disallowed-list` for px on padding/margin/gap/font-size.*

**F6. ~59 `border-radius` px literals across 15 files (up from ~54).**
`8px`×24 (→`t.$radius-lg`), `6px`×24 (→`t.$radius-md`), `999px`×3 (→`t.$radius-pill`), plus `5px`×1, `3px`×1 (`RichEditor:429` — no matching token; nearest `$radius-sm:4px`), and compound `8px 8px 0 0`. `50%`×2 (circles) and `0`×2 are legitimate. Hotspots: `ShellSidebar` (12), `EditorSurface` (10), `MarkdownViewer`/`SourceEditor`/`RichEditor`/`AppShell` (5–6).
→ **Tokenize**; add a token for `3px` or snap to `$radius-sm`.
*Enforceable: ban px on `border-radius`.*

**F7. 6 hard-coded animation/transition durations bypassing motion tokens.**
`ShellSidebar:964` `sidebar-skeleton-shimmer 1.4s`; `CommandPalette:729–738` `animation-delay: 120/240/360/480ms`; `CommandPalette:746` `palette-spin 720ms`. (The T044 `overlays/DropdownMenu` case is **fixed** — now `t.$duration-fast`.)
→ **Map** to `$duration-*` (add 480/720/1400ms loop steps or treat staggered delays as approved exceptions).
*Enforceable: `time-min-milliseconds` + custom ban on raw `ms`/`s` in transition/animation.*

**F9. Hairline pattern hand-rolled ~31× (+3 separator wells) despite `m.divider` (1 use).**
`border-(top|bottom|left|right): 1px solid var(--ok-line)` recurs across `EditorSurface`, `RichEditor`, `MarkdownViewer`, `SourceEditor`, `VersionList`, `SkillViewer`, `DocumentHeader`, `MigrationBoard`, `AppShell`; plus `height: 1px; background: var(--ok-line)` separators (×3).
→ **Route** through `m.divider` (extend it with a `background`-style separator variant).

**F10. Raw monospace font stacks duplicated, and they differ from the token.**
`font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` in `DiffViewer:89`, `RichEditor:404`, `MarkdownViewer:125` — and **inline `style=` attributes** in markup at `EditorSurface:471,484` (which also inline `font-size:12px` + padding). The stack differs from `t.$font-family-mono` (which leads with `'JetBrains Mono','Fira Code'`).
→ **Unify** on `t.$font-family-mono`; move the two `EditorSurface` inline styles into the style block.
*Enforceable: ban raw `font-family` values; ban `style=` design props in markup.*

### P2 — Redundancy / dead code

**F11. 23 Sass tokens in `_tokens.sass` are defined but referenced nowhere.**
`$duration-instant`, `$duration-slower`, `$font-size-2xl`, `$font-size-3xl`, `$line-height-base`, `$line-height-loose`, `$radius-xs`, `$radius-xl`, `$space-0`, `$space-7`, `$space-9`, `$space-10`, `$z-base`, `$z-elevated`, `$z-sidebar`, `$z-toolbar`, `$z-dropdown`, `$shell-footer-height`, `$shell-statusbar-height`, `$shell-toolbar-height`, `$shell-sidebar-default-width`, `$shell-right-panel-default-width`, and `$ok` (`$ok: $success` alias — the `--ok-ok` bug that would have consumed it is fixed, leaving it dead).
→ **Prune, or wire up** — the 5 speculative z-layers and layout-height/width tokens are the strongest "wire it up" candidates (sidebar/toolbar z-index and shell heights are currently hard-coded elsewhere).

**F12. 12 published custom properties are defined in `global.sass` but consumed by nothing.**
`--fk-duration-fast/base/slow`, `--fk-ease-out/in/in-out` (6 — components use `t.$duration-*`/`t.$ease-*` at build time instead), `--ok-diff-added-strong`, `--ok-diff-modified-strong`, `--ok-diff-removed-strong`, `--ok-muted-inverse`, `--ok-selection`, `--ok-selection-inverse`.
→ **Dedupe** — drop the motion-var block (or migrate components onto `var(--fk-duration-*)`); wire or remove the `-strong` diff / selection props.

**F13. 3 dead mixins — the `*-reduced` variants have 0 includes.**
`m.focus-ring-reduced`, `m.press-feedback-reduced`, `m.hover-transition-reduced` (`_mixins.sass:94–107`). Components hand-write `@media (prefers-reduced-motion: reduce)` blocks instead, and `global.sass` has a global reduced-motion guard.
→ **Delete** (the global guard already covers most cases) **or adopt** in components.

**F14. "Card/panel" pattern hand-rolled ~72× despite `m.panel` (5 uses).**
`border: 1px solid var(--ok-line)` + `border-radius` + panel/surface background recurs across `MigrationBoard`, `SkillViewer`, `DiffViewer`, `SourceEditor`, `RichEditor`, `CollabStatus`, `VersionList`, `FrontmatterEditor`, `AssetViewer`, `MarkdownViewer`, `AppShell`, `Toast`, `StatusBadge`.
→ **Route** through `m.panel` (now theme-aware).

**F16. Hard-coded collab-presence colors in TypeScript (unthemed, off-token).**
`lib/editor/collab.ts:74` — 6-color hex palette `['#0f766e','#7c3aed','#b45309','#be123c','#0369a1','#4d7c0f']`; `lib/editor/extensions.ts:93,97,100` — default `#0f766e` ×3.
→ Acceptable as a deliberate multi-user cursor palette, but **document as an exception** or move to a shared constants module / CSS vars.

### P3 — Clean areas (verified this run, no action)

- **0 hex/rgb()/hsl() literals in any `.svelte`** — color literals are confined to `_tokens.sass` (78, the primitive palette).
- **All `var(--…)` references resolve** (38 used ⊆ 50 defined) — no undefined-var bugs.
- **`z-index` fully tokenized** — 6 uses, all `t.$z-*`, 0 raw.
- **`box-shadow` fully tokenized** — 6 declarations: 4 via `var(--ok-shadow-*)`, 2 intentional inset accent bars (`RightPanel:334`, `CommandPalette:873`).
- **No dead top-level class selectors** — every top-level `.class` in a style block appears in its component markup (automated sweep, 26 files).
- **`.sass` syntax purity holds** — no braces/semicolons; tab indentation throughout.

---

## 3. Mechanically Enforceable Drift Classes (stylelint / CI candidates)

| Drift class | Open? | Enforcement |
|---|---|---|
| `t.$<color>` constants in component styles (F1) | **Closed** | keep a guard rule to prevent regression: `declaration-property-value-disallowed-list` banning `t.$ink\|muted\|surface\|panel\|line\|accent\|danger\|warn\|diff-*\|highlight\|selection\|focus-ring\|overlay-*` |
| `var(--…)` referencing an undefined prop (F2/F3) | **Closed** | custom rule cross-referencing `global.sass` — keep as regression guard |
| `<style>` blocks in `.svelte` (F4) | Open | ESLint svelte rule / CI grep gate |
| px on padding/margin/gap/font-size (F5) | Open | `declaration-property-value-disallowed-list` or scale plugin |
| px on `border-radius` (F6) | Open | same mechanism |
| raw `ms`/`s` in transition/animation (F7) | Open | `time-min-milliseconds` + custom rule |
| raw `outline:` (F8) | ~Closed (1 placeholder) | `property-disallowed-list` forcing `m.focus-ring` |
| hand-rolled hairlines / cards (F9/F14) | Open | not a lint rule — reviewer/codemod toward `m.divider`/`m.panel` |
| raw `font-family` stacks + `style=` design props (F10) | Open | `declaration-property-value-disallowed-list`; svelte rule banning `style=` with px/font |
| dead Sass tokens / dead custom props / dead mixins (F11–F13) | Open | rg-based CI usage cross-check script (not stylelint) |
| collab hex in TS (F16) | Open | CI grep for `#[0-9a-f]{6}` under `src/lib/editor/*.ts` |

---

## 4. Suggested remediation order

1. **Dead-code prune (F11–F13)** — lowest risk, immediate clarity: delete the 23 dead tokens, 12 dead custom props, 3 dead mixins (or wire the z/layout tokens you intend to keep).
2. **Tokenize the mechanical classes (F5 font-size, F6 radius, F7 durations, F10 mono)** — codemod-friendly, each backed by an enforceable rule to prevent regression.
3. **Mixin-ify duplication (F9 divider, F14 panel)** — consolidate ~100 hand-rolled declarations.
4. **Extract `<style>` blocks (F4)** — largest churn; do last, once the styles are already token-clean.
5. Stand up the stylelint/CI ruleset from §3, including **regression guards** for the now-closed F1/F2/F3 so the theming work cannot silently rot.

_Read-only audit — no files were modified and nothing was committed._
