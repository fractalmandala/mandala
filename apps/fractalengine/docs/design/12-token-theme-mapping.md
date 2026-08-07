---
id: 12-token-theme-mapping
title: Mapping Between Semantic Tokens and Theme Variants
type: design
tags: [design-tokens, theme, light-dark]
summary: Documents the mapping between semantic CSS tokens and light/dark theme variant values.
relates_to: [01-tokens, 10-editor-theme]
updated: 2026-07-22
---

# Token-to-Theme Mapping: `_tokens.sass` (Single Source of Truth)

**File:**
- [`src/lib/styles/_tokens.sass`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_tokens.sass) — CSS custom property definitions (single source of truth)

> **Note:** The VS Code theme engine (`starterTemplates.ts`) and runtime theme switching (`applyTheme()`) have been removed. All colors are now directly defined by `_tokens.sass` at stylesheet load time. This document describes the static token layer that applies universally.

---

## Architecture Overview

The app now uses a single-layer static token system:

```
  _tokens.sass                    CSS custom properties defined in :root block
        │
        ▼  consumed by .sass files
  SASS $variables                 $tile-bg: var(--background20)
  (compile-time aliases)          $module-code: var(--theme-color)
        │
        ▼
  All .svelte components          Use semantic CSS variables directly
```

### Two-Layer Token System (ADR-003) — Simplified

1. **Layer 1 — SASS variables (compile-time aliases):** Defined at the bottom of `_tokens.sass` as `$variable` names. These alias CSS custom properties for use in component `.sass` files via `@use '../tokens' as *`. Documented in [`docs/design/02-sass-variables.md`](file:///Users/amrit/fractals/apps/fractalengine/docs/design/02-sass-variables.md).

2. **Layer 2 — CSS custom properties (semantic):** Defined in `:root` in `_tokens.sass`. These are the runtime values that apply universally. Every component must consume these exclusively. Documented in [`docs/design/01-tokens.md`](file:///Users/amrit/fractals/apps/fractalengine/docs/design/01-tokens.md).

---

## Default Values (`_tokens.sass` :root)

The `:root` block in `_tokens.sass` provides the **dark theme defaults**. These values are applied at stylesheet load time and represent the "factory default" appearance before any theme is applied.

### Standard Tokens (directly consumed by components)

| CSS Variable | Default Value | Semantic Role |
|-------------|---------------|---------------|
| `--background10` | `#0d0d0f` | Deepest background (editor canvas) |
| `--background20` | `#141417` | Panel/tile background |
| `--background30` | `#1a1a1e` | Elevated surface (headers, sidebars) |
| `--background40` | `#222227` | Hover state, inputs |
| `--background50` | `#2d2d34` | Active state, selection |
| `--foreground10` | `#f3f3f5` | Brightest foreground |
| `--foreground20` | `#e4e4e7` | |
| `--foreground30` | `#d4d4d8` | |
| `--foreground40` | `#a1a1aa` | |
| `--foreground50` | `#71717a` | Dimmest foreground |
| `--text-primary` | `#f3f3f5` | Primary text |
| `--text-secondary` | `#a1a1aa` | Secondary / muted text |
| `--text-tertiary` | `#6b6b76` | Tertiary / hint text |
| `--border-primary` | `#1f1f24` | Primary borders |
| `--border-secondary` | `#27272f` | Secondary borders |
| `--border-tertiary` | `#32323c` | Tertiary borders |
| `--color10` | `#3b82f6` | Blue accent |
| `--color20` | `#10b981` | Green accent |
| `--color30` | `#f59e0b` | Amber accent |
| `--theme-color` | `#3b82f6` | Main theme accent (blue) |
| `--theme-color-alt` | `#10b981` | Secondary theme accent (green) |
| `--feedback-error` | `#ef4444` | Error / destructive red |

### Fixed Tokens (not user-overridable)

These are size, z-index, and shadow constants that are not intended to be changed:

| CSS Variable | Default Value | Role |
|-------------|---------------|------|
| `--chrome-header-strip` | `40px` | Header bar height |
| `--chrome-footer` | `40px` | Footer bar height |
| `--z-panel` | `10` | Panel z-index |
| `--z-overlay` | `100` | Overlay z-index |
| `--overlay-bg` | `rgba(0,0,0,0.6)` | Modal overlay |
| `--overlay-bg-dark` | `rgba(0,0,0,0.75)` | Dark overlay |
| `--shadow-strong` | `rgba(0,0,0,0.5)` | Strong shadow |
| `--shadow-stronger` | `rgba(0,0,0,0.6)` | Stronger shadow |
| `--white-text` | `#ffffff` | White text override |
| `--minimap-border` | `rgba(255,255,255,0.15)` | Minimap border |
| `--minimap-viewport-bg` | `rgba(255,255,255,0.03)` | Minimap viewport |
| `--minimap-viewport-shadow` | `rgba(0,0,0,0.25)` | Minimap shadow |
| `--dock-shadow` | `rgba(0,0,0,0.4)` | Dock shadow |
| `--dock-menu-shadow` | `rgba(0,0,0,0.3)` | Dock menu shadow |
| `--gallery-card-hover-bg` | `rgba(59,130,246,0.03)` | Gallery hover bg |

---

## Downstream Consumers

The CSS variables are consumed throughout the application:

### Component Stylesheets

Every `.sass` file in `src/lib/styles/components/` uses these variables. Key consumers:

| Stylesheet | Primary Tokens Used |
|-----------|-------------------|
| `_layout.sass` | `--background*`, `--text*`, `--border*`, `--theme-color` |
| `_sidebar.sass` | `--background*`, `--text*`, `--border*`, `--theme-color` |
| `_editor.sass` | `--background*`, `--text*`, `--border*`, `--theme-color` |
| `_terminal.sass` | `--background*`, `--text*`, `--border*`, `--font-monospace`, `--focus-ring`, `--sz-*`, `--theme-color`, `--theme-color-alt` |
| `_browser.sass` | `--background*`, `--text*`, `--border*`, `--theme-color` |
| `_ai.sass` | `--background*`, `--text*`, `--border*`, `--theme-color`, `--color30` |
| `_tile.sass` | `--background*`, `--border*`, `--theme-color` |
| `_canvas.sass` | `--background10`, `--border-tertiary` |
| `_minimap.sass` | `--minimap-*`, `--background*` |
| `_dock.sass` | `--dock-*`, `--background*`, `--text*` |
| `_templategallery.sass` | `--gallery-card-hover-bg`, `--background*`, `--border*` |
| `_commandpalette.sass` | `--background*`, `--border*`, `--text*`, `--theme-color` |
| `_settings.sass` | `--background*`, `--text*`, `--border*`, `--theme-color` |

### CodeMirror Editor Theme

**Source:** [`editorTheme.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/editorTheme.ts)

The CodeMirror editor consumes the same CSS variables via `customEditorTheme` and `customHighlightStyle`:

| CodeMirror Element | CSS Variable |
|--------------------|--------------|
| Editor background | `--background10` |
| Text color | `--text-primary` |
| Cursor | `--theme-color` |
| Selection | `--background50` |
| Active line | `--background40` |
| Gutter background | `--background20` |
| Gutter text | `--text-tertiary` |
| Active line gutter | `--background40` |
| Keywords | `--theme-color` (bold) |
| Types, functions, strings, numbers | `--theme-color-alt` |
| Comments | `--text-tertiary` (italic) |
| Operators | `--text-secondary` |

The syntax highlighting maps 21 Lezer tag types to these variables, keeping editor colors consistent with the rest of the IDE.

---

## How Values Are Applied

No runtime theme switching exists. The app reads all color values directly from the `_tokens.sass` `:root` block, which is loaded by the browser as a static stylesheet. The `_tokens.sass` file is the single place where all colors are defined.

```
Edit _tokens.sass :root values  →  Change any color in the app
```

All 13 component stylesheets (`_layout.sass`, `_sidebar.sass`, `_editor.sass`, etc.) reference `var(--background*)`, `var(--text*)`, `var(--border*)`, `var(--theme-color)`, and `var(--theme-color-alt)` — which all resolve from the `:root` block in `_tokens.sass`.

The CodeMirror editor theme ([`editorTheme.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/editorTheme.ts)) also references the same CSS variables, so editor syntax highlighting colors are consistent with the rest of the IDE.

---

## Changing Colors

To change any color in the IDE, edit the values in [`src/lib/styles/_tokens.sass`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_tokens.sass) within the `:root` block. For example, to change the sidebar background:

```sass
// Before:
--background20: #141417

// After:
--background20: #676767
```

This single change propagates to all components that use `var(--background20)`, including sidebar panels, tiles, and the browser zone.

## Theme Variant Note

The light variant sets `--text-primary` to `#181818`, preserving a readable semantic foreground for native controls such as `.panel-button-std` while the dark variant uses `#f3f3f5`.
