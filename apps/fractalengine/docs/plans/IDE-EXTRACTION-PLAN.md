---
id: ide-extraction-plan
title: IDE Extraction Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**

# IDE Module Extraction — Two-Stream Execution Plan (final module phase)

**Repo:** `apps/fractalengine` (SvelteKit + Tauri, Svelte 5 runes, indented SASS)
**Base commit:** current `master` HEAD. **Prerequisite:** the uncommitted
`dedupeRoots` fix in `src/lib/modules/notes/state/notes.svelte.ts` must be committed to
`master` BEFORE either agent branches — verify `git status` is clean first.
**Line/section references are as of the notes-extraction merge — re-verify with grep
before editing; never edit blind by line number.**

You are one of two agents executing this plan in parallel. Your operator will tell you
whether you are **Agent A (Stream A — code)** or **Agent B (Stream B — styles & docs)**.
Read the *Shared contract* fully, then execute only your own stream.

- Agent A works on branch `ide-module-code`.
- Agent B works on branch `ide-module-styles-docs`.
- Each agent works in its own git worktree, branched from the same `master` commit.
- Phase 3 (integration & verification) runs once after both branches merge.

---

## Scope — read this first, it is different from the previous two phases

This phase does three things and deliberately NOT a fourth:

1. **Forms the IDE module surface:** the IDE-template components (layout, editor,
   sidebar/tree, terminal) and their styles move to `src/lib/modules/ide/`.
2. **Undo self-registration inversion** (deferred in both prior phases): the designer
   and notes undo domains move out of `src/lib/state/undo.svelte.ts` into their own
   modules, removing the last core→module imports.
3. **Documents the core/shell boundary** that remains.

**Explicit non-goal — the kernel stays put.** `src/lib/state/ide.svelte.ts` (~2,500
lines) is NOT the IDE app; it is the application kernel. Its section map spans AI
providers, AI/Copilot streaming, password manager & in-app browser, settings,
marketplaces, project memory/sessions, logs, workspaces, undo — plus the IDE-specific
file-system/tabs/terminal state. Extracting the IDE-only state slices would require a
bridge for the majority of the undo/workspace snapshot (the inverse of the notes
situation, at 10× the size) and is a kernel-decomposition project, not a module
extraction. `ideState` therefore remains in `src/lib/state/` as core, consumed by both
core components and modules (module→core is the allowed direction). The ADR in Stream B
records this decision and the intended future decomposition (AI, browser/passwords,
settings services split out of the kernel — at which point the `ai/browser/settings`
facade files become real; that is also why those three facade files are NOT dissolved
in this phase).

### Target layout (fixed)

```
src/lib/modules/ide/
├── components/       ← ClassicIdeLayout.svelte, Editor.svelte, Sidebar.svelte,
│                       Terminal.svelte, TreeNode.svelte
├── fileIcons.ts      ← from src/lib/fileIcons.ts (used only by TreeNode)
└── styles/           ← _editor.sass, _sidebar.sass, _terminal.sass (Stream B)
```

(No `state/` directory in this module — see the non-goal above.)

### Canonical import-path mapping

| Old | New |
|---|---|
| `$lib/components/ClassicIdeLayout.svelte` | `$lib/modules/ide/components/ClassicIdeLayout.svelte` |
| `$lib/components/Editor.svelte` | `$lib/modules/ide/components/Editor.svelte` |
| `$lib/components/Sidebar.svelte` | `$lib/modules/ide/components/Sidebar.svelte` |
| `$lib/components/Terminal.svelte` | `$lib/modules/ide/components/Terminal.svelte` |
| `$lib/components/TreeNode.svelte` | `$lib/modules/ide/components/TreeNode.svelte` |
| `$lib/fileIcons` | `$lib/modules/ide/fileIcons` |

Relative variants (`./Editor.svelte`, `../components/Sidebar.svelte`,
`../fileIcons`) map to the same targets.

### Verified classification — do NOT move these (each was checked)

| Item | Why it stays |
|---|---|
| `src/lib/state/ide.svelte.ts` | The kernel (see non-goal). |
| `src/lib/state/{ai,browser,settings}.svelte.ts` facades | Seams for the future kernel split; untouched this phase. |
| `src/lib/editorTheme.ts` | Shared: imported by `Editor.svelte` AND `ai-elements/Code.svelte` (core). Editor imports it from core after the move. |
| `src/lib/components/Browser.svelte` | The browser feature (its own future module). `ClassicIdeLayout` imports it from core. |
| `src/lib/components/Minimap.svelte`, `_minimap.sass` | Belongs to `Canvas.svelte` (blank-template canvas), not the IDE. |
| `src/lib/components/{AppDock,TileDock,Tile,HomeTilesLayout,TemplateGallery,CommandPalette,SettingsDialog,AIChat,ModelMarketplace,SkillsMarketplace,PromptInput}.svelte` | Shell / shared surfaces. |
| `src/lib/data/tileKinds.ts` | Core tile registry; after the move it imports the three IDE components cross-module (see invariant 4). |
| `src/lib/styles/components/_layout.sass` | "Main application structure" — shell-level. Even if a few IDE-layout classes live in it, it stays whole this phase; Stream B notes any such residue in the ADR rather than splitting the file. |
| `src/lib/state/{app,shell,canvas,undo}.svelte.ts`, `historyClock.ts` | Core state. `undo.svelte.ts` is edited by Stream A (inversion) but stays core. |
| `src/routes/browser/+page.svelte` | Browser window route (browser feature). |

### Behavioral invariants (both streams)

1. `ClassicIdeLayout` stays **lazily loaded** in `src/routes/+page.svelte` via
   `{#await import('../lib/components/ClassicIdeLayout.svelte')}` (~line 215) — only
   the path changes.
2. No CSS class renames — `tests/ide.spec.ts` exercises the IDE (tabs, terminal,
   shortcuts, palette) and must pass unedited.
3. No localStorage keys, IPC command names, event strings, or keyboard shortcuts
   change. `ideState`'s public API is unchanged (Stream A's only state edit is
   `undo.svelte.ts`).
4. **Cross-module component imports are accepted and documented** (same precedent as
   AIChat→designer panels and NotesLayout→AIChat): `tileKinds.ts` (core) imports
   Editor/Sidebar/Terminal from `modules/ide` so blank-canvas tiles keep hosting them.
   Do not "fix" this by duplicating components or introducing a registry — record it in
   the ADR as the known core→module edge to revisit in the kernel split.
5. **Undo behavior is identical after the inversion**: same domain ids
   (`ide`, `canvas`, `notes`, `design`), same `TEMPLATE_DOMAIN` mapping, same composite
   design-domain logic (the `nextUndoOrder`/`nextRedoOrder` comparison), same
   registration-at-startup timing (module state files are eagerly imported by
   `+layout.svelte`/`+page.svelte`, exactly like today's central registration).

### File-ownership manifest (disjoint)

**Stream A owns:**
- The five components + `fileIcons.ts` (moving), `src/lib/modules/ide/**` (creating)
- `src/routes/+page.svelte`, `src/lib/data/tileKinds.ts`
- `src/lib/state/undo.svelte.ts`
- `src/lib/modules/designer/state/designcanvas.svelte.ts` and
  `src/lib/modules/notes/state/notes.svelte.ts` (undo-registration blocks ONLY)
- Verify-only: `CommandPalette.svelte`, `SettingsDialog.svelte`, `+layout.svelte`
  (expected: no component-import changes; grep to confirm)

**Stream B owns:**
- `src/lib/styles/**` (including `index.sass`), `src/lib/modules/ide/styles/**` (creating)
- `docs/**`, `AGENTS.md`

---

## Stream A — Code (Agent A)

Branch: `ide-module-code`. Do not touch `src/lib/styles/**`, `docs/**`, `AGENTS.md`.

### A1. Move files (git mv)

1. `src/lib/components/{ClassicIdeLayout,Editor,Sidebar,Terminal,TreeNode}.svelte`
   → `src/lib/modules/ide/components/`.
2. `src/lib/fileIcons.ts` → `src/lib/modules/ide/fileIcons.ts`.

### A2. Fix imports inside the moved files

- Sibling imports between moved files (`./Sidebar.svelte`, `./Editor.svelte`,
  `./Terminal.svelte`, `./TreeNode.svelte` inside `ClassicIdeLayout`/`Sidebar`) stay
  sibling-relative.
- `TreeNode.svelte`'s `fileIcons` import → `$lib/modules/ide/fileIcons` (or sibling
  `../fileIcons`).
- Everything that stays in core keeps being imported FROM core with `$lib/...` paths:
  `ideState` (`$lib/state/ide.svelte`), `editorTheme` (`$lib/editorTheme`),
  `Browser.svelte` (`$lib/components/Browser.svelte`), `AIChat.svelte` if referenced,
  ipc, data files. Convert any now-broken relative paths (`../state/ide.svelte`,
  `../editorTheme`) accordingly.

### A3. Update external importers (exhaustive — verified by inventory)

1. `src/routes/+page.svelte` — the lazy
   `{#await import('../lib/components/ClassicIdeLayout.svelte')}` (~line 215) → new
   path, still lazy. This is the ONLY component-level external importer of
   `ClassicIdeLayout`.
2. `src/lib/data/tileKinds.ts` — imports of `Sidebar`, `Editor`, `Terminal` (lines
   2–4) → module paths. Add a one-line comment marking these as the documented
   core→module edge (invariant 4).
3. There are NO other importers: `CommandPalette`/`SettingsDialog` only mention these
   components in label strings; `Minimap` belongs to Canvas; notes' sidebars import
   `VaultTreeNode`, not `TreeNode`. Grep-verify all of this rather than trusting it.

### A4. Undo self-registration inversion

In `src/lib/state/undo.svelte.ts`:
- Delete the imports of `designcanvas`, `design` (from `$lib/modules/designer/...`)
  and `notes` (from `$lib/modules/notes/...`).
- Delete the two `undoCoordinator.registerUndoDomain({ id: 'notes', ... })` and
  `({ id: 'design', ... })` blocks (copy them verbatim first — they move as-is).
- Keep: the `UndoDomain` interface, `TEMPLATE_DOMAIN` map (string ids only), the
  coordinator, the exported `registerUndoDomain`, and the `canvas` + `ide` domain
  registrations (both core).

In `src/lib/modules/notes/state/notes.svelte.ts` (bottom, after the existing
`ideState.registerVaultBridge(...)` block):
```ts
registerUndoDomain({
	id: 'notes',
	undo: () => notes.undo(),
	redo: () => notes.redo(),
	pushUndo: () => notes.pushUndo(),
});
```
with `import { registerUndoDomain } from '$lib/state/undo.svelte';` added at the top.

In `src/lib/modules/designer/state/designcanvas.svelte.ts` (bottom, after the
`designcanvas` singleton export): add
`import { design } from './design.svelte';` and
`import { registerUndoDomain } from '$lib/state/undo.svelte';`, then paste the
composite design-domain block **verbatim** (including its explanatory comment and the
`nextUndoOrder`/`nextRedoOrder` comparison logic).

Cycle check (do this, don't assume): after the inversion `undo.svelte.ts` must import
NO module files; `notes.svelte.ts` → `undo.svelte.ts` → `ide/app/canvas` only;
`designcanvas.svelte.ts` → `design.svelte`/`undo.svelte.ts`/`historyClock` only. None
of those import back into a module. Registration stays startup-eager because
`+layout.svelte` imports both module state files at module scope.

### A5. Straggler check

```
grep -rn "components/ClassicIdeLayout\|components/Editor\|components/Sidebar\.svelte\|components/Terminal\|components/TreeNode\|lib/fileIcons" src tests | grep -v modules/ide
```
must be empty (watch the word boundary: `NotesSidebar`/`VaultTreeNode` must not match —
adjust the pattern if your grep flags them, but investigate every hit before excluding
it). Then:
```
grep -n "modules/designer\|modules/notes" src/lib/state/undo.svelte.ts
```
must be empty.

### A6. Verify and commit

`pnpm check` (0 errors/0 warnings) → `pnpm build` → `npx vitest run` → then, because
this phase touches undo wiring for every domain,
`npx playwright test` (the FULL suite — design, ide, remediation — all unedited).
Commit with a message describing the move and the inversion.

---

## Stream B — Styles & docs (Agent B)

Branch: `ide-module-styles-docs`. Do not touch any `.svelte`/`.ts` file under `src/`
except sass, and do not touch `tests/`.

### B1. Move the sass (git mv)

`_editor.sass`, `_sidebar.sass`, `_terminal.sass` from `src/lib/styles/components/`
→ `src/lib/modules/ide/styles/`.

Before moving, class-grep each file to confirm ownership (headers say: Editor = "Code
Textarea, Tab Bar, Splash Page"; Sidebar = "File Explorer and Diagnostics Inspector";
Terminal = "Terminal Console Panel"). Verified stay-behinds: `_layout.sass` (app
structure — stays whole even if it contains some IDE-layout classes; note any such
residue in the ADR), `_minimap.sass` (Canvas), `_commandpalette.sass`, `_settings.sass`,
`_ai*.sass`, `_browser.sass`, `_tile.sass`, `_appdock.sass`, `_dock.sass`,
`_draggable.sass`, `_templategallery.sass`, `_canvas.sass`.

### B2. Fix paths + index.sass

- Each moved file's `@use '../tokens' as *` → `@use '../../../styles/tokens' as *`;
  check for other relative `@use`s.
- In `src/lib/styles/index.sass`, rewrite the three corresponding
  `@use 'components/<name>'` lines to `@use '../modules/ide/styles/<name>'`, same line
  positions, nothing else reordered.
- (`tests/unit/style-contracts.test.ts` needs no change — it walks all of `src/`;
  verified in both prior phases.)

### B3. Verify

`pnpm build` in your worktree (any failure is a sass path error — yours).

### B4. Documentation (AGENTS.md rule 10)

1. **Routing docs:** grep `docs/INDEX.md` for rows referencing the moved sources —
   at least `src--lib--components--ClassicIdeLayout.svelte.md`, `...Editor...`,
   `...Sidebar.svelte.md`, `...Terminal...`, `...TreeNode...`, and the `fileIcons`
   doc if one exists. Rename to new path-encoded names, update internal references
   (`agents/skills/app-documenter` conventions).
2. **Frontmatter + index:** `agents/skills/doc-frontmatter` on every touched doc;
   regenerate affected `docs/INDEX.md` rows; index must match disk exactly.
3. **ADR** via `agents/skills/adr-writing` — the most important deliverable of this
   stream. Record: (a) IDE surface extracted to `modules/ide/`; (b) undo
   self-registration inversion completed — core no longer imports modules;
   (c) **the kernel decision**: `ide.svelte.ts` remains core deliberately, with the
   section inventory (AI providers, Copilot streaming, passwords/browser, settings,
   marketplaces, memory/sessions, logs, workspaces, file-system/terminal) and the
   intended future decomposition into services, at which point the
   `ai/browser/settings` facades become real modules; (d) the accepted core→module
   edges (`tileKinds` → ide components, AIChat → designer panels) as the list to
   revisit during that decomposition.
4. **AGENTS.md:** update the Directory Structure section — add
   `src/lib/modules/ide/`; update the `src/lib/components/` line (Sidebar, Editor,
   Terminal no longer live there) and the `src/lib/fileIcons.ts` entry (new path).
   Consider a one-line note that `src/lib/modules/` now hosts designer, notes, and ide.

### B5. Commit

Message describing style + docs updates. Report: files moved, docs renamed, ADR id.

---

## Phase 3 — Integration & verification (run ONCE, after both branches merge)

1. Merge `ide-module-code`, then `ide-module-styles-docs`. Any conflict = an agent
   strayed; investigate, don't force-resolve.
2. `pnpm check` && `pnpm build` && `npx vitest run` — all green.
3. `npx playwright test` — FULL suite, all specs unedited. This is the main gate: ide
   and remediation specs cover tabs, terminal, shortcuts, palette, and undo atomicity
   across domains — precisely what A3/A4 touched.
4. Browser smoke (`run-fractalengine` skill), focused on what the specs don't cover:
   - fractalCode template loads (lazy chunk from the new path): file tree, editor
     tabs, terminal all render with styling intact (the three moved sass files).
   - Blank canvas: add Explorer, Editor, and Terminal tiles from the dock — proves the
     `tileKinds` cross-module imports.
   - Undo inversion spot-checks, one per relocated domain: a notes layout toggle
     undoes with `Cmd+Z` in the notes template; a designer block drag undoes in the
     design template; an IDE tab-close undoes in the IDE template (untouched domain,
     control case).
5. Straggler greps from A5 — clean. `git diff --check` — clean.
6. `pnpm tauri dev` manual pass (operator): open a real folder in the IDE, edit/save a
   file, run a terminal command, save/load a workspace, and confirm native-menu
   Undo/Redo still routes per template.

## Explicitly out of scope (do not improvise)

- Splitting `ide.svelte.ts` (the kernel) or dissolving the `ai/browser/settings`
  facades.
- Moving `Browser.svelte`/`Minimap.svelte`/`editorTheme.ts`/`_layout.sass`.
- Barrel files; a tile-component registry abstraction; any Canvas/blank-template work.
- Renaming `ideState` or any public API.
