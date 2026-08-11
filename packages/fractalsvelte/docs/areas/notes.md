---
id: notes
title: Notes Area
type: area
tags: [notes, wiki, tiptap, modules]
relates_to: [ADR-006, ADR-012, ADR-013, ADR-014, ADR-015, ADR-022]
summary: Covers modules/notes/** and vault bridge touchpoints, including the TipTap editor.
updated: 2026-07-22
---

## Purpose & boundaries

The Notes area manages the Svelte-native markdown editor, notes tree, template vault, and wiki components under `src/lib/modules/notes/`. It encapsulates rich-text and raw markdown editing workflows using TipTap.

## State & persistence

- **Notes State**: Orchestrated by `state/notes.svelte.ts` tracking open files, active note tabs, and sidebar layout options.
- **Persistence**: Persisted in LocalStorage and direct file reads/writes inside user-selected workspace vault directories (ADR-013).
- **Workspace shell**: The routed Notes module renders `components/shell/NotesWorkspaceShell.svelte`, which binds the vault sidebar, file-list sidebar, editor, and AI panel to the shared `notes` workspace profile used by the header collapse controls.
- **Saved-vault recovery**: A saved vault is only a named list of folder paths. If an existing root is no longer authorized, Notes presents a native-picker grant request and retries after the user selects that root or a parent folder.

## Extension points

- **Contributions**: Command palette commands for note searching and file operations registered in `modules/notes/contributions.ts` (ADR-025).
- **Undo Domain**: Mutates vault files and text inputs within `UndoHistory.transact()` boundaries.

## Cross-area edges

- **AI Integration**: Integrates `<AIChat />` within its third sidebar panel (`sidebar3`) (ADR-024).
- **Kernel Bridge**: Relies on core filesystem IPCs via the `ideState` manager.

## Gotchas

- **Vault-root styling**: Vault root spacing is owned by the external Notes stylesheet through `.notes-vault-root`.
- **Left sidebar overflow**: `.notes-sidebar1` explicitly constrains its carrier/content to vertical scrolling so long vault trees remain usable inside the shared shell surface.
- **Folder icons**: Folder icon sizing and appearance use `.notes-folder-icon` and semantic icon tokens.
- **Editor bundling**: TipTap modules are lazily loaded to optimize initial app load time.
