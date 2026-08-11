---
id: designer-extraction-plan
title: Designer Extraction Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**


test state

**Repo:** `apps/fractalengine` (SvelteKit + Tauri, Svelte 5 runes, indented SASS)
**Base commit:** current `master` HEAD. Both agents branch from the same commit.

You are one of two agents executing this plan in parallel. Your operator will tell you
whether you are **Agent A (Stream A — code relocation)** or **Agent B (Stream B — styles,
tests, docs)**. Read the *Shared contract* section fully, then execute only your own
stream. Do not perform any step from the other stream, even if you notice it is missing —
disjoint file ownership is what makes the parallel merge safe.

- Agent A works on branch `designer-module-code`.
- Agent B works on branch `designer-module-styles-docs`.
- Each agent works in its own git worktree, branched from the same `master` commit.
- Phase 3 (integration & verification) runs once, after both branches are merged. It is
  NOT part of either stream.

---

## Shared contract (both agents must read)

### Goal

Relocate everything Designer-specific into `src/lib/modules/designer/` with **zero
behavioral change**. This is a pure relocation:

- No renames of symbols, CSS classes, storage keys, or event strings.
- No logic edits, no refactors, no new abstractions.
- No barrel `index.ts` — deep imports everywhere (deliberate; barrel/API design is a
  later phase).
- Undo-domain self-registration is deliberately NOT part of this phase —
  `src/lib/state/undo.svelte.ts` keeps owning the design-domain wiring, only its import
  paths change (Stream A).
- Use `git mv` for every file move so history is preserved.

### Target layout (fixed — both streams build against these exact paths)

```
src/lib/modules/designer/
├── engine/          ← the 12 files currently in src/lib/designcanvas/
├── state/           ← design.svelte.ts, designcanvas.svelte.ts
├── components/      ← DesignLayout.svelte + the 6 files in src/lib/components/designcanvas/
├── data/            ← designtemplates.ts
└── styles/          ← the 7 designer .sass files (Stream B)
```

### Canonical import-path mapping (apply verbatim)

| Old | New |
|---|---|
| `$lib/designcanvas/<x>` | `$lib/modules/designer/engine/<x>` |
| `$lib/state/design.svelte` | `$lib/modules/designer/state/design.svelte` |
| `$lib/state/designcanvas.svelte` | `$lib/modules/designer/state/designcanvas.svelte` |
| `$lib/data/designtemplates` | `$lib/modules/designer/data/designtemplates` |
| `$lib/components/designcanvas/<x>` | `$lib/modules/designer/components/<x>` |
| `$lib/components/DesignLayout.svelte` | `$lib/modules/designer/components/DesignLayout.svelte` |

Relative-path variants of the same files (e.g. `../state/design.svelte` in
CommandPalette) map to the same targets. Sibling-relative imports between two files that
move together (e.g. `./CanvasViewport.svelte.js` inside the engine) need no change.

### Do-NOT-touch list (both streams — these look designer-related but are NOT)

| File | Why it stays |
|---|---|
| `src/lib/state/canvas.svelte.ts` | The **blank-template** tile canvas — a different feature. |
| `src/lib/components/Canvas.svelte` | Same — blank-template canvas component. |
| `src/lib/styles/components/_canvas.sass` | Styles the blank-template canvas. |
| `src/lib/styles/components/_dock.sass` | Styles `.tile-dock` (TileDock), NOT the designer's `Dock.svelte`. |
| `src/lib/styles/components/_appdock.sass` | Shell-level AppDock. |
| `src/lib/components/TemplateGallery.svelte` | The home app-template gallery (shell), unrelated to designer templates. |
| `src/lib/state/historyClock.ts` | Shared cross-domain undo-ordering clock — stays in `src/lib/state/`. |
| `src/lib/globalstores.svelte.ts` | `theme` and `activePatternId` are shared. DesignLayout keeps importing from here. |
| `src/lib/state/ide.svelte.ts`, `src/lib/ipc.ts`, `src/lib/ipc-mock.ts` | Out of scope. |
| `package.json`, `svelte.config.js`, `vite.config.*`, `tsconfig.json` | No config changes needed or allowed. |

### Behavioral invariants (both streams)

1. `DesignLayout` stays **lazily loaded** in `src/routes/+page.svelte` via
   `{#await import(...)}` — only the path string inside the import changes.
2. CommandPalette's design actions stay **dynamic** imports
   (`import('...').then(...)`) — do not convert to static imports.
3. The `'fractaldesign:center-view'` CustomEvent name is untouched.
4. No CSS class is renamed. Playwright (`tests/design.spec.ts`) selects on
   `.design-viewport`, `.layer-row`, `.design-block`, `tpl-*` and ARIA labels — all must
   keep working without editing the spec.
5. No localStorage key, IPC command name, or persisted-data shape changes.
6. Indented SASS discipline per AGENTS.md: tabs, no braces, no semicolons, `.sass` only.

### File-ownership manifest (disjoint — determines who may edit what)

**Stream A owns (may create/move/edit):**
- `src/lib/designcanvas/**` (moving away), `src/lib/components/designcanvas/**` (moving away)
- `src/lib/components/DesignLayout.svelte` (moving away)
- `src/lib/state/design.svelte.ts`, `src/lib/state/designcanvas.svelte.ts` (moving away)
- `src/lib/data/designtemplates.ts` (moving away)
- `src/lib/modules/designer/{engine,state,components,data}/**` (creating)
- `src/routes/+page.svelte`, `src/routes/+layout.svelte`
- `src/lib/components/AIChat.svelte`, `src/lib/components/CommandPalette.svelte`,
  `src/lib/components/SettingsDialog.svelte` (verify-only, see step A4.7)
- `src/lib/state/undo.svelte.ts`
- `tests/unit/codegen-sanitizer.test.ts`

**Stream B owns (may create/move/edit):**
- `src/lib/styles/**` (including `index.sass`)
- `src/lib/modules/designer/styles/**` (creating)
- `tests/unit/style-contracts.test.ts`
- `docs/**` (routing docs, ADR, `INDEX.md`)
- `AGENTS.md`

Anything not in your list: hands off. If your stream appears to require editing a file
owned by the other stream, STOP and report to the operator instead of editing it.

---

## Stream A — Code relocation (Agent A)

Branch: `designer-module-code`.
Do not touch `src/lib/styles/**`, `docs/**`, `AGENTS.md`, or
`tests/unit/style-contracts.test.ts`.

### A1. Create skeleton

Create `src/lib/modules/designer/engine/`, `.../state/`, `.../components/`, `.../data/`.

### A2. Move files (git mv, exact list)

1. `src/lib/designcanvas/*` → `src/lib/modules/designer/engine/` — all 12 files:
   `CanvasViewport.svelte.ts`, `DragEngine.svelte.ts`, `ResizeEngine.svelte.ts`,
   `RotateEngine.svelte.ts`, `SelectionEngine.svelte.ts`, `autoscroll.ts`, `codegen.ts`,
   `designblock.ts`, `designstores.svelte.ts`, `designtypes.ts`, `patterns.ts`,
   `svgpath.ts`. Remove the now-empty `src/lib/designcanvas/`.
2. `src/lib/state/design.svelte.ts` → `src/lib/modules/designer/state/design.svelte.ts`.
3. `src/lib/state/designcanvas.svelte.ts` → `src/lib/modules/designer/state/designcanvas.svelte.ts`.
4. `src/lib/components/designcanvas/*` → `src/lib/modules/designer/components/` — all 6:
   `ComponentLibrary.svelte`, `DesignBlock.svelte`, `DesignInspector.svelte`,
   `Dock.svelte`, `ExportPanel.svelte`, `Layers.svelte`. Remove the empty folder.
5. `src/lib/components/DesignLayout.svelte` → `src/lib/modules/designer/components/DesignLayout.svelte`.
6. `src/lib/data/designtemplates.ts` → `src/lib/modules/designer/data/designtemplates.ts`.

### A3. Fix imports inside the moved files

- Engine files self-reference via `$lib/designcanvas/...` (e.g. `designstores.svelte.ts`
  imports `$lib/designcanvas/designtypes`) — apply the canonical mapping.
- The moved state files import `./historyClock` — rewrite to `$lib/state/historyClock`
  (historyClock stays behind in shared state).
- `DesignLayout.svelte` keeps importing `$lib/globalstores.svelte` and
  `$lib/components/AIChat.svelte` (both stay put); its designer-family imports follow
  the mapping.
- Sibling imports between moved files (`./...` within the same target folder) stay as-is.

### A4. Update external importers (exhaustive — verified by inventory)

1. `src/routes/+page.svelte` — the `design` state import (~line 7) AND the lazy
   `{#await import('$lib/components/DesignLayout.svelte')}` (~line 235; keep it lazy).
2. `src/routes/+layout.svelte` — the `designcanvas` state import (~line 10).
3. `src/lib/components/AIChat.svelte` — `DesignInspector` and `ExportPanel` imports
   (~lines 22–23).
4. `src/lib/components/CommandPalette.svelte` — three dynamic imports of
   `../state/design.svelte` / `../state/designcanvas.svelte` (~lines 79–81; keep dynamic).
5. `src/lib/state/undo.svelte.ts` — imports of `./designcanvas.svelte` and
   `./design.svelte` (lines 3–4). Change ONLY the paths; the design-domain registration
   logic is untouched.
6. `tests/unit/codegen-sanitizer.test.ts` — imports
   `../../src/lib/designcanvas/codegen` (line 3).
7. Grep `src/lib/components/SettingsDialog.svelte` for designer imports — inventory
   found none; confirm and leave it unedited if so.

### A5. Straggler check (must be clean before verifying)

```
grep -rn "lib/designcanvas\|state/design\.svelte\|state/designcanvas\.svelte\|data/designtemplates\|components/designcanvas\|components/DesignLayout" src tests
```

Every remaining hit must be a path under, or pointing at, `src/lib/modules/designer/`.

### A6. Verify and commit

- `pnpm check` — zero errors/warnings.
- `pnpm build` — succeeds.
- `npx vitest run tests/unit/codegen-sanitizer.test.ts` — passes.
- Do NOT chase failures in `tests/unit/style-contracts.test.ts` — that file belongs to
  Stream B; if it fails in your worktree, note it in your final report and move on.
- Commit with a message describing the relocation. Report: files moved, importers
  updated, verification results.

---

## Stream B — Styles, tests, docs (Agent B)

Branch: `designer-module-styles-docs`.
Do not touch any `.svelte` file, any non-style `.ts` under `src/`, or
`tests/unit/codegen-sanitizer.test.ts`. In your worktree the code has NOT moved yet —
that is expected; your work targets the layout defined in the shared contract.

### B1. Move the 7 designer sass files (git mv)

From `src/lib/styles/components/` to `src/lib/modules/designer/styles/` (create the dir):

`_designcanvas.sass`, `_designblock.sass`, `_designinspector.sass`,
`_componentlibrary.sass`, `_exportpanel.sass`, `_layers.sass`,
`_designtemplategallery.sass`.

Verified mapping notes — do not second-guess these:
- `_designtemplategallery.sass` styles the `tpl-*` template-picker modal inside the
  **designer's** `Dock.svelte` (its own header comment says so). It MOVES, despite the
  name resembling `TemplateGallery.svelte`.
- `_dock.sass` styles `.tile-dock` (TileDock). It STAYS.
- `_canvas.sass` and `_appdock.sass` STAY (blank-template canvas / shell AppDock).

### B2. Fix relative paths inside the moved files

Each moved file begins with `@use '../tokens' as *`. From
`src/lib/modules/designer/styles/`, the tokens partial resolves at
`../../../styles/tokens`, so rewrite to:

```
@use '../../../styles/tokens' as *
```

Check each moved file for any other relative `@use` and fix the same way. Preserve
indented-SASS syntax exactly (tabs, no braces, no semicolons).

### B3. Update `src/lib/styles/index.sass`

Rewrite the seven corresponding `@use 'components/<name>'` lines to
`@use '../modules/designer/styles/<name>'`, keeping each line **in its original
position** so the cascade order is unchanged. Do not reorder, add, or remove any other
line.

### B4. Fix `tests/unit/style-contracts.test.ts`

This test walks style directories with `node:fs`. Read it first, then extend its scanned
roots to include `src/lib/modules/designer/styles/` so the moved files remain under
contract enforcement (token-only values, indentation discipline, etc.). Run
`npx vitest run tests/unit/style-contracts.test.ts` until green.

### B5. Verify sass compiles

`pnpm build` in your worktree. Code is unmoved there, so any failure can only be a sass
path error — yours to fix.

### B6. Documentation (AGENTS.md rule 10)

Use the shared contract's target layout as the source of truth for all new paths (the
code move happens in Stream A's branch; document the post-merge reality).

1. **Routing docs:** grep `docs/INDEX.md` for every row whose path references a moved
   source file. The set includes at least:
   `src--lib--components--DesignLayout.svelte.md`, the six
   `src--lib--components--designcanvas--*.md`, all `src--lib--designcanvas--*.md`,
   `src--lib--state--design.svelte.ts.md`, `src--lib--state--designcanvas.svelte.ts.md`,
   `src--lib--data--designtemplates.ts.md`. Rename each doc file to the new path-encoded
   name and update path references inside, following `agents/skills/app-documenter`.
2. **Frontmatter + index:** run `agents/skills/doc-frontmatter` to update frontmatter on
   every renamed/edited doc and regenerate the affected `docs/INDEX.md` rows. The index
   must exactly match what is on disk in your branch.
3. **ADR:** use `agents/skills/adr-writing` to add an ADR recording the designer-module
   extraction. Motivation: per-app module boundaries ahead of planned email/bookmarks
   apps. Decision: `src/lib/modules/<app>/` layout with module-owned styles aggregated
   via `src/lib/styles/index.sass`; deep imports, no barrel; undo self-registration
   deferred to the core/shell split. Consequences: AGENTS.md rule 6 amendment.
4. **AGENTS.md (minimal edits only):**
   - Directory Structure section: add `src/lib/modules/designer/` with a one-line
     description.
   - Rule 6: amend to state that module-owned component styles live under
     `src/lib/modules/<app>/styles/` and are still aggregated via
     `src/lib/styles/index.sass`; shared styles remain under `src/lib/styles/`.

### B7. Commit

Commit with a message describing the style relocation and documentation updates. Report:
files moved, index.sass diff summary, docs renamed, ADR id, test results.

---

## Phase 3 — Integration & verification (run ONCE, after both branches merge)

Performed by the operator or a single designated agent — not by Stream A or B.

1. Merge `designer-module-code` into the integration branch, then
   `designer-module-styles-docs`. The ownership sets are disjoint; **any merge conflict
   means an agent strayed outside its manifest — investigate, do not force-resolve.**
2. `pnpm check` && `pnpm build` && `npx vitest run` — all green.
3. `npx playwright test tests/design.spec.ts` — all green, spec file unedited.
4. Manual smoke (the `run-fractalengine` skill launches the app in-browser via ipc-mock):
   - Open the Design template from home; blocks render, Layers list populates.
   - Drag, resize, and rotate a block; `Cmd+Z` / `Cmd+Shift+Z` undo/redo each gesture
     atomically.
   - Run all four palette commands: Toggle Design Layers Sidebar, Toggle Design AI
     Sidebar, Reset Design Scene, Center Design Canvas.
   - Open the Dock's template modal — the `tpl-*` styling renders (proves moved sass
     loads).
   - Open the Export panel and the AI-chat Design tab (proves AIChat's cross-module
     imports).
   - Reload the app; the design scene persisted (the `flushPendingChanges` path in
     `+layout.svelte`).
5. Re-run the Stream A straggler grep (step A5) — clean.
6. `git diff --check` — clean.

## Explicitly out of scope (do not improvise)

- Barrel `index.ts` / public-API design for the module.
- Undo-domain self-registration inversion.
- Moving `historyClock`, `globalstores`, `canvas.svelte.ts`, or anything in the
  do-not-touch list.
- Any Notes or IDE extraction work.
