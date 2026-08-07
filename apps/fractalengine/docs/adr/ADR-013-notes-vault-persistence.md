---
id: ADR-013
title: Notes-Template Vault Persistence
type: adr
tags: [notes, persistence, localstorage, undo-redo]
summary: "Persists notes vaults via localStorage (ide:current-vault, ide:saved-vaults) with multi-root support and full undo/redo."
relates_to: [ADR-006, ADR-012]
status: accepted
updated: 2026-06-25
---

# ADR-013 — Notes-Template Vault Persistence

**Status:** Accepted
**Date:** 2026-06-25
**Deciders:** brainstorm session
**Related:** [spec](file:///Users/amrit/fractals/apps/fractalengine/docs/superpowers/specs/2026-06-25-notes-vaults-design.md), ADR-008 (workspace serialization)

## Context

The Notes template needs a way for users to select a folder on their local drive and read/write markdown files from it. Users want to:

- Open any local folder as a vault
- Add additional folders as **second vault roots** to the same vault (multi-root vaults)
- Save the current vault (name + all roots) to a persistent list of named vaults
- Reload saved vaults later
- Have the active vault selection persist across app restarts

The existing **workspace** concept (code template, `.fractal-workspace` files, `ide:workspaces` localStorage key) is a different system with different scope and is left untouched.

## Decision

Vaults are a **Notes-template-only** concept that lives in [ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts) as `currentVaultName`, `currentVaultRoots`, `currentVaultTrees`, `savedVaults`, and `vaultError` `$state` fields.

### Storage

- **Active vault** — persisted under `ide:current-vault` (JSON `{ name, roots: VaultRoot[] }`) in `localStorage`. Restored on app startup. Empty roots remove the key.
- **Saved vaults list** — persisted under `ide:saved-vaults` (JSON `SavedVault[]`) in `localStorage`. Restored on app startup.
- **Folder contents** — *not* persisted. Read on demand via `listDirectory` from `ideState.currentVaultTrees`. Stale paths surface `vaultError` with re-pick affordance.

### Scope Boundary

Vaults only exist for the Notes template. The code template continues to use `rootPath` and the existing `workspace` machinery. Browser mode is **not** supported (Tauri folder picker required); attempting vault operations outside Tauri surfaces a "Desktop only" notice via `ideState.addLog`.

### Undo / Redo

Every vault mutation (open, add, save, load, delete, clear) calls `pushUndo()` before mutation. Restoration via `restoreSnapshot` covers `currentVaultName`, `currentVaultRoots`, and `savedVaults` via `takeSnapshot` round-trip (see ADR-006).

### IPC

Vault operations reuse the existing single-gateway pattern (ADR-004, [ipc.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts)). Folder picker reuses `selectDownloadDirectory`. Directory listing reuses `listDirectory`. File read/write reuse `readFile` / `writeFile`. **No new Tauri commands are added by this ADR** (the `set_active_template_menu` command for Window menu checkmark sync is separate and tracked under the menu-reorganization work).

### Vault Roots

A vault can have **1..N roots** — additional folders are added via "Add Folder to Vault…", which appends to `currentVaultRoots`. Each root gets its own label (defaults to folder basename) and its own cached `FileEntry[]` tree in `currentVaultTrees`.

## Consequences

### Positive

- Users can organize markdown across multiple folders under one named vault.
- Active vault auto-restores across restarts (no re-pick).
- Saved vaults are immediately reusable; multiple named vaults allow workspace separation (Personal / Work / Archive).
- Undoable via the existing `Cmd+Z` / `Cmd+Shift+Z` machinery; no separate undo system.
- Single-gateway IPC preserved — no new Tauri commands or capability entries needed.

### Negative

- **Browser-mode unsupported** — the vault UI is visible in browser mode but folder picker is a no-op. Acceptable per the design spec.
- **No cross-machine sync** — localStorage is per-machine. A user on two machines must re-save their saved vaults on each.
- **Stale path detection is lazy** — a vault root that becomes inaccessible between sessions is only detected when `loadVaultTree` is called. Mitigation: error banner with re-pick affordance.

### Neutral

- Vault state is in-memory only during the session; localStorage is the persistence layer.
- `pendingVaultSavePrompt` is a transient UI flag, not persisted or undoable.

## Alternatives Considered

- **Full state snapshots** (folder + open files + sidebar widths + recent files) — rejected: too heavy for the Notes use case; Obsidian-style simple folder reference is sufficient.
- **Single remembered folder, no named vaults** — rejected: the user explicitly requested named vaults with multi-root support.
- **Tauri app-data persistence instead of localStorage** — rejected: localStorage works fine for app state; no need for an additional plugin.
- **Replace existing workspace with vault globally** — rejected: vault is a Notes-specific concept with different scope. Workspace stays for the code template.

## Addendum (2026-06-25) — Vault Tree Restructure

The first iteration placed per-vault-root file lists directly in NotesSidebar2. After user review, the layout was restructured to an Obsidian-style split:

- **NotesSidebar1:** the **vault folder tree** — folders only, recursive subfolders under each vault root, lazy-loaded on expand.
- **NotesSidebar2:** the **markdown files** for the currently selected folder, as a flat list.

### Schema additions

The `ide:current-vault` payload gains three view-state fields:

```jsonc
{
  "name": "Personal",
  "roots": [ /* VaultRoot[] */ ],
  "selectedFolderPath": "/Users/me/notes/daily",
  "expandedFolders": [ /* string[] */ ],
  "expandedFolderPaths": { /* string → FileEntry[] (lazy cache) */ }
}
```

A new key `ide:vault-tree-state` (separate from `ide:current-vault`) caches view-state on its own so a future vault-open can restore the user's last folder selection even if no vault is currently active.

### Decision boundaries (unchanged)

- localStorage remains the persistence backend. No new Tauri commands.
- View-state mutations (folder selection, expand/collapse) are **not** undoable, matching the existing separation in ADR-006. Only data mutations (open/add/save vault) call `pushUndo()`.
- Tree view-state for the vault is fully separate from the code-template's `expandedFolders` field — they live under different names (`vaultExpandedFolders` vs `expandedFolders`) and never share keys.
- Stale-path handling: `restoreCurrentVault` validates each restored folder's existence against the loaded tree, drops missing entries, and clears the persisted selection if it pointed at a missing folder.

### Components

- **New:** `src/lib/components/VaultTreeNode.svelte` — recursive folder-only tree node (self-import, replaces `<svelte:self>`).
- **Refactored:** `NotesSidebar1.svelte` (vault picker at top, tree below), `NotesSidebar2.svelte` (flat file list), `NotesLayout.svelte` (drop `rootFileStates`, derive `selectedFolderFiles`).

Full design spec: [2026-06-25-notes-vault-tree-design.md](../superpowers/specs/2026-06-25-notes-vault-tree-design.md).
