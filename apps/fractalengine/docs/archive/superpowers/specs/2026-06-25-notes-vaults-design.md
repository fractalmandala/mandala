---
id: sp-spec-2026-06-25-notes-vaults-design
title: Superpowers Spec: 2026-06-25-notes-vaults-design
type: archive
tags: [superpowers, spec, history]
updated: 2026-07-15
---

> **Historical superpowers specification — kept as reference.**

# Notes Vaults + Menu Reorganization

**Status:** Draft (awaiting user review)
**Date:** 2026-06-25
**Author:** brainstorm session
**Scope:** Notes-template vault system + File/Window menu rebuild

---

## 1. Context

The Notes template currently reads files from `ideState.rootPath` (a single folder selected via the code-template's Open Folder flow). Vaults are a Notes-only concept that lets users manage multiple named folder collections, persist their selection across restarts, and reorganize the File/Window menus to reflect the new mental model.

The existing **workspace** concept (code-template multi-root, `.fractal-workspace` files, `ide:workspaces` localStorage key) is untouched. This spec introduces a parallel **vault** system scoped to Notes only.

The File menu's 3rd/4th/5th items (currently `Open Workspace…` / `Add Folder to Workspace…` / `Save Current as Workspace…`) get retargeted to vault operations and renamed accordingly. The Window menu gains template navigation with native checkmarks.

---

## 2. Goals & Non-Goals

### Goals

- Users can open any local folder as a vault in the Notes template.
- Users can add additional folders as **second vault roots** to an open vault.
- Users can save the current vault (name + all roots) to a persistent list of named vaults.
- Users can reopen a saved vault and pick up exactly where they left off.
- The active vault selection auto-restores on app startup.
- File menu slots 3/4/5 are renamed to vault operations and route to vault methods.
- Window menu lists all templates with the active template showing a native checkmark.

### Non-Goals

- Vault features are desktop-only. Browser mode (no Tauri dialogs) is not supported; the menu items are visible but inert and surface a "Desktop only" notice when triggered.
- The existing `workspace` machinery (code template, `.fractal-workspace` files, `savedWorkspaces`) is untouched.
- The browser's password "vault" is a different concept and is untouched.
- Notes template state (panel widths, active file) is not part of vault snapshots — only roots are saved.
- Cross-machine vault sync, vault encryption, vault sharing — out of scope.

---

## 3. Data Model

### `SavedVault` (new)

```ts
// Lives in src/lib/state/ide.svelte.ts
export interface VaultRoot {
  path: string;       // absolute path to a folder
  label: string;      // user-editable display label; defaults to folder basename
}

export interface SavedVault {
  id: string;         // crypto.randomUUID()
  name: string;       // user-given vault name (e.g. "Personal", "Work")
  roots: VaultRoot[]; // 1..N roots — multi-root vaults
  lastOpenedAt: number;
}
```

### `IDEState` extensions

```ts
// ── Vault state (Notes template only) ──
currentVaultName = $state<string | null>(null);
currentVaultRoots = $state<VaultRoot[]>([]);   // currently-open vault's roots (empty = no vault open)
currentVaultTrees = $state<Record<string, FileEntry[]>>({});  // path → entries, lazy-loaded
savedVaults = $state<SavedVault[]>([]);
vaultError = $state<string | null>(null);
```

`currentVaultRoots` is populated even when no saved vault exists (i.e. user just opened a folder without naming it). `savedVaults` is the persistent list.

### Persistence (localStorage)

| Key | Shape | Purpose |
|---|---|---|
| `ide:current-vault` | `{ name, roots: VaultRoot[] }` | Auto-restore on app startup |
| `ide:saved-vaults` | `SavedVault[]` | Persistent saved vault list |

Both are read in `ideState` constructor (existing init block at `ide.svelte.ts:523`) and written on every mutation.

---

## 4. State Methods

Add to `IDEState` class in [ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts):

```ts
// ── Vault operations ──

async openVaultFromFolder(): Promise<void>
  // Tauri folder picker → set currentVaultRoots = [{path, label: basename}]
  // → loadVaultTree for the new root

async addFolderToVault(): Promise<void>
  // Tauri folder picker → push VaultRoot to currentVaultRoots
  // → loadVaultTree for the new root
  // If no vault open, behaves like openVaultFromFolder

async saveCurrentAsVault(name: string): Promise<void>
  // name arg from prompt() or modal
  // validate name not empty and not already taken
  // push { id, name, roots: [...currentVaultRoots], lastOpenedAt: Date.now() } to savedVaults
  // persist to localStorage

async loadSavedVault(id: string): Promise<void>
  // lookup SavedVault by id
  // set currentVaultName, currentVaultRoots
  // loadVaultTree for each root
  // update lastOpenedAt, persist
  // if any root path no longer exists → set vaultError with index of broken root, prompt re-pick

async deleteSavedVault(id: string): Promise<void>
  // remove from savedVaults
  // persist

clearSavedVaults(): void
  // wipe savedVaults, persist (does not affect currentVaultRoots)

async loadVaultTree(path: string): Promise<void>
  // internal: listDirectory(path) → currentVaultTrees[path]
  // sets vaultError on failure
```

Undo/Redo (mandatory per AGENTS.md rule 6 + ADR-006): vault operations that mutate `currentVaultRoots` or `savedVaults` must go through `pushUndo()` so `Cmd+Z` reverts them. Use the existing `pushUndo` / `restoreSnapshot` machinery in `ideState`.

---

## 5. File Menu Mapping

In [src-tauri/src/lib.rs](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs) `create_menu()`:

| Slot | Old ID | Old Label | New ID | New Label | Shortcut |
|---|---|---|---|---|---|
| 3rd | `open_workspace` | Open Workspace… | `open_vault` | Open Vault… | `CmdOrCtrl+Alt+O` |
| 4th | `add_folder_to_workspace` | Add Folder to Workspace… | `add_folder_to_vault` | Add Folder to Vault… | `CmdOrCtrl+Alt+A` |
| 5th | `save_workspace` | Save Current as Workspace… | `save_as_vault` | Save Current as Vault… | `CmdOrCtrl+Alt+S` |

The existing handlers for `open_workspace` / `add_folder_to_workspace` / `save_workspace` (in `+layout.svelte` or wherever they're consumed) are removed. New handlers route to the vault methods above.

The **first two items** (Open File…, Open Folder…) stay as-is. The **Close Window** item stays. The separator before "Save Current as…" stays.

---

## 6. Window Menu — Template Navigation

Replace the Window menu contents in `lib.rs:736-740` with:

```rust
let window_menu = tauri::menu::SubmenuBuilder::new(handle, "Window")
    // Template items (CheckMenuItem, single-select — checked = active template)
    .item(&CheckMenuItem::with_id(handle, "tpl_home",  "Home",         true, false, None)?)
    .item(&CheckMenuItem::with_id(handle, "tpl_code",  "Code — Classic", true, false, None)?)
    .item(&CheckMenuItem::with_id(handle, "tpl_notes", "Notes / Wiki",  true, false, None)?)
    .item(&CheckMenuItem::with_id(handle, "tpl_blank", "Blank Canvas",  true, false, None)?)
    .separator()
    // Existing window controls preserved
    .item(&PredefinedMenuItem::minimize(handle, None)?)
    .item(&PredefinedMenuItem::maximize(handle, None)?);
```

### Checkmark sync

The four template items are `CheckMenuItem`s. Initial checked state mirrors the boot default — the first entry in [templates.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/data/templates.ts) is `home` (`Project Home`), so `tpl_home` is created with `checked=true` and the others `checked=false`.

To keep the checkmark in sync as the user switches templates, we expose a Rust command:

```rust
#[tauri::command]
fn set_active_template_menu(app: tauri::AppHandle, template_id: String) {
    // for each template id, set CheckMenuItem checked = (id == template_id)
}
```

The frontend calls this command from `canvas.activeTemplateId`'s change effect:

```ts
$effect(() => {
    invoke('set_active_template_menu', { templateId: canvas.activeTemplateId });
});
```

This requires the Rust side to retain `MenuItem` handles by ID (stored in a `HashMap<String, CheckMenuItem<R>>` on app state).

### Click handlers

`on_menu_event` already emits `menu-event` with the ID to the frontend. The frontend handler routes:
- `tpl_home` → `canvas.activeTemplateId = 'home'`
- `tpl_code` → `canvas.activeTemplateId = 'code'`
- `tpl_notes` → `canvas.activeTemplateId = 'notes'`
- `tpl_blank` → `canvas.activeTemplateId = 'blank'`

(If a `design` template gets added in the future, the spec extends; no current entry to handle.)

---

## 7. UI — NotesSidebar1

[NotesSidebar1.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesSidebar1.svelte) currently renders just a static "Vault" header. Replace with:

```
┌─ Vault ─────────────────────────────┐
│ Current: my-notes                   │
│ Roots (2):                          │
│   • /Users/me/notes                 │
│   • /Users/me/notes-archive         │
├─────────────────────────────────────┤
│ [Open Vault…]                       │
│ [Add Folder to Vault…]              │
│ [Save Current as Vault…]            │
├─────────────────────────────────────┤
│ Saved Vaults                        │
│   my-notes      [Open] [×]          │
│   work          [Open] [×]          │
│   archive       [Open] [×]          │
│ [Clear Saved Vaults]                 │
├─────────────────────────────────────┤
│ ⚠ Folder no longer exists: …        │  (only when vaultError)
│ [Re-pick location]                  │
└─────────────────────────────────────┘
```

- All buttons routed through `ideState` vault methods.
- "Save Current as Vault…" disabled when `currentVaultRoots.length === 0`.
- "Open" button on each saved vault row calls `loadSavedVault(id)`.
- "×" button on each row calls `deleteSavedVault(id)`.
- "Clear Saved Vaults" calls `ideState.clearSavedVaults()` directly (no destructive confirm — the operation is reversible via "Save Current as Vault…" re-adding them).
- All labels/buttons consume semantic tokens — no hardcoded colors.

[NotesSidebar2.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesSidebar2.svelte) renders the file tree per vault root. Layout: one collapsible tree section per `VaultRoot`, labeled by `label`. Empty state: "Open a vault to start."

[NotesEditor.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesEditor.svelte) is unchanged — it already operates on absolute file paths via `readFile` / `writeFile`. Vault roots just provide the file picker source.

---

## 8. Styling

All new classes live in [_notes.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_notes.sass) (continuing indented-SASS convention):

- `.vault-current` — current vault name display
- `.vault-roots-list` — list of current roots
- `.vault-root-item` — single root row (path + remove ×)
- `.vault-actions` — action buttons row
- `.vault-actions-btn` — primary button
- `.saved-vault-list` — saved vaults section
- `.saved-vault-item` — single saved vault row
- `.saved-vault-item-name` — vault name text
- `.saved-vault-item-actions` — Open / × actions
- `.vault-error` — error banner

All colors via `var(--text-*)`, `var(--background-*)`, `var(--border-*)`, `var(--theme-color)`. All radii match the existing 4px convention used elsewhere in `_notes.sass`. All spacing follows the existing spacing rhythm (4/8/12/16px steps).

---

## 9. IPC Layer

The existing folder picker [ipc.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts) `selectDirectory` is reused. No new IPC commands required for vault operations — they're all built on existing primitives (`listDirectory`, `readFile`, `writeFile`).

[ipc-mock.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc-mock.ts) returns `null` from `selectDirectory` in browser mode. The vault methods detect this null and surface a "Desktop only" notice via `ideState.addLog(..., 'warn')` plus a UI banner in NotesSidebar1. No mock fallback for vault CRUD is provided.

---

## 10. Startup & Restoration

In `ideState` constructor:

```ts
// Existing init code at line ~523...

// ── Vault restoration ──
try {
  const rawCurrent = localStorage.getItem('ide:current-vault');
  if (rawCurrent) {
    const { name, roots } = JSON.parse(rawCurrent);
    this.currentVaultName = name;
    this.currentVaultRoots = roots;
    await Promise.all(roots.map(r => this.loadVaultTree(r.path).catch(() => {})));
  }
} catch (e) {
  this.addLog(`Failed to restore vault: ${e.message}`, 'error');
  localStorage.removeItem('ide:current-vault');
}

try {
  const rawSaved = localStorage.getItem('ide:saved-vaults');
  if (rawSaved) this.savedVaults = JSON.parse(rawSaved);
} catch (e) {
  this.addLog(`Failed to restore saved vaults: ${e.message}`, 'error');
  localStorage.removeItem('ide:saved-vaults');
}
```

A missing root is non-fatal — `loadVaultTree` sets `vaultError` and the UI offers re-pick.

---

## 11. Undo / Redo

Vault mutations push undo snapshots:
- `openVaultFromFolder` → `pushUndo()` before mutation
- `addFolderToVault` → `pushUndo()` before mutation
- `saveCurrentAsVault` → `pushUndo()` before mutation (savedVaults changes)
- `loadSavedVault` → `pushUndo()` before mutation
- `deleteSavedVault` → `pushUndo()` before mutation
- `clearSavedVaults` → `pushUndo()` before mutation

`currentVaultTrees` is derived state — not undoable on its own; restored via the root-set restore.

`restoreSnapshot` (existing) handles restoring `currentVaultName`, `currentVaultRoots`, `savedVaults` via JSON-stringify round-trip (already covered by `takeSnapshot` / `restoreSnapshot` pattern at `ide.svelte.ts:298-468`).

---

## 12. Files Touched

| File | Change |
|---|---|
| [ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts) | New vault state + methods + persistence |
| [src-tauri/src/lib.rs](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs) | File menu rename, Window menu templates with CheckMenuItem, new `set_active_template_menu` command |
| [canvas.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/canvas.svelte.ts) | `$effect` to sync menu checks with `activeTemplateId` |
| [NotesSidebar1.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesSidebar1.svelte) | Vault picker UI |
| [NotesSidebar2.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesSidebar2.svelte) | Render tree per vault root |
| [NotesLayout.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesLayout.svelte) | Wire vault actions |
| [_notes.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_notes.sass) | New vault-related classes |
| New: [docs/adr/ADR-013-notes-vault-persistence.md](file:///Users/amrit/fractals/apps/fractalengine/docs/adr/ADR-013-notes-vault-persistence.md) | Records the localStorage schema + scope decision |
| [AGENTS.md](file:///Users/amrit/fractals/apps/fractalengine/AGENTS.md) | Add ADR-013 to registry, update routing docs table |
| New routing docs | `src--lib--components--NotesSidebar1.svelte.md` (update) |

---

## 13. Open Risks

- **Tauri menu rebuild on first template switch.** The `CheckMenuItem` set-checked API requires retaining item handles; the `HashMap<String, CheckMenuItem<R>>` pattern on app state is straightforward but new in this codebase. Plan includes a unit test verifying the menu correctly reflects `activeTemplateId` after switch.
- **Stale vault paths.** A user may move/delete a folder between sessions. The UI must surface this and offer re-pick rather than silently failing. Mitigation: `loadVaultTree` catches errors, sets `vaultError`, UI shows re-pick button.
- **Multi-root vault performance.** A vault with many roots loads N `listDirectory` calls in parallel. Acceptable for typical use (1-5 roots); if this scales poorly, defer a per-root lazy-load.
- **Window menu ↔ template gallery parity.** Both must reflect the active template consistently. `$effect` syncing both directions is the source of truth; menu rebuild on init also reflects the boot default.

---

## 14. Acceptance Criteria

1. Opening the Notes template with no prior vault state shows the empty-state UI with "Open a vault to start."
2. Clicking "Open Vault…" prompts a Tauri folder picker; selecting a folder loads its file tree into NotesSidebar2.
3. With a vault open, "Add Folder to Vault…" appends a second root; NotesSidebar2 shows two collapsible sections.
4. "Save Current as Vault…" with name "Personal" persists; reloading the app restores it on Notes reopen.
5. Saved vaults appear in the picker list; clicking "Open" on one switches `currentVaultRoots` and reloads the trees.
6. "Clear Saved Vaults" removes all saved vaults but does not affect the currently-open vault.
7. Clicking the Window menu's "Notes / Wiki" item switches `canvas.activeTemplateId` to `'notes'`; the checkmark moves to that item.
8. The checkmark tracks all template switches (Gallery, Window menu, code path), not just menu clicks.
9. Undoing a vault save removes the saved entry from the list.
10. Removing a saved vault's underlying folder shows the error banner with re-pick affordance.
