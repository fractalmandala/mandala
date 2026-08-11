---
id: ADR-008
title: Workspace Serialization Format and Native Menu Bar Event Linkage
type: adr
tags: [workspace, serialization, menu]
summary: Defines the on-disk workspace serialization format and how native OS menu bar events link back into app state.
relates_to: [ADR-005]
status: accepted
updated: 2026-06-25
---


**Status:** Accepted
**Date:** 2026-06-24
**Decision makers:** Architecture Committee, Frontend Lead, Tauri Lead

---

## Context

FractalEngine Studio supports two visual layout modes: a classic three-column developer layout (with sidebars, terminal console, and document editor tabs) and a spatial canvas board (with zoomable, floating tile panels).

Developers need to save, persist, and restore their active layouts, workspaces, open files, and editor themes across sessions and distribute workspace configurations as files. The application also integrates with the native host menu bar (macOS, Windows, Linux) to trigger standard operations (Open File, Open Folder, Open Workspace, Add Folder to Workspace, Save Workspace, and Close Window) and bind system-level keyboard shortcuts (e.g. `Cmd+O`, `Cmd+Shift+O`, `Cmd+Alt+S`, `Cmd+W`).

We needed:
1. A portable, structured format for serialization of workspaces.
2. A mechanism to link native OS menus and keyboard shortcuts to the frontend Svelte state.

---

## Decision

We will standardize on a `.fractal-workspace` file format using JSON serialization, and bridge native OS menus to Svelte state via Tauri global event emissions.

### 1. Workspace Serialization Format (`.fractal-workspace`)

Workspaces are stored on disk in JSON format using a `.fractal-workspace` extension. The JSON object implements the following schema:

```json
{
  "rootPath": "string",
  "openFiles": [
    { "path": "string", "name": "string" }
  ],
  "activeFilePath": "string | null",
  "activeThemeId": "string",
  "canvas": {
    "viewport": {
      "x": "number",
      "y": "number",
      "zoom": "number"
    },
    "tiles": [
      {
        "id": "string",
        "kind": "string",
        "x": "number",
        "y": "number",
        "w": "number",
        "h": "number",
        "z": "number",
        "props": {},
        "minimized": "boolean"
      }
    ],
    "activeTemplateId": "string | null"
  }
}
```

This format stores:
- The workspace root directory (`rootPath`).
- Currently open tabs (`openFiles`) and the active document tab (`activeFilePath`).
- The chosen editor theme (`activeThemeId`).
- The spatial board viewport settings and all floating tile parameters (positions, dimensions, stack order, template options).

### 2. Native Application Menu Bridging

Tauri builds the native operating system menu in Rust (`lib.rs`) with specific item IDs and keyboard shortcut mappings:

- **Open File**: ID `open_file` (Shortcut: `CmdOrCtrl+O`)
- **Open Folder**: ID `open_folder` (Shortcut: `CmdOrCtrl+Shift+O`)
- **Open Workspace**: ID `open_workspace` (Shortcut: `CmdOrCtrl+Alt+O`)
- **Add Folder to Workspace**: ID `add_folder_to_workspace` (Shortcut: `CmdOrCtrl+Alt+A`)
- **Save Current as Workspace**: ID `save_workspace` (Shortcut: `CmdOrCtrl+Alt+S`)
- **Close Window**: Predefined native MenuItem (Shortcut: `CmdOrCtrl+W`)

When any custom menu item is triggered, the Rust event handler intercepts it and emits a global `"menu-event"` to the frontend:

```rust
app.on_menu_event(move |_window, event| {
    let id = event.id.as_ref();
    let _ = app_handle.emit("menu-event", id.to_string());
});
```

The root Svelte layout component (`+layout.svelte`) listens to this event on mount, mapping event payloads directly to Svelte state functions in `ideState`:

```typescript
listen<string>('menu-event', (event) => {
    const action = event.payload;
    if (action === 'open_file') ideState.browseAndOpenFile();
    else if (action === 'open_folder') ideState.selectAndLoadDirectory();
    else if (action === 'open_workspace') ideState.openWorkspaceFromFile();
    else if (action === 'add_folder_to_workspace') ideState.addFolderToWorkspace();
    else if (action === 'save_workspace') ideState.saveWorkspaceToFile();
    else if (action === 'close_window') ideState.closeWindow();
});
```

---

## Consequences

### Positive

- **Cross-platform Native Consistency**: The menu bar displays natively on macOS, Windows, and Linux using platform standards, while their action logic remains unified in the Svelte state layer.
- **Portability**: Workspace layouts are saved as portable text files, which can be checked into version control or shared.
- **Unified Logic**: Both the Svelte UI header buttons and native application menus trigger the same underlying handlers in `ideState`, avoiding duplicated code paths.
- **Simultaneous Layout Support**: The `.fractal-workspace` schema handles both classic sidebar/terminal layouts and infinite canvas layouts seamlessly.

### Negative

- **Tauri Dependency for Dialogs**: Native save and open file dialogs rely on the `rfd` library inside Rust. In standard browser preview mode, the app falls back to interactive browser prompts (`prompt`), which limits fidelity during browser-only debugging.
- **File System Permissions**: Saving workspaces requires Tauri filesystem write permissions, which is standard for a desktop IDE but requires correct capabilities settings in `capabilities/default.json`.

### Neutral

- Predefined native menu commands (like `Close Window` and standard window controls) are handled natively by the operating system, bypassing Svelte event listeners unless explicitly overrode.

---

## Alternatives Considered

### 1. In-App Svelte Dialogs for File Saving
Using Svelte-based dialog popups to specify save filenames instead of native OS dialogs. Rejected because native file dialogue prompts conform to operating system patterns and afford better security, directory navigation, and file system hygiene.

### 2. Standard LocalStorage-Only Persistence
Only persisting layouts to browser local storage. Rejected because developers expect to save individual workspaces as distinct files in their project directories, and share those workspace configurations with team members.

---
