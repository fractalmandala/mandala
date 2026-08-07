---
id: 04-layout-system
title: Flex/Grid Layout Patterns, Spacing Rhythm, Containers
type: design
tags: [layout, flexbox, grid, spacing, accessibility, browser]
summary: Documents the flex/grid layout patterns, spacing rhythm, and container conventions used app-wide.
relates_to: [05-utility-primitives, 09-mixins-breakpoints, fractaldocs, ADR-026]
updated: 2026-07-22
---

# Layout System

> 2026-07-13: `.main-content-area` owns flex growth and minimum width in the layout stylesheet.

**Source:** [_layout.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_layout.sass)  
**Also affected:** [_globals.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_globals.sass)

---

## Page Shell

The shell may overlay `.global-browser-drawer` above the active non-code workspace. It hosts the same Browser component used by the classic layout, avoiding competing navigation headers. The footer's Apps control is the visible keyboard-accessible entry point to the otherwise inert collapsed app dock.

Resizable Notes boundaries are focusable separators. Pointer motion may continue at document scope, while Arrow keys adjust the same state in discrete steps; both paths commit through one undoable layout boundary.

FractalDocs follows the same interaction contract in its three-pane workspace: the left docs navigation, middle scrollable reading pane, and right outline live in one flex row. Its two focusable separators use the shared resize hit target and route pointer gestures and Arrow-key changes through the `docs` undo domain.

The Code workspace center uses `.ide-center-editor-region` as the flexing editor area. The bottom terminal is a sibling `.middle-bottom-terminal-zone` with the stored terminal height, so footer Terminal toggles reserve visible space instead of appending the terminal below a full-height editor. Its `.terminal-tabs-bar` switches between multiple PTY-backed sessions, while each active `.terminal-pty-surface` hosts xterm inside the token-driven terminal body and receives focus/resize events without changing the shared shell geometry.

Code editor overflow belongs to `.ide-editor` and the CodeMirror `.cm-scroller`; both allow vertical scrolling while preserving horizontal code scrolling. Notes vault overflow belongs to `.notes-sidebar1 .sidebar-content`, keeping long folder trees scrollable inside the shared workspace pane.

The app uses a full-viewport flex column layout:

```
┌─────────────────────────────────────────┐
│ .app-shell                              │
│  ┌─────────────────────────────────┐    │
│  │ .header-strip (40px)            │    │
│  ├─────────────────────────────────┤    │
│  │ .board-region (flex: 1)         │    │
│  │  (Canvas + Tiles + Dock)        │    │
│  ├─────────────────────────────────┤    │
│  │ .footer-strip (40px)            │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

| Selector | Key Properties |
|----------|----------------|
| `.app-shell` | `width: 100vw; height: 100vh; overflow: hidden; background: var(--background10)` |
| `.header-strip` | `height: var(--chrome-header-strip); background: var(--background30); border-bottom: 1px solid var(--border-primary)` |
| `.footer-strip` | `height: var(--chrome-footer); background: var(--background30); border-top: 1px solid var(--border-primary)` |
| `.board-region` | `flex: 1; overflow: hidden; display: flex; flex-direction: column` |

## Header Components

| Class | Purpose |
|-------|---------|
| `.app-logo` | Logo image (`height: 20px`) |
| `.app-badge` | Version badge |
| `.header-btn` | Action button in header strip |
| `.pulse-save` | Dirty-state glow on save button (`border-color: var(--theme-color)`) |

## Footer Components

| Class | Purpose |
|-------|---------|
| `.footer-route-indicator` | File path display (`max-width: 400px`) |
| `.dot-status` | Status indicator dot (`8px`, green) |

## Theme Dropdown

| Class | Purpose |
|-------|---------|
| `.theme-select-trigger` | Footer trigger button |
| `.theme-dropdown-menu` | `280×350px` absolute-positioned popover |
| `.theme-menu-header` | Header bar with close |
| `.theme-mode-toggle-action` | Light/dark preset toggle |
| `.theme-search-input` | Search input |
| `.themes-list-container` | Scrollable list |
| `.theme-item-row` | Individual theme row |
| `.active-theme` | Highlight for active theme |

## Icon Size Helpers

| Class | Dimensions |
|-------|------------|
| `.icon-svg` | `14×14px` |
| `.icon-svg-xs` | `10×10px` |
| `.icon-svg-sm` | `12×12px` |
| `.icon-svg-large` | `24×24px` |
| `.logo-image` | `height: 48px` |

---

**Related:** [01-tokens.md](01-tokens.md) for dimension tokens (`--chrome-header-strip`, `--chrome-footer`, etc.).
