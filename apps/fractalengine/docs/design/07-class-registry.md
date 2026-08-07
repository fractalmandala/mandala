---
id: 07-class-registry
title: Master Class Registry
type: design
tags: [css-classes, registry, documentation]
summary: Master registry of every UI class in the project — where each is defined and where it's used.
relates_to: [05-utility-primitives, 11-style-aggregation, fractaldocs]
updated: 2026-07-22
---

# Class Registry — Full Cross-Reference

A comprehensive mapping of every CSS class: which Svelte component uses it, which `.sass` file defines it, and which tokens it depends on.

---

## Canvas

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.board-region` | `Canvas.svelte` | `_canvas.sass` L4 | `$canvas-bg`, `$canvas-grid-dot` |
| `.canvas-viewport` | `Canvas.svelte` | `_canvas.sass` L17 | — |
| `.canvas-focus-overlay` | `Canvas.svelte` | `_canvas.sass` L22 | — |
| `.grab` / `.grabbing` | `Canvas.svelte` | `_canvas.sass` L12/L15 | — |

## Tile

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.tile` | `Tile.svelte` | `_tile.sass` L4 | `$tile-bg`, `$tile-border`, `$tile-radius`, `$tile-shadow` |
| `.tile.active` | `Tile.svelte` | `_tile.sass` L13 | `$tile-border-active` |
| `.tile-head` | `Tile.svelte` | `_tile.sass` L16 | `$tile-head-h`, `$tile-border`, `--background30` |
| `.tile-title` | `Tile.svelte` | `_tile.sass` L21 | `--text-primary` |
| `.tile-dot` | `Tile.svelte` | `_tile.sass` L24 | Module color vars |
| `.tile-actions` | `Tile.svelte` | `_tile.sass` L42 | — |
| `.tile-action-btn` | `Tile.svelte` | `_tile.sass` L44 | `--text-tertiary`, `--text-primary`, `--background40` |
| `.tile-body` | `Tile.svelte` | `_tile.sass` L52 | `--background10` |
| `.tile-resize` | `Tile.svelte` | `_tile.sass` L56 | — |

## Editor

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.editor-container` | `Editor.svelte` | `_editor.sass` L4 | `--background10` |
| `.editor-tabbar` | `Editor.svelte` | `_editor.sass` L14 | `--background30`, `--border-primary` |
| `.editor-tab` | `Editor.svelte` | `_editor.sass` L25 | `--background30`, `--border-primary` |
| `.editor-tab.is-active` | `Editor.svelte` | `_editor.sass` L28 | `--background10` |
| `.editor-file-tab` | `Editor.svelte` | `_editor.sass` L30 | `--background30` (hover), `--background40` (active fill) |
| `.tab-select-btn` | `Editor.svelte` | `_editor.sass` L43 | `--text-secondary`, `--text-primary` |
| `.unsaved-dot` | `Editor.svelte` | `_editor.sass` L45 | `--feedback-error` |
| `.tab-close-btn` | `Editor.svelte` | `_editor.sass` L50 | `--text-tertiary`, `--text-primary`, `--background40` |
| `.editor-workspace` | `Editor.svelte` | `_editor.sass` L57 | — |
| `.editor-splash` | `Editor.svelte` | `_editor.sass` L90 | `--background10` |
| `.splash-shortcuts` | `Editor.svelte` | `_editor.sass` L99 | `--background20`, `--border-primary`; shared welcome-action card for Open File, Open Folder, and Open Workspace |
| `.shortcut-key` | `Editor.svelte` | `_editor.sass` L108 | `--background40`, `--border-tertiary`, `--theme-color` |

## Sidebar

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.sidebar-panel` | `Sidebar.svelte` | `_sidebar.sass` L4 | `--background20` |
| `.sidebar-header` | `Sidebar.svelte` | `_sidebar.sass` L10 | `--border-primary` |
| `.sidebar-title` | `Sidebar.svelte` | `_sidebar.sass` L16 | `--text-secondary` |
| `.sidebar-content` | `Sidebar.svelte` | `_sidebar.sass` L20 | — |
| `.file-row-btn` | `Sidebar.svelte` | `_sidebar.sass` L44 | `--text-secondary`, `--background40`, `--text-primary` |
| `.file-row-btn.is-active` | `Sidebar.svelte` | `_sidebar.sass` L53 | `--theme-color` |
| `.nav-back-btn` | `Sidebar.svelte` | `_sidebar.sass` L110 | `--background20`, `--background50`, `--border-primary`, `--text-secondary`, `--focus-ring` |
| `.inspector-section` | `Sidebar.svelte` | `_sidebar.sass` L75 | — |
| `.info-grid` | `Sidebar.svelte` | `_sidebar.sass` L84 | `--background30`, `--border-primary` |
| `.workspace-list-container` | `Sidebar.svelte` | `_sidebar.sass` L123 | `--background30`, `--border-primary` |
| `.workspace-select-btn` | `Sidebar.svelte` | `_sidebar.sass` L186 | `--text-secondary`, `--text-primary`, `--focus-ring` |
| `.ctx-backdrop` / `.ctx-menu` | `TreeNode.svelte` | `_sidebar.sass` L282/L292 | `--z-overlay`, `--background30`, `--border-primary`, 180ms ease-out entrance (reduced-motion aware) |
| `.ctx-item` | `TreeNode.svelte` | `_sidebar.sass` L316 | `--text-sm`, `--text-primary`, `--background50`, `--focus-ring` |
| `.resize-handle-v.handle-sidebar-left` | `ClassicIdeLayout.svelte` | `_sidebar.sass` L247 | `--border-primary`, `--theme-color` |
| `.resize-handle-v.handle-sidebar-right` | `ClassicIdeLayout.svelte` | `_sidebar.sass` L247 | `--border-primary`, `--theme-color` |

## Terminal

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.terminal-panel` | `Terminal.svelte` | `_terminal.sass` L4 | `--background20` |
| `.terminal-tabs-bar` | `Terminal.svelte` | `_terminal.sass` L11 | `--background30`, `--border-primary` |
| `.terminal-tabs` | `Terminal.svelte` | `_terminal.sass` L22 | spacing tokens |
| `.terminal-tab` | `Terminal.svelte` | `_terminal.sass` L30 | `--border-primary`, `--background20`, `--background30` (hover), `--background10` (active fill — surface over stroke) |
| `.terminal-tab-label` | `Terminal.svelte` | `_terminal.sass` L50 | `--text-primary`, `--text-xs`, `--focus-ring` |
| `.terminal-tab-status` | `Terminal.svelte` | `_terminal.sass` L63 | `--text-tertiary`, `--theme-color`, `--control-radius-round` |
| `.terminal-tab-muted` | `Terminal.svelte` | `_terminal.sass` L73 | `--text-tertiary`, `--text-xs` |
| `.terminal-tab-close` | `Terminal.svelte` | `_terminal.sass` L77 | `--text-tertiary`, `--border-primary`, `--background40`, `--focus-ring` |
| `.terminal-body` | `Terminal.svelte` | `_terminal.sass` L103 | `--background10` |
| `.terminal-empty` | `Terminal.svelte` | `_terminal.sass` L112 | `--text-tertiary`, `--font-monospace` |
| `.terminal-instance-shell` | `Terminal.svelte` | `_terminal.sass` L120 | — |
| `.terminal-pty-surface` | `TerminalInstance.svelte` | `_terminal.sass` L129 | `--text-primary`, `--font-monospace`, `--focus-ring` |
| `.terminal-placeholder` | `Terminal.svelte` | `_terminal.sass` L155 | `--text-tertiary`, `--font-monospace` |
| `.terminal-placeholder-inline` | `Terminal.svelte` | `_terminal.sass` L163 | `--text-tertiary`, `--font-monospace` |
| `.logs-wrapper` | Legacy terminal log fallback styles | `_terminal.sass` L168 | — |
| `.log-info` | Legacy terminal log fallback styles | `_terminal.sass` L225 | `--text-secondary` |
| `.log-success` | Legacy terminal log fallback styles | `_terminal.sass` L228 | `--color20` |
| `.log-error` | Legacy terminal log fallback styles | `_terminal.sass` L231 | `--feedback-error` |
| `.log-input` | Legacy terminal log fallback styles | `_terminal.sass` L234 | `--theme-color-alt` (was hardcoded `#45a01e`; no dedicated log-echo token exists — recorded gap) |
| `.prompt-row` | Legacy terminal prompt fallback styles | `_terminal.sass` L210 | `--border-secondary` |

## Tile Dock

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.tile-dock` | `TileDock.svelte` | `_dock.sass` L4 | `--background30`, `--border-primary`, `$z-dock`, `$dock-shadow` |
| `.dock-btn` | `TileDock.svelte` | `_dock.sass` L16 | `--text-secondary`, `--text-primary`, `--background40` |
| `.dock-btn.is-active` | `TileDock.svelte` | `_dock.sass` L24 | `--theme-color` |
| `.dock-menu` | `TileDock.svelte` | `_dock.sass` L50 | `--background20`, `--border-primary`, `$z-overlay`, `$dock-menu-shadow` |
| `.dock-menu-item` | `TileDock.svelte` | `_dock.sass` L64 | `--text-secondary`, `--text-primary`, `--background40` |

## Minimap

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.minimap` | `Minimap.svelte` | `_minimap.sass` L4 | `--background30`, `--border-primary`, `$z-minimap`, `$dock-shadow` |
| `.minimap-tile` | `Minimap.svelte` | `_minimap.sass` L15 | `$minimap-border`, module color vars |
| `.minimap-viewport` | `Minimap.svelte` | `_minimap.sass` L42 | `--theme-color`, `$minimap-viewport-bg`, `$minimap-viewport-shadow` |

## AI Chat

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.sidebar-tab-item` | `AIChat.svelte`, `DesignLayout.svelte`, `AiSidebar.svelte` | `_commons.sass` | `--state-hover`, `--background40`, `--control-target-min`, `--transition-control` |
| `.sidebar-tab-item.active` | (same) | `_commons.sass` | `--background40`, `--text-primary` |
| `.sidebar-tab-item-text` | (same) | `_commons.sass` | `--text-sm`, `--text-tertiary`, `--text-primary` |
| `.ai-chat-container` | `AIChat.svelte` | `_ai.sass` L38 | `--background20` |
| `.ai-messages-thread` | `AIChat.svelte` | `_ai.sass` L42 | — |
| `.ai-message-row.role-user` | `AIChat.svelte` | `_ai.sass` L57 | `--background50`, `--border-tertiary` |
| `.ai-message-row.role-assistant` | `AIChat.svelte` | `_ai.sass` L66 | `--background30`, `--border-primary` |
| `.message-bubble` | `AIChat.svelte` | `_ai.sass` L82 | — |
| `.reasoning-block` | `AIChat.svelte` | `_ai.sass` L91 | `--border-secondary`, `--background10` |
| `.reasoning-header` | `AIChat.svelte` | `_ai.sass` L96 | `--color30`, `--background30` |
| `.prompt-textarea-wrapper` | `AIChat.svelte` | `_ai.sass` L121 | `--background10`, `--border-tertiary`, `--theme-color` |
| `.send-prompt-btn` | `AIChat.svelte` | `_ai.sass` L142 | `--theme-color` |

## FractalDocs

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.fractaldocs-layout` | `DocsLayout.svelte` | `modules/fractaldocs/styles/_layout.sass` | `--background10`, `--text-primary` |
| `.fractaldocs-resizer` | `DocsLayout.svelte` | `modules/fractaldocs/styles/_layout.sass` | `--resize-hit-target`, `--docs-resizer-visual-width`, `--focus-ring` |
| `.fractaldocs-tree-folder-btn`, `.fractaldocs-tree-file` | `DocsSidebarLeft.svelte` | `modules/fractaldocs/styles/_layout.sass` | `--control-target-min`, `--state-hover`, `--focus-ring` |
| `.fractaldocs-markdown-body` | `DocsContent.svelte` | `modules/fractaldocs/styles/_layout.sass` | `--docs-text-line-height`, `--text-*`, `--sz-*` |
| `.fractaldocs-toc-link` | `DocsSidebarRight.svelte` | `modules/fractaldocs/styles/_layout.sass` | `--text-secondary`, `--state-hover`, `--focus-ring` |

## Browser & Vault

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.browser-panel` | `Browser.svelte` | `_browser.sass` L11 | `--background10` |
| `.browser-header` | `Browser.svelte` | `_browser.sass` L17 | `--background30`, `--border-primary` |
| `.browser-nav-btn` | `Browser.svelte` | `_browser.sass` L23 | `--text-secondary`, `--background40` |
| `.browser-address-container` | `Browser.svelte` | `_browser.sass` L36 | `--background10`, `--border-secondary`, `--theme-color` |
| `.browser-vault-trigger` | `Browser.svelte` | `_browser.sass` L52 | `--text-secondary`, `--background40`, `--theme-color` |
| `.vault-popover` | `Browser.svelte` | `_browser.sass` L74 | `--background20`, `--border-primary` |
| `.vault-tab` | `Browser.svelte` | `_browser.sass` L86 | `--text-secondary`, `--theme-color` |
| `.vault-tab.is-active` | `Browser.svelte` | `_browser.sass` L92 | `--theme-color` |
| `.login-row` | `Browser.svelte` | `_browser.sass` L108 | `--background10`, `--border-secondary` |
| `.vault-row-btn` | `Browser.svelte` | `_browser.sass` L113 | `--background40`, `--border-primary` |
| `.vault-row-btn.edit-action` | `Browser.svelte` | `_browser.sass` L120 | `--theme-color` |
| `.vault-row-btn.delete-action` | `Browser.svelte` | `_browser.sass` L123 | `#ef4444` |
| `.totp-indicator-row` | `Browser.svelte` | `_browser.sass` L220 | `--theme-color-alt` |
| `.browser-standalone-view` | `browser/+page.svelte` | `_browser.sass` L257 | `--background10` |

## Settings

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.settings-overlay` | `SettingsDialog.svelte` | `_settings.sass` L4 | `--overlay-bg` |
| `.settings-dialog` | `SettingsDialog.svelte` | `_settings.sass` L14 | `--background10`, `--border-primary` |
| `.settings-sidebar` | `SettingsDialog.svelte` | `_settings.sass` L30 | `--background20`, `--border-secondary` |
| `.settings-tab-btn.is-active` | `SettingsDialog.svelte` | `_settings.sass` L46 | `--background40`, `--text-primary`, `--theme-color` |
| `.btn-primary` | `SettingsDialog.svelte` | `_settings.sass` L85 | `--theme-color` |
| `.btn-secondary` | `SettingsDialog.svelte` | `_settings.sass` L92 | `--border-primary`, `--background30` |
| `.btn-danger` | `SettingsDialog.svelte` | `_settings.sass` L100 | `--feedback-error` |

## Command Palette

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.command-palette-overlay` | `CommandPalette.svelte` | `_commandpalette.sass` L4 | `$overlay-bg` |
| `.command-palette-card` | `CommandPalette.svelte` | `_commandpalette.sass` L14 | `--background10`, `--border-primary`, `$shadow-stronger` |
| `.command-palette-input` | `CommandPalette.svelte` | `_commandpalette.sass` L34 | `--text-primary`, `--text-tertiary` |
| `.command-palette-item.is-active` | `CommandPalette.svelte` | `_commandpalette.sass` L56 | `--background40`, `--theme-color` |
| `.command-palette-shortcut` | `CommandPalette.svelte` | `_commandpalette.sass` L71 | `--text-tertiary`, `--border-primary` |

## Template Gallery

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.gallery-overlay` | `+page.svelte` | `_templategallery.sass` L5 | `$overlay-bg-dark`, `$z-overlay` |
| `.template-gallery` | `TemplateGallery.svelte` | `_templategallery.sass` L13 | `--background20`, `--border-primary` |
| `.gallery-card` | `TemplateGallery.svelte` | `_templategallery.sass` L47 | `--background10`, `--border-secondary`, `$gallery-card-hover-bg` |
| `.gallery-card.is-disabled` | `TemplateGallery.svelte` | `_templategallery.sass` L57 | — |
| `.gallery-save-btn` | `TemplateGallery.svelte` | `_templategallery.sass` L115 | `--theme-color`, `$white-text` |

## Notes & Wiki

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.notes-wrapper` | `NotesLayout.svelte` | `_notes.sass` L4 | `--background10` |
| `.notes-sidebar1` | `NotesSidebar1.svelte` | `_notes.sass` L40 | `--background20` |
| `.sidebar-header` | `NotesSidebar1.svelte` | `_notes.sass` L48 | `--text-tertiary`, `--border-primary` |
| `.notes-sidebar2` | `NotesSidebar2.svelte` | `_notes.sass` L96 | `--background10` |
| `.notes-header-strip` | `NotesSidebar2.svelte`, `NotesEditor.svelte` | `_notes.sass` L104 | `--text-tertiary`, `--border-primary` |
| `.notes-files-list` | `NotesSidebar2.svelte` | `_notes.sass` L120 | — |
| `.notes-file` | `NotesSidebar2.svelte` | `_notes.sass` L126 | `--background40`, `--background50`, `--theme-color` |
| `.file-title` | `NotesSidebar2.svelte` | `_notes.sass` L142 | `--text-primary` |
| `.file-desc` | `NotesSidebar2.svelte` | `_notes.sass` L148 | `--text-tertiary` |
| `.notes-empty` | `NotesSidebar2.svelte` | `_notes.sass` L154 | `--text-tertiary` |
| `.notes-editor` | `NotesEditor.svelte` | `_notes.sass` L162 | `--background10` |
| `.view-toggle-btn` | `NotesEditor.svelte` | `_notes.sass` L192 | `--text-tertiary`, `--border-primary`, `--background40`, `--background50`, `--theme-color` |
| `.notes-editor-inside` | `NotesEditor.svelte` | `_notes.sass` L223 | — (consumes `--split-ratio` set inline; flex row container) |
| `.editor-left` | `NotesEditor.svelte` | `_notes.sass` L233 | `--border-primary` (flex: 0 0 var(--split-ratio, 50%); raw pane) |
| `.editor-left.hidden` | `NotesEditor.svelte` | `_notes.sass` L240 (nested) | — (display: none, hides raw pane in 'rich' view) |
| `.raw-textarea` | `NotesEditor.svelte` | `_notes.sass` L243 | `--text-primary`, `--background10`, `--text-tertiary` |
| `.editor-right` | `NotesEditor.svelte` | `_notes.sass` L261 | — (flex: 1 1 0; rich pane takes remaining space) |
| `.editor-right.hidden` | `NotesEditor.svelte` | `_notes.sass` L268 (nested) | — (display: none, hides rich pane in 'raw' view) |
| `.editor-split-handle` | `NotesEditor.svelte` | `_notes.sass` L26 | `--border-primary`, `--theme-color` (6px column-resize handle between raw and rich panes; hover/active uses `--theme-color`) |
| `.rich-editor .ProseMirror` | `NotesEditor.svelte` | `_notes.sass` L276 | `--text-primary` |
| `.tiptap-toolbar` | `NotesEditor.svelte` | `_notes.sass` L449 | `--background20`, `--border-primary` |
| `.toolbar-group` | `NotesEditor.svelte` | `_notes.sass` L455 | — (visual grouping of toolbar buttons with separator) |
| `.toolbar-btn` | `NotesEditor.svelte` | `_notes.sass` L464 | `--text-secondary`, `--background40`, `--text-primary`, `--background50`, `--theme-color` |
| `.slash-menu` | `NotesEditor.svelte` | `_notes.sass` L503 | `--background30`, `--border-primary`, `--shadow-strong` |
| `.slash-item` | `NotesEditor.svelte` | `_notes.sass` L515 | `--text-secondary`, `--background50`, `--text-primary` |
| `.notes-sidebar3` | `NotesLayout.svelte` | `_notes.sass` L548 | `--background20` |
| `.sidebar3-tab` | `NotesLayout.svelte` | `_notes.sass` L561 | `--text-tertiary`, `--text-secondary`, `--theme-color` |
| `.notes-empty-editor` | `NotesEditor.svelte` | `_notes.sass` L592 | `--text-tertiary` |

### Notes Vault Picker (NotesSidebar1)

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.vault-picker` | `NotesSidebar1.svelte` | `_notes.sass` L611 | — |
| `.vault-current` | `NotesSidebar1.svelte` | `_notes.sass` L616 | `--border-primary` |
| `.vault-current-empty` | `NotesSidebar1.svelte` | `_notes.sass` L625 | `--text-tertiary` |
| `.vault-current-name` | `NotesSidebar1.svelte` | `_notes.sass` L629 | `--text-primary` |
| `.vault-roots-count` | `NotesSidebar1.svelte` | `_notes.sass` L637 | `--text-tertiary` |
| `.vault-actions` | `NotesSidebar1.svelte` | `_notes.sass` L641 | `--border-primary` |
| `.vault-action-btn` | `NotesSidebar1.svelte` | `_notes.sass` L647 | `--text-secondary`, `--border-secondary`, `--background40`, `--text-primary`, `--theme-color` |
| `.vault-action-btn-secondary` | `NotesSidebar1.svelte` | `_notes.sass` L663 | `--text-tertiary`, `--background30`, `--text-secondary` |
| `.vault-save-form` | `NotesSidebar1.svelte` | `_notes.sass` L675 | `--background30`, `--border-primary` |
| `.vault-save-label` | `NotesSidebar1.svelte` | `_notes.sass` L684 | `--text-tertiary` |
| `.vault-save-input` | `NotesSidebar1.svelte` | `_notes.sass` L689 | `--background10`, `--text-primary`, `--border-secondary`, `--theme-color` |
| `.vault-save-actions` | `NotesSidebar1.svelte` | `_notes.sass` L701 | — |
| `.sidebar-subheader` | `NotesSidebar1.svelte` | `_notes.sass` L707 | `--text-tertiary` |
| `.saved-vault-list` | `NotesSidebar1.svelte` | `_notes.sass` L715 | — |
| `.saved-vault-item` | `NotesSidebar1.svelte` | `_notes.sass` L725 | — |
| `.saved-vault-item-name` | `NotesSidebar1.svelte` | `_notes.sass` L728 | `--text-secondary`, `--background40`, `--text-primary` |
| `.saved-vault-item-delete` | `NotesSidebar1.svelte` | `_notes.sass` L745 | `--text-tertiary`, `--background40`, `--theme-color` |
| `.saved-vault-empty` | `NotesSidebar1.svelte` | `_notes.sass` L759 | `--text-tertiary` |
| `.vault-clear-btn` | `NotesSidebar1.svelte` | `_notes.sass` L763 | `--text-tertiary`, `--border-secondary`, `--background40`, `--text-primary` |
| `.vault-error` | `NotesSidebar1.svelte` | `_notes.sass` L774 | `--theme-color`, `--background30` |

### Notes Vault Folder Tree (NotesSidebar1 — VaultTreeNode)

| Class | Used In | Defined In | Token Dependencies |
|-------|---------|------------|-------------------|
| `.vault-tree-container` | `NotesSidebar1.svelte` | `_notes.sass` L801 | — |
| `.vault-tree-row` | `VaultTreeNode.svelte`, `NotesSidebar1.svelte` | `_notes.sass` L806 | — |
| `.vault-tree-chevron` | `VaultTreeNode.svelte` | `_notes.sass` L815 | `--background40` |
| `.vault-tree-folder-btn` | `VaultTreeNode.svelte` | `_notes.sass` L832 | `--text-secondary`, `--background40`, `--text-primary`, `--background50`, `--theme-color` |
| `.vault-tree-folder-icon` | `VaultTreeNode.svelte` | `_notes.sass` (nested) | — |
| `.vault-tree-folder-name` | `VaultTreeNode.svelte`, `NotesSidebar1.svelte` | `_notes.sass` L867 | — |
| `.vault-tree-loading` | `VaultTreeNode.svelte`, `NotesSidebar1.svelte` | `_notes.sass` (nested) | `--text-tertiary` |
| `.vault-tree-empty` | `NotesSidebar1.svelte` | `_notes.sass` L874 | `--text-tertiary` |

## Shared Utilities

| Class | Defined In | Effect |
|-------|------------|--------|
| `.truncate` | `_globals.sass` L36 | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `button.blank` | `_globals.sass` L19 | Resets button styles |
| `.cursor-grab` | `_terminal.sass` L18 | `cursor: grab` |

---

## Changelog — Recent Class-Level Changes

### 2026-06-25 — NotesEditor split-pane refactor

Replaced the broken `grid-template-columns: 1fr 1fr` (silently ignored when combined with `display: flex`) with a flex-basis split driven by `--split-ratio`. The three pane classes now read:

| Class | Old rule | New rule | Reason |
|-------|----------|----------|--------|
| `.notes-editor-inside` | `display: grid; grid-template-columns: 1fr 1fr` | `display: flex; flex-direction: row` | `grid-template-columns` was ignored under flex |
| `.editor-left` | `width: 100%` | `flex: 0 0 var(--split-ratio, 50%); min-width: 0` | flex-basis driven by `--split-ratio` set inline per view mode |
| `.editor-right` | `width: 100%` | `flex: 1 1 0; min-width: 0` | takes remaining space after `.editor-left` |

The `.editor-right` class is now explicitly registered (was previously undefined). The `.editor-left.hidden` / `.editor-right.hidden` `display: none` rules are unchanged but now apply under flex instead of grid.

`--split-ratio` is set inline on `.notes-editor-inside` to one of:

- `100%` (view mode `'raw'` — raw pane takes full width)
- `0%` (view mode `'rich'` — raw pane collapses via `flex: 0 0 0%`, rich pane fills)
- `localSplitRatio + '%'` (view mode `'split'` — user-resizable, default 50%)

See [`NotesEditor.svelte`](../routing/src--lib--components--NotesEditor.svelte.md) for the split-pane state flow and [ADR-014](../adr/ADR-014-document-level-drag-resize-pattern.md) for the document-level drag-resize pattern that drives `localSplitRatio`.

### 2026-07-17 — Bits UI tooltip (fractalui)

New reusable tooltip primitive `src/lib/fractalui/bits-tooltip.svelte` (Bits UI `Tooltip.*` under the app-wide `Tooltip.Provider` in `+layout.svelte`), styled by `_tooltip.sass`:

| Class | Component | Style source | Tokens |
|-------|-----------|--------------|--------|
| `.fui-tooltip-trigger` | `bits-tooltip.svelte` | `_tooltip.sass` | resets native button chrome; composes with `.btn-icon` etc. via `triggerProps.class` |
| `.fui-tooltip-content` | `bits-tooltip.svelte` | `_tooltip.sass` | `--background30`, `--border-primary`, `--sz-4/8`, `--text-xs`, `--text-secondary`, `--shadow-tooltip` |

Content is portalled to `.app-root-shell` (not `body`) because semantic tokens are theme-class-scoped. (2026-07-17: the composite-token layering bug this originally worked around is fixed — see ADR-037; the interim `--shadow-strong` fallback in `_tooltip.sass` was removed.)

### 2026-07-19 — New Design canvas pattern picker

Header dropdown gallery (`CanvasPatternSelect.svelte`, Bits UI `DropdownMenu` primitives, portalled to `.app-root-shell` so theme-scoped tokens resolve) for swapping the New Design canvas background among 64 light geometric vendor patterns. Visual tiles are grouped into Gradient Glow, Fade Grids, Diagonal Cross, Dashed Grids, Masked, and Textures & Lines. Styled in `_newdesign.sass` with tokens only:

| Class | Component | Style source | Tokens |
|-------|-----------|--------------|--------|
| `.newdesign-pattern-trigger` | `CanvasPatternSelect.svelte` | `_newdesign.sass` | caps `.btn-icon-text` width, ellipsis on `.button-text` |
| `.newdesign-pattern-menu` | `CanvasPatternSelect.svelte` | `_newdesign.sass` | `--background30`, `--border-secondary`, `--sz-8`, `--shadow-canvas-float`, `calc(var(--z-overlay) + 10)` |
| `.newdesign-pattern-heading` | `CanvasPatternSelect.svelte` | `_newdesign.sass` | composes `.text-item-sm.muted`, `--sz-*` padding |
| `.newdesign-pattern-grid` / `.newdesign-pattern-tile` | `CanvasPatternSelect.svelte` | `_newdesign.sass` | 3-column tile grid; `--accent-surface-faint` on `[data-highlighted]`, `--theme-color` + `--accent-surface-subtle` + `--shadow-focus-accent` on `.selected` |
| `.newdesign-pattern-preview(-inner)` / `.newdesign-pattern-thumb(-inner)` | `CanvasPatternSelect.svelte` | `_newdesign.sass` | `--background10`, `--border-secondary`; inner layer renders 200%/400% and scales to 50%/25% for live mini previews; `(-default)` variants draw the token grid unscaled |
| `.newdesign-canvas-grid-pattern` | `CanvasGrid.svelte` | `_newdesign.sass` | absolute inset-0 overlay, `pointer-events: none` |

The selected pattern is applied as derived inline `style` strings split across two layers — base color on `.newdesign-canvas-grid-viewport`, artwork + masks on the `.newdesign-canvas-grid-pattern` overlay beneath the world layer — so masks fade artwork without fading the base color (data-driven gradients/masks, not tokens — same sanctioned channel as camera pan/zoom directives). See ADR-047.
