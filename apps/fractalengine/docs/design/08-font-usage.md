---
id: 08-font-usage
title: Font Face Declarations and Per-Component Font Assignments
type: design
tags: [fonts, typography]
summary: Documents font-face declarations and which fonts each component/area is assigned to use.
relates_to: [03-typography]
updated: 2026-07-22
---

# Font Usage by Component

Detailed mapping of every component's font family and size across the application.

---

| Component / Context | Font Family | Font Size | Source File |
|---------------------|-------------|-----------|-------------|
| **Editor** (CodeMirror) | `'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace` | `13px` (via `--editor-font-size`) | `editorTheme.ts` L14 |
| **Terminal** (xterm surface) | `"JetBrains Mono", monospace` | `var(--terminal-font-size, 12px)` | `TerminalInstance.svelte` xterm options + `_terminal.sass` |
| **Sidebar** (titles) | System sans-serif | `11px` (`.sidebar-title`) | `_sidebar.sass` L16 |
| **Sidebar** (file names) | System sans-serif | `12px` (`.text-sm`) | Sidebar markup |
| **Tile** (headers) | System sans-serif | `11px` (`.tile-title`) | `_tile.sass` L21 |
| **AI Chat** (messages) | System sans-serif | `12px` | `_ai.sass` L84 |
| **AI Chat** (reasoning) | `'JetBrains Mono', monospace` | `11px` | `_ai.sass` L105 |
| **AI Chat** (inline code) | `'JetBrains Mono', monospace` | `11px` | `AIChat.svelte` HTML renderer |
| **Settings** (labels) | System sans-serif | `12px` | `_settings.sass` |
| **Settings** (section titles) | System sans-serif | `15px` | `_settings.sass` L60 |
| **Settings** (inputs) | System sans-serif | `13px` | `_settings.sass` L70 |
| **Browser** (address bar) | System sans-serif | `12px` (`.text-xs`) | `_browser.sass` |
| **Browser** (vault entries) | System sans-serif | `12px` | Browser.svelte |
| **Command Palette** (items) | System sans-serif | `13px` | `_commandpalette.sass` L52 |
| **Command Palette** (input) | System sans-serif | `14px` | `_commandpalette.sass` L37 |
| **Template Gallery** (titles) | System sans-serif | `16px` (`.gallery-title`) | `_templategallery.sass` L39 |
| **Template Gallery** (cards) | System sans-serif | `12px` (`.gallery-card-label`) | `_templategallery.sass` L83 |
| **Dock** (labels) | System sans-serif | `10px` (`.dock-btn-label`) | `_dock.sass` L33 |
| **Header buttons** | System sans-serif | `12px` (`.text-xs`) | `_layout.sass` |
| **Footer** | System sans-serif | `12px` (`.text-xs`) | `_layout.sass` |
| **TOTP timer** | `monospace` | `10px` (`.text-2xs`) | `_browser.sass` L235 |
| **Global body** | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif` | inherited | `_globals.sass` L6 |

---

**Key pattern:** Most UI text uses `.text-xs` (10px) or `.text-sm` (12px). The CodeMirror editor and terminal are the primary consumers of monospace fonts.
