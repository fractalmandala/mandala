---
id: ide
title: IDE Area
type: area
tags: [ide, editor, codemirror, modules]
relates_to: [ADR-006, ADR-010, ADR-023]
summary: Covers modules/ide/** including editor layout, terminal interface, CodeMirror setups, and file trees.
updated: 2026-07-22
---

# IDE Area

## Purpose & boundaries

The IDE area encapsulates classic code editing workspace interfaces under `src/lib/modules/ide/`, including file tree sidebar displays, integrated terminals, and the multi-tab CodeMirror editor panel.

## State & persistence

- **IDE State**: Governed by the `src/lib/state/ide.svelte.ts` kernel manager (shared with the kernel area).
- **Persistence**: Remembers active editor tabs, layout panel ratios, and last-focused files.
- **Workspace shell**: `ClassicIdeLayout.svelte` supplies its explorer, editor/terminal, and copilot surfaces to `WorkspaceShell` under the `code` profile; header controls toggle those persisted surfaces.
- **Terminal visibility**: The Code footer's Terminal button toggles `ideState.terminalCollapsed`; when docked at the bottom, the editor occupies a flexing center region and the terminal receives the persisted `ideState.terminalHeight` so expansion reserves visible space inside the workspace shell.
- **Terminal execution**: Terminal input is a native PTY stream, not a fake command prompt. `Terminal.svelte` manages multiple terminal tabs/sessions; each `TerminalInstance.svelte` hosts its own xterm renderer, sends `onData` bytes through `terminalWrite`, opens the session with `terminalOpen(rootPath, cols, rows)`, resizes via `terminalResize`, and renders raw PTY output from `terminal://event`. Browser preview explicitly refuses to fake command execution; real terminals require the Tauri app.
- **Editor overflow**: The CodeMirror host `.ide-editor` and its `.cm-scroller` explicitly use vertical scrolling so long files scroll inside the central editor area rather than clipping in the workspace shell.

## Extension points

- **File Type Icons**: Extensible file-type-to-icon styling definitions declared in `fileIcons.ts`.

## Cross-area edges

- **Layout Structure**: Renders within the classic IDE layout tiles on the main spatial canvas board.

## Gotchas

- **Layout Spacing**: Main workspace flex growth and minimum width are defined in `_layout.sass`.
- **Tab Identity**: Open-file tabs are keyed by canonical file path, preserving editor/tab DOM identity during insertion, removal, and reordering.
- **Build action**: The Run Build header action opens the terminal panel if needed and sends `pnpm build` into the active PTY-backed shell; there is no virtual `run` command.
- **Header Sidebar Icons**: The code-layout header uses `sidebarL.svelte` for the explorer surface and `sidebarR.svelte` for the copilot surface, both driven by the shared workspace profile state.
- **Interaction states (2026-07-22)**: Editor file tabs, terminal tabs, tree rows, context-menu items, and sidebar/workspace buttons share the 150ms ease hover + `--focus-ring` focus-visible convention. Terminal tab selection is surface-over-stroke (fill + label weight, quiet `--border-primary`), matching the editor tab pattern. The tree context menu layers on `--z-overlay` with a 180ms reduced-motion-aware entrance. Token gaps recorded: no dedicated log-echo token (`.log-input` uses `--theme-color-alt`); legacy `.tab-select-btn`/`.shortcut-key` classes in `_editor.sass` have no markup consumer.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`editorTheme.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/editorTheme.ts) | Dynamic CodeMirror theme bound to Fractals SASS Custom properties (Rule 1 & 2 compliant) |
| [`ClassicIdeLayout.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/components/ClassicIdeLayout.svelte) | ClassicIdeLayout.svelte |
| [`Editor.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/components/Editor.svelte) | CodeMirror 6 Core |
| [`Sidebar.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/components/Sidebar.svelte) | Derived states |
| [`Terminal.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/components/Terminal.svelte) | Terminal.svelte |
| [`TerminalInstance.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/components/TerminalInstance.svelte) | TerminalInstance.svelte |
| [`TreeNode.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/components/TreeNode.svelte) | TreeNode.svelte |
| [`fileIcons.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/fileIcons.ts) | Specific filenames that should match regardless of extension |
| [`_editor.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/styles/_editor.sass) | Editor style rules for Code Textarea, Tab Bar, and Splash Page |
| [`_marketplaces.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/styles/_marketplaces.sass) | _marketplaces.sass |
| [`_sidebar.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/styles/_sidebar.sass) | _sidebar.sass |
| [`_terminal.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/styles/_terminal.sass) | Terminal Console Panel styles |
| [`ide.spec.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/ide.spec.ts) | The app always boots into the workspace-template gallery overlay |

<!-- filetable:end -->
