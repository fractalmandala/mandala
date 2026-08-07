---
id: sp-spec-2026-06-25-notes-vault-tree-design
title: Superpowers Spec: 2026-06-25-notes-vault-tree-design
type: archive
tags: [superpowers, spec, history]
updated: 2026-07-15
---

> **Historical superpowers specification — kept as reference.**

# Notes Vault Tree Restructure — Design Spec

**Date:** 2026-06-25
**Status:** Approved
**Related:** [original vault design](file:///Users/amrit/fractals/apps/fractalengine/docs/superpowers/specs/2026-06-25-notes-vaults-design.md), [ADR-013](file:///Users/amrit/fractals/apps/fractalengine/docs/adr/ADR-013-notes-vault-persistence.md), ADR-006 (undo/redo)

## Context

The first iteration of the Notes vault rendered per-vault-root sections directly in NotesSidebar2 (each root had its own header + file list). The user has requested a more conventional Obsidian-like split:

- **Sidebar 1:** the **vault folder tree** (folders only, recursive subfolders under each vault root)
- **Sidebar 2:** the **markdown files** in the currently selected folder (flat list)

The vault picker controls (Open Vault / Add Folder / Save Current / Saved Vaults list / error banner) stay at the top of sidebar 1.

## Goals

- Folders (not files) live in the sidebar 1 tree.
- The tree is recursive — subfolders can be expanded/collapsed.
- Selecting a folder reveals its markdown files in sidebar 2 as a flat list.
- Vault roots auto-expand on open so the user immediately sees immediate subfolders.
- The folder tree uses its own expansion state, separate from the code template's `expandedFolders`.
- Clicking a markdown file in sidebar 2 opens it in the editor.
- All state is undoable (ADR-006) and persists across restarts (ADR-013).
- Use semantic CSS tokens only. No hardcoded colors or spacings.
- No new Tauri commands. Reuse existing `listDirectory`.

## Non-Goals

- File-type icons beyond the existing `getFileIcon()` (still used for markdown files in sidebar 2).
- Reordering / dragging folders or files.
- Showing non-markdown files anywhere in the Notes UI (vault is markdown-only).
- Renaming folders from the UI.
- Search within the vault (separate feature if needed).

## State Additions

All additions live in [ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts):

```ts
// Currently-selected folder (drives sidebar 2 contents).
vaultSelectedFolderPath = $state<string | null>(null);

// Folders expanded in the sidebar 1 tree. Separate from code-template's expandedFolders.
vaultExpandedFolders = $state<string[]>([]);

// Cached children of expanded folders, keyed by absolute path.
vaultExpandedFolderPaths = $state<Record<string, FileEntry[]>>({});
```

### New methods

| Method | Purpose | Calls pushUndo? |
|--------|---------|-----------------|
| `toggleVaultFolder(path)` | Toggle expand/collapse. Lazy-loads children on expand. | No (view state, not data) |
| `selectVaultFolder(path)` | Set the selected folder (drives sidebar 2). | No (view state) |
| `persistVaultTreeState()` | Write `vaultSelectedFolderPath`, `vaultExpandedFolders`, `vaultExpandedFolderPaths` to localStorage. | — |
| `restoreVaultTreeState()` | Read those fields from localStorage on startup. | — |

View-state operations (toggle, select) are **not** undoable. Only data mutations (open vault, add folder, save vault, etc.) are undoable. This matches the existing separation: `expandedFolders` for the code-template tree is also not undoable.

### Persistence schema (`ide:current-vault` payload)

```jsonc
{
  "name": "Personal",
  "roots": [
    { "path": "/Users/me/notes", "label": "notes" },
    { "path": "/Users/me/diary", "label": "diary" }
  ],
  "selectedFolderPath": "/Users/me/notes/daily",
  "expandedFolders": [
    "/Users/me/notes",
    "/Users/me/notes/daily"
  ],
  "expandedFolderPaths": {
    "/Users/me/notes": [ /* FileEntry[] of immediate children */ ],
    "/Users/me/notes/daily": [ /* FileEntry[] */ ]
  }
}
```

The `expandedFolderPaths` cache is purely for UI responsiveness after a restart — it can be safely cleared and rebuilt if the underlying folders are stale; `loadVaultTree` already handles stale-path errors via `vaultError`.

### Undo/redo (ADR-006)

`takeSnapshot` already includes `currentVaultName` and `currentVaultRoots`. Add `currentVaultSelectedFolderPath` (JSON-stringified, null-safe) to the snapshot. View state (`expandedFolders`, `expandedFolderPaths`) is excluded — restoring a snapshot to a deeply-expanded tree is more confusing than helpful.

## Components

### New: VaultTreeNode.svelte

Recursive tree-node component using **self-import** (not `<svelte:self>` — that resolves the existing deprecation warning in [TreeNode.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/TreeNode.svelte)).

```ts
interface Props {
    entries: FileEntry[];   // immediate children (already filtered to dirs)
    depth?: number;
}

let { entries, depth = 0 }: Props = $props();
```

Behavior:
- Iterate `entries`. For each:
  - Render a row with a chevron (collapsed/expanded), a folder icon, and the folder name.
  - Chevron click: `ideState.toggleVaultFolder(entry.path)` — toggles expand/collapse (lazy-loads children if needed).
  - Name click: `ideState.selectVaultFolder(entry.path)` — selects without toggling.
  - Visual indicator: `is-active` class if `entry.path === ideState.vaultSelectedFolderPath`.
  - If `entry.path` is in `vaultExpandedFolders` and `vaultExpandedFolderPaths[entry.path]` is set, render `<VaultTreeNode entries={children} depth={depth + 1} />`.
- Files are filtered out at the parent (NotesSidebar1), so this component only sees directories.

### NotesSidebar1.svelte (refactor)

Layout:
```
.sidebar-header                "Vault"
.vault-current                 (name + root count, unchanged)
.vault-actions                 (Open / Add / Save buttons, unchanged)
.vault-save-form               (inline save dialog, unchanged)
.saved-vault-list              (unchanged)
.vault-clear-btn               (unchanged)
.vault-error                   (unchanged)

.tree-container                (NEW)
  {#each roots as root}
    <VaultTreeNode entries={[root as FileEntry]} depth={0} />
  {/each}
```

The vault picker controls remain at the top, occupying their existing vertical space. The tree fills the remaining `flex: 1` region with `overflow-y: auto`.

When the user calls `openVaultFromFolder` / `addFolderToVault` / `loadSavedVault`:
- After roots are set, automatically expand each vault root and select the first leaf folder (or the root itself if no subfolders).
- This implements the "Auto-expand vault roots" requirement.

### NotesSidebar2.svelte (refactor)

Layout:
```
.notes-header-strip           (selected folder label or empty state)
.notes-files-list             (flat list of .md files)
```

Props:
```ts
interface Props {
    files: MdFile[];                  // already filtered to .md, sorted
    selectedFilePath: string;         // currently open file
    onFileSelect: (path: string) => void;
    selectedFolderLabel: string;      // for the header
}
```

Empty states:
- If `selectedFolderLabel` is empty: "Select a folder in the sidebar."
- If `files.length === 0` and folder selected: "No markdown files in this folder."

Each file row uses the same `.notes-file` styling as today (title + description), with `is-active` when its path matches `selectedFilePath`.

### NotesLayout.svelte (refactor)

- Drop the `rootFileStates` derivation that merged all roots into one map.
- Add `selectedFolderFiles: MdFile[] = $derived(...)` — filters `currentVaultTrees[vaultSelectedFolderPath]` to `.md` files only, sorts alphabetically.
- Drop `listDirectory` import (still used elsewhere but no longer here).
- Render `<NotesSidebar1 />` without props (it binds to ideState directly).
- Render `<NotesSidebar2 {files} {selectedFilePath} {onFileSelect} {selectedFolderLabel} />`.

### Auto-select helper

Add `autoSelectFirstLeafFolder(roots: VaultRoot[])` to ideState:
1. For each root, expand it (load children).
2. If children are directories, drill down recursively until a leaf (no subdirs) is found; select that leaf.
3. If a root has no children, select the root itself.
4. Called from `openVaultFromFolder`, `addFolderToVault` (when adding the first root), and `loadSavedVault`.

## CSS

All new styles live in [_notes.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_notes.sass). Semantic tokens only. New classes:

| Class | Purpose |
|-------|---------|
| `.vault-tree-container` | Scroll container for the tree, `flex: 1`, `overflow-y: auto`, `padding: 4px 0` |
| `.vault-tree-row` | One row in the tree (folder name + chevron) |
| `.vault-tree-folder-btn` | Click target for the folder row |
| `.vault-tree-chevron` | Expand/collapse indicator |
| `.vault-tree-folder-icon` | Folder icon |
| `.vault-tree-folder-name` | Folder name label |
| `.vault-tree-folder.is-active` | Selected folder highlight |
| `.vault-tree-loading` | "Loading..." placeholder for lazy-loading children |
| `.vault-tree-empty` | "No vault open" state in the tree area |

Removed (no longer needed):
- `.vault-files` (replaced by tree container)
- `.vault-root-section` (replaced by per-root tree)
- `.notes-empty-inline` (moved to sidebar2)

The registry entry for [`.notes-sidebar1`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_notes.sass#L41) gets `flex: 1` so the tree fills remaining space below the picker controls.

## Acceptance Criteria

1. Opening a vault shows its roots in sidebar 1, auto-expanded, with the first leaf folder selected.
2. Sidebar 2 shows markdown files for the selected folder as a flat list.
3. Clicking a folder in sidebar 1 highlights it AND updates sidebar 2.
4. Clicking a chevron toggles expand/collapse without changing sidebar 2 selection.
5. Selecting a folder is NOT undoable (view state). Opening/closing vaults remains undoable.
6. After app restart, the same vault, selected folder, and expanded folders are restored.
7. Tree state for the vault is fully separate from the code template's file-tree state.
8. `pnpm check` and `cargo check` both pass with 0 errors.
9. No new Tauri commands or capabilities added.
10. AGENTS.md rules honoured: runes only, semantic tokens, single IPC gateway, undo/redo boundary.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Expanded folder cache becomes stale after restart | `restoreVaultTreeState` runs before any expand; if a folder fails to load, drop it from `expandedFolders` and surface `vaultError` (already implemented). |
| Auto-select logic recurses infinitely on circular symlinks | Track visited paths in `autoSelectFirstLeafFolder`; bail at depth 8 (sanity). |
| Tree state for vault conflicts with code-template tree | Use separate state field names (`vaultExpandedFolders` vs `expandedFolders`); verified not shared. |
| Sidebar 2 ends up empty for many common selections | Empty state copy clearly tells user to select a folder. |

## Files Touched

| File | Change |
|------|--------|
| `src/lib/components/VaultTreeNode.svelte` | **NEW** — recursive folder-only tree node |
| `src/lib/components/NotesSidebar1.svelte` | Refactor — vault picker at top, tree below |
| `src/lib/components/NotesSidebar2.svelte` | Refactor — flat markdown file list |
| `src/lib/components/NotesLayout.svelte` | Refactor — replace `rootFileStates` with `selectedFolderFiles` |
| `src/lib/state/ide.svelte.ts` | Add vault tree state + methods + snapshot field |
| `src/lib/styles/components/_notes.sass` | Add tree styles, remove old `.vault-files`/`.vault-root-section` |
| `docs/design/07-class-registry.md` | Register new tree classes |
| `docs/superpowers/specs/2026-06-25-notes-vaults-design.md` | Note the Phase 6 restructure link |
| `docs/routing/src--lib--components--VaultTreeNode.svelte.md` | **NEW** — generated by `app-documenter` |
| `docs/routing/src--lib--components--NotesSidebar1.svelte.md` | Updated by `app-documenter` |
| `docs/routing/src--lib--components--NotesSidebar2.svelte.md` | Updated by `app-documenter` |
| `docs/routing/src--lib--components--NotesLayout.svelte.md` | Updated by `app-documenter` |
| `AGENTS.md` | Update Routing Docs Registry table (add VaultTreeNode row, refresh line numbers) |

## ADR Note

ADR-013 (Notes Vault Persistence) is **not superseded** by this restructure. The persistence schema gains new fields but the decision boundaries (Notes-only, localStorage, undoable data, single IPC gateway) all hold. A short addendum will be appended to ADR-013 documenting the schema change.