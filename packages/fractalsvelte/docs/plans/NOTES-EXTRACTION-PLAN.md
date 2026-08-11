---
id: notes-extraction-plan
title: Notes Extraction Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**


**Repo:** `apps/fractalengine` (SvelteKit + Tauri, Svelte 5 runes, indented SASS)
**Base commit:** current `master` HEAD (`679714deb` or later). Both agents branch from the
same commit.
**Line numbers cited below are as of `679714deb` — always re-verify with grep before
editing; do not edit blind by line number.**

You are one of two agents executing this plan in parallel. Your operator will tell you
whether you are **Agent A (Stream A — code extraction & surgery)** or **Agent B (Stream B
— styles & docs)**. Read the *Shared contract* fully, then execute only your own stream.
Do not perform any step from the other stream — disjoint file ownership is what makes the
parallel merge safe.

- Agent A works on branch `notes-module-code`.
- Agent B works on branch `notes-module-styles-docs`.
- Each agent works in its own git worktree, branched from the same `master` commit.
- Phase 3 (integration & verification) runs once after both branches merge; it is NOT
  part of either stream.

**How this differs from the designer extraction:** Designer was pure file relocation.
Notes is relocation **plus surgery on `ide.svelte.ts`**: the vault implementation
(~350 lines: types, guards, state fields, methods, persistence) currently lives inside
`ideState`, and `notes.svelte.ts` is only a facade delegating to it. Stream A physically
moves that implementation into the notes module and installs one small, precisely-specified
seam (the Vault Bridge) so `ideState`'s undo/workspace snapshots keep working. Everything
else follows the designer playbook.

---

## Shared contract (both agents must read)

### Goal

Move everything Notes-specific into `src/lib/modules/notes/` with **zero behavioral
change**. No renames of public symbols, CSS classes, storage keys, or event strings. No
logic edits beyond the mechanical transformations specified below. No barrel `index.ts`
— deep imports everywhere. Use `git mv` for file moves (for `notes.svelte.ts`, `git mv`
first, then edit in place, so history is preserved).

### Target layout (fixed)

```
src/lib/modules/notes/
├── state/notes.svelte.ts    ← current facade, absorbing the vault implementation from ideState
├── components/              ← NotesLayout.svelte, NotesSidebar1.svelte, NotesSidebar2.svelte,
│                              NotesEditor.svelte, VaultTreeNode.svelte
├── frontmatter.ts           ← from src/lib/notes/frontmatter.ts (delete emptied src/lib/notes/)
└── styles/_notes.sass       ← from src/lib/styles/components/ (Stream B)
```

### Canonical import-path mapping

| Old | New |
|---|---|
| `$lib/state/notes.svelte` (and `../state/notes.svelte`, `./notes.svelte`) | `$lib/modules/notes/state/notes.svelte` |
| `$lib/components/NotesLayout.svelte` (and Sidebar1/2, NotesEditor, VaultTreeNode) | `$lib/modules/notes/components/<x>` |
| `$lib/notes/frontmatter` | `$lib/modules/notes/frontmatter` |

### Do-NOT-touch list (traps — these look notes/vault-related but are NOT)

| Item | Why it stays |
|---|---|
| **The password vault** in `ide.svelte.ts` (~line 2480+: `loadPasswords`, `passwordsList`, `vaultTotpCount`, Bitwarden-export import, "Cleared password vault data") | "Vault" here means the **browser password vault** — a completely different feature. Only the *Notes* vault (marked `// --- Vault States (Notes template only) ---` and `// --- Vault operations (Notes template only) ---`) moves. |
| `src/lib/components/TreeNode.svelte` | The IDE file-explorer tree. `VaultTreeNode.svelte` is the notes one. |
| `src/lib/components/Sidebar.svelte` | IDE sidebar. Only `NotesSidebar1/2` move. |
| `src/lib/components/AIChat.svelte` | Shared; `NotesLayout` imports it (module → shared is the allowed direction). |
| `src/lib/state/undo.svelte.ts` registration block | Central registration stays (matches designer decision); only the import path changes (Stream A). |
| Everything else in `ide.svelte.ts` | Only the Notes-vault sections listed in A3 leave. |
| `src/lib/ipc.ts` / `ipc-mock.ts`, configs | Out of scope. `FileEntry` stays defined in `ipc.ts`. |

### Preserved contracts (zero-change invariants)

1. **localStorage keys, exact:** `fractalengine:notes`, `ide:notes-open-file`,
   `ide:vault-tree-state`, `ide:current-vault`, `ide:saved-vaults`, and the
   `ide:workspaces` record shape (its `currentVaultName` / `currentVaultRoots` /
   `savedVaults` fields keep their names and JSON-serialized string encoding).
2. **Event/shortcut contracts:** the `fractalnotes:new-note` CustomEvent name;
   `Cmd+Alt+O` / `Cmd+Alt+A` / `Cmd+Alt+S` handling in `+layout.svelte`; native-menu
   action ids in `+layout.svelte` (`tpl_notes`, the vault menu actions).
3. **Lazy loading:** `NotesLayout` stays lazily loaded in `+page.svelte` via
   `{#await import(...)}`; CommandPalette's notes actions stay dynamic imports.
4. **Public API of the `notes` singleton:** every property/method components use today
   keeps its name and signature. The API *grows* by exactly one method
   (`requestSaveVaultFromMenu`, absorbed from `ideState`) — nothing shrinks.
5. **Undo semantics:** vault operations (`openVaultFromFolder`, `addFolderToVault`,
   `saveCurrentAsVault`, `loadSavedVault`, `deleteSavedVault`, `clearSavedVaults`) keep
   pushing entries onto the **ide** undo domain via `ideState.pushUndo()`, and ide
   snapshots keep capturing/restoring vault fields — via the Vault Bridge below. The
   notes domain's own layout-only undo stack is untouched.
6. No CSS class renames (the retained end-to-end specs exercise notes selectors and
   must pass unedited).

### The Vault Bridge (the one new seam — spec is exact, do not improvise)

Today `ideState.takeSnapshot()` (used by BOTH the ide undo stack and workspace
save/load) embeds three vault fields, and `restoreSnapshot` restores them; and
`initWorkspace()` calls `loadSavedVaults()` early and `await restoreCurrentVault()`
after `loadPasswords()`. After extraction those live in the notes module, so `ideState`
reaches them through a registered bridge. Direction: **core defines the seam, module
implements it** — `ide.svelte.ts` never imports the notes module.

In `ide.svelte.ts` (Stream A adds):

```ts
// Seam for the notes module's vault state to participate in ide snapshots and startup.
// Registered by src/lib/modules/notes/state/notes.svelte.ts at module init.
export interface VaultBridge {
	capture(): { currentVaultName: string | null; currentVaultRoots: string; savedVaults: string };
	restore(fields: { currentVaultName: string | null; currentVaultRoots: string; savedVaults: string }): void;
	loadSavedVaults(): void;
	restoreCurrentVault(): Promise<void>;
}
```

- `ideState` gets a private `vaultBridge: VaultBridge | null = null` and a public
  `registerVaultBridge(bridge: VaultBridge): void`.
- `takeSnapshot()`: the three vault lines become a spread of
  `this.vaultBridge?.capture() ?? { currentVaultName: null, currentVaultRoots: '[]', savedVaults: '[]' }`.
  The `IDEStateSnapshot` / workspace-snapshot interfaces keep the three fields with
  unchanged names and types.
- `restoreSnapshot()` (the block currently parsing `snapshot.currentVaultRoots` /
  `snapshot.savedVaults` and calling `persistSavedVaults()` / `persistCurrentVault()`):
  replaced by
  `this.vaultBridge?.restore({ currentVaultName: snapshot.currentVaultName ?? null, currentVaultRoots: snapshot.currentVaultRoots || '[]', savedVaults: snapshot.savedVaults || '[]' })`.
  The JSON parsing, validation guards, and re-persist calls move INTO the notes module's
  `restore()` implementation, verbatim.
- `initWorkspace()`: `this.loadSavedVaults()` → `this.vaultBridge?.loadSavedVaults()`;
  `await this.restoreCurrentVault()` → `await this.vaultBridge?.restoreCurrentVault()`.
  **Same call positions — do not reorder startup.**
- The notes module registers at module-eval time (`ideState.registerVaultBridge({...})`
  at the bottom of the new `notes.svelte.ts`). This is safe: notes imports ide, ide
  never imports notes, so there is no cycle. `+layout.svelte` imports the notes state at
  module scope, so the bridge is registered before `onMount` calls
  `ideState.initWorkspace()`.

### File-ownership manifest (disjoint)

**Stream A owns:**
- `src/lib/state/notes.svelte.ts` (moving + absorbing), `src/lib/state/ide.svelte.ts`
  (vault surgery ONLY), `src/lib/state/undo.svelte.ts`
- `src/lib/components/{NotesLayout,NotesSidebar1,NotesSidebar2,NotesEditor,VaultTreeNode}.svelte` (moving)
- `src/lib/notes/frontmatter.ts` (moving; delete the emptied folder)
- `src/lib/modules/notes/{state,components}/**`, `src/lib/modules/notes/frontmatter.ts` (creating)
- `src/routes/+page.svelte`, `src/routes/+layout.svelte`
- `src/lib/components/CommandPalette.svelte`; `SettingsDialog.svelte` (verify-only)
- `tests/unit/frontmatter.test.ts`

**Stream B owns:**
- `src/lib/styles/**` (including `index.sass`), `src/lib/modules/notes/styles/**` (creating)
- `docs/**`, `AGENTS.md`

Anything not in your list: hands off. If your stream seems to require editing the other
stream's file, STOP and report to the operator.

---

## Stream A — Code extraction & surgery (Agent A)

Branch: `notes-module-code`. Do not touch `src/lib/styles/**`, `docs/**`, `AGENTS.md`.

### A1. Move the easy files (git mv)

1. `src/lib/components/NotesLayout.svelte`, `NotesSidebar1.svelte`,
   `NotesSidebar2.svelte`, `NotesEditor.svelte`, `VaultTreeNode.svelte`
   → `src/lib/modules/notes/components/`.
2. `src/lib/notes/frontmatter.ts` → `src/lib/modules/notes/frontmatter.ts`; remove the
   emptied `src/lib/notes/`.
3. `src/lib/state/notes.svelte.ts` → `src/lib/modules/notes/state/notes.svelte.ts`
   (move first, then perform A3's absorption in place).

Fix intra-module imports: components' `../state/notes.svelte` →
`$lib/modules/notes/state/notes.svelte`; `NotesEditor`'s `$lib/notes/frontmatter` →
`$lib/modules/notes/frontmatter`; `VaultTreeNode`'s `../ipc` → `$lib/ipc`;
`NotesSidebar1`'s `./VaultTreeNode.svelte` stays sibling-relative; `NotesLayout`'s
AIChat import → `$lib/components/AIChat.svelte`.

### A2. Identify the vault code leaving `ide.svelte.ts`

The complete set (grep-verify each; `// Notes template only` comments mark the regions):
- Type guards `isFileEntry`, `isVaultRoot`, `isSavedVault` (~lines 145–171). Before
  moving `isFileEntry`, grep that its ONLY use is `restoreVaultTreeState` — if any
  non-vault ide code uses it, leave a copy behind.
- Exported types `VaultRoot`, `SavedVault` (~196–207). Grep for external importers of
  these types (currently only `notes.svelte.ts` itself imports them from `./ide.svelte`)
  and update them to import from the new notes state module.
- State fields block `// --- Vault States (Notes template only) ---` (~462–475):
  `currentVaultName`, `currentVaultRoots`, `currentVaultTrees`, `savedVaults`,
  `vaultError`, `pendingVaultSavePrompt`, `vaultSelectedFolderPath`,
  `vaultExpandedFolders`, `vaultExpandedFolderPaths`.
- Methods block `// --- Vault operations (Notes template only) ---` (~1130–1474):
  `requestSaveVaultFromMenu`, `openVaultFromFolder`, `addFolderToVault`,
  `saveCurrentAsVault`, `loadSavedVault`, `deleteSavedVault`, `clearSavedVaults`,
  `loadVaultTree`, `toggleVaultFolderExpanded`, `refreshVaultFolder`,
  `selectVaultFolder`, `autoSelectFirstLeafFolder`, `autoExpandAndSelect`,
  `persistVaultTreeState`, `restoreVaultTreeState`, `persistCurrentVault`,
  `persistSavedVaults`, `loadSavedVaults`, `restoreCurrentVault`.
- Snapshot participation (~306–308, ~582–584, ~675–689) — replaced by the Vault Bridge.
- Init calls in `initWorkspace()` (~817, ~824) — replaced by bridge calls.

**The password-vault code (~2480+) stays. Re-read the do-not-touch table before cutting.**

### A3. Absorb into `modules/notes/state/notes.svelte.ts`

1. Paste the types, guards, state fields, and methods into the `NoteState` class /
   module scope, keeping bodies verbatim except these mechanical substitutions inside
   the moved methods:
   - `this.addLog(...)` → `ideState.addLog(...)`
   - `this.pushUndo()` → `ideState.pushUndo()` **(only inside the moved vault methods —
     the pre-existing `NoteState.pushUndo` for layout undo is a different method and
     stays as-is; the moved vault methods must call the ide domain, exactly as today)**
   - `this.captureSnapshot()` → `ideState.captureSnapshot()` (used by
     `openVaultFromFolder`-style rollback; check each moved method for other `this.`
     references to members that remain in `ideState` and qualify them the same way)
2. Export `VaultRoot` and `SavedVault` from the new notes state module; delete the old
   facade getters/setters and the eight `.bind(ideState)` delegate lines — the real
   implementations replace them under the same public names. Add
   `requestSaveVaultFromMenu` to the class (absorbed).
3. Update imports: the module already pulls `createFile, readFile, writeFile` from ipc —
   change to `$lib/ipc` and add `listDirectory`, `selectDownloadDirectory`, and
   `type FileEntry`. Import `{ ideState }` from `$lib/state/ide.svelte` (runtime use
   only — never dereference `ideState` in a field initializer).
4. Implement and register the bridge at the bottom of the module:

```ts
ideState.registerVaultBridge({
	capture: () => ({
		currentVaultName: notes.currentVaultName,
		currentVaultRoots: JSON.stringify(notes.currentVaultRoots),
		savedVaults: JSON.stringify(notes.savedVaults),
	}),
	restore: (fields) => notes.restoreFromWorkspaceSnapshot(fields),
	loadSavedVaults: () => notes.loadSavedVaults(),
	restoreCurrentVault: () => notes.restoreCurrentVault(),
});
```

   where `restoreFromWorkspaceSnapshot` is a new method containing, verbatim, the
   parse/validate/assign/re-persist logic cut from `ideState.restoreSnapshot`'s vault
   block (including its try/catch fallbacks and the `persistSavedVaults()` +
   `persistCurrentVault()` calls).

### A4. Surgery in `ide.svelte.ts`

Apply the Vault Bridge spec from the shared contract: add the interface +
`registerVaultBridge`, replace the three snapshot-capture lines, the snapshot-restore
block, and the two `initWorkspace` calls; delete everything listed in A2. Remove
now-unused imports (e.g. `selectDownloadDirectory` if nothing else uses it — grep
first). `FileEntry` from ipc is used elsewhere in ide — keep it.

### A5. Update external callers

| File | Change |
|---|---|
| `src/routes/+page.svelte` | Import path for `notes`; lazy `import('$lib/components/NotesLayout.svelte')` (~line 224) → new path, still lazy. |
| `src/routes/+layout.svelte` | Import path (line 8). Re-point `ideState.openVaultFromFolder()` (~48), `ideState.addFolderToVault()` (~50), and BOTH `ideState.requestSaveVaultFromMenu()` calls (~52, ~133) to `notesState.*`. The existing `notesState.openVaultFromFolder()` / `addFolderToVault()` keyboard calls (~127, ~130) need only the import-path change. |
| `src/lib/components/CommandPalette.svelte` | Six dynamic imports of `../state/notes.svelte` → new path (keep dynamic). "Save Current as Vault..." action (~line 72): `ideState.requestSaveVaultFromMenu()` → route through the notes module (use a dynamic import like its sibling actions). `fractalnotes:new-note` event untouched. |
| `src/lib/state/undo.svelte.ts` | Import path for `notes` only; registration block unchanged. |
| `tests/unit/frontmatter.test.ts` | Import path → `../../src/lib/modules/notes/frontmatter`. |
| `src/lib/components/SettingsDialog.svelte` | Verify-only: grep for notes/vault imports; expected none. |

### A6. Straggler check

```
grep -rn "state/notes\.svelte\|components/NotesLayout\|components/NotesSidebar\|components/NotesEditor\|components/VaultTreeNode\|lib/notes/frontmatter" src tests | grep -v modules/notes
```
must be empty, and:
```
grep -n "currentVaultRoots\|savedVaults\|vaultExpandedFolders\|loadVaultTree\|restoreCurrentVault" src/lib/state/ide.svelte.ts
```
must show only the `VaultBridge` interface/field/register code and snapshot field names
— no remaining implementation. (Password-vault code will still match plain "vault"
greps; that is correct.)

### A7. Verify and commit

`pnpm check` (0/0) → `pnpm build` → `npx vitest run` (frontmatter + all unit tests
green). Then the highest-risk behavioral checks even before Phase 3, via
`npx playwright test tests/ide.spec.ts` — this exercises
notes autosave/undo paths and ide workspace behavior. Commit with a message describing
the extraction and the bridge.

---

## Stream B — Styles & docs (Agent B)

Branch: `notes-module-styles-docs`. Do not touch any `.svelte`/`.ts` file under `src/`
except sass files, and do not touch `tests/`. In your worktree the code is unmoved —
expected; document the post-merge reality defined by the shared contract.

### B1. Move the sass (git mv)

`src/lib/styles/components/_notes.sass` → `src/lib/modules/notes/styles/_notes.sass`
(the only notes sass file). Fix its header to `@use '../../../styles/tokens' as *` and
check for any other relative `@use`. Preserve indented-SASS syntax exactly.

### B2. Update `src/lib/styles/index.sass`

`@use 'components/notes'` (line ~29) → `@use '../modules/notes/styles/notes'`, same
line position, nothing else reordered.

*(No test changes needed: `tests/unit/style-contracts.test.ts` walks all of `src/`
recursively — verified during the designer extraction.)*

### B3. Verify

`pnpm build` in your worktree (code unmoved there, so any failure is a sass path error —
yours). Optionally `npx vitest run tests/unit/style-contracts.test.ts`.

### B4. Documentation (AGENTS.md rule 10)

1. **Routing docs** — rename to new path-encoded names and update internal path
   references (`agents/skills/app-documenter` conventions):
   `src--lib--components--NotesLayout.svelte.md`, `...NotesSidebar1...`,
   `...NotesSidebar2...`, `...NotesEditor...`, `...VaultTreeNode...`,
   `src--lib--notes--frontmatter.ts.md`, `src--lib--state--notes.svelte.ts.md`.
2. **Content updates for the surgery** (per the shared contract's bridge spec — Stream A
   is implementing exactly it):
   - The notes-state doc: no longer a facade; it owns vault state/operations/persistence
     and registers the `VaultBridge`.
   - `src--lib--state--ide.svelte.ts.md`: vault state/operations moved out; ide keeps
     the `VaultBridge` seam (snapshot capture/restore + startup delegation). The
     password vault is unaffected.
3. **Frontmatter + index:** run `agents/skills/doc-frontmatter` on every touched doc and
   regenerate the affected `docs/INDEX.md` rows; index must match disk exactly.
4. **ADR** via `agents/skills/adr-writing`: notes module extraction — motivation
   (second module after designer; vault implementation previously embedded in ideState),
   decision (module layout + the VaultBridge seam: core defines, module registers, no
   core→module import), consequences (ideState slimmed ~350 lines; undo/workspace
   snapshot shape unchanged; bridge pattern is the template for future cross-module
   snapshot participation).
5. **AGENTS.md:** add `src/lib/modules/notes/` to the Directory Structure section
   (one line, alongside the designer entry). Rule 6 already covers module styles from
   the designer amendment — verify, don't re-edit.

### B5. Commit

Message describing style + docs updates. Report: files moved, docs renamed, ADR id.

---

## Phase 3 — Integration & verification (run ONCE, after both branches merge)

1. Merge `notes-module-code`, then `notes-module-styles-docs`. Ownership is disjoint —
   any conflict means an agent strayed; investigate, don't force-resolve.
2. `pnpm check` && `pnpm build` && `npx vitest run` — all green.
3. `npx playwright test` — the FULL suite (`design.spec`, `ide.spec`,
   `remediation.spec`), all specs unedited.
4. Manual smoke (`run-fractalengine` skill; app runs in-browser via ipc-mock — note the
   folder picker returns null outside Tauri, so `openVaultFromFolder` logs
   "requires desktop mode"; that message appearing IS the pass condition for that path):
   - Open the Notes template: three-pane layout renders, vault sidebar and notes list
     populate from the mock workspace.
   - Open a note, type — save status cycles dirty → idle (800 ms debounce autosave).
   - Palette: New Note (`fractalnotes:new-note` fires), Toggle Notes Vault/File/AI
     Sidebar, Retry Pending Note Save — all execute; toggles undo with `Cmd+Z`
     (layout-only notes domain).
   - `Cmd+Alt+O` / `Cmd+Alt+A` in notes template → "requires desktop mode" log entries
     (proves the re-pointed handlers reach the moved implementations).
   - Saved Vaults list renders in the notes header strip; Save-as-Vault prompt appears
     via the palette action (`pendingVaultSavePrompt` round-trip through +page).
   - Reload: notes layout dimensions, open file, and vault tree state persist
     (`fractalengine:notes`, `ide:notes-open-file`, `ide:vault-tree-state` keys).
   - Switch to the IDE template, save a workspace, reload, load the workspace — no
     errors and vault fields round-trip through the bridge (watch the console for
     bridge-related exceptions; this is the highest-risk path).
5. Straggler greps from A6 — clean. `git diff --check` — clean.
6. Tauri-only paths (native File menu → vault actions, real folder picker) cannot be
   exercised in the browser: verify in `pnpm tauri dev` — open a real vault folder, add
   a second root, save as named vault, reload, delete a saved vault.

## Explicitly out of scope (do not improvise)

- Moving `addLog`/logging into a shared service (notes calls `ideState.addLog` for now).
- Undo-domain self-registration inversion; barrel files; any IDE/shell split work.
- Making vault operations undoable from the notes domain (they stay on the ide domain,
  exactly as today — quirks included).
- Generalizing the VaultBridge into a generic module-snapshot registry (that is the
  core/shell phase's job; the ADR should note it as the intended evolution).
