---
id: 01-tokens
title: Two-Layer CSS Token System
type: design
tags: [design-tokens, css-variables, accessibility, feedback]
summary: Defines the Primitives -> Semantic two-layer CSS token system that all components must consume.
relates_to: [02-sass-variables, 12-token-theme-mapping, fractaldocs, ADR-037]
updated: 2026-07-17
---


> 2026-07-13: semantic icon-size/filter and attachment-name-width tokens prevent hardcoded visual values in component markup.

**Source:** `_tokens.sass` (Lines 2–39)

Every component must consume these semantic tokens for high-usage styles. However, on a case-by-case basis, some hardcoded styling is approved for local visual values or styling properties used in up to 2 places in the application. This keeps the global token sheet clean and avoids over-tokenization.

Tokens are declared in two scopes (see [ADR-037](../adr/ADR-037-composite-tokens-live-in-theme-scope.md)):

- **`:root`** — only self-contained tokens: literals (sizes, type scale, transitions, z-indices) and composites whose `var()` references are themselves declared at `:root`.
- **`.theme-amrit-light, .theme-amrit-dark` (shared block)** — every composite token that references a theme-scoped primitive (`--theme-color`, `--shadow-strong`, `--background10`, `color-mix(...)` surfaces, shadows, tile/canvas colors, module/template category colors). A custom property substitutes its `var()` references where it is *declared*; at `:root` those primitives don't exist, so such tokens would compute to guaranteed-invalid (empty) app-wide. Never add a `:root` token that references a theme primitive.

---

## Text Colors

| Token | Value | Description |
|-------|-------|-------------|
| `--text-primary` | `#f3f3f5` | Primary text |
| `--text-secondary` | `#a1a1aa` | Secondary / muted text |
| `--text-tertiary` | `#6b6b76` | Tertiary / hint text |

## Background Colors

| Token | Value | Description |
|-------|-------|-------------|
| `--background10` | `#0d0d0f` | Deepest background (editor canvas) |
| `--background20` | `#141417` | Panel/tile background |
| `--background30` | `#1a1a1e` | Elevated surface (headers, sidebars) |
| `--background40` | `#222227` | Hover state, inputs |
| `--background50` | `#2d2d34` | Active state, selection |

## Interaction and feedback semantics

| Token | Purpose |
|-------|---------|
| `--focus-ring` | Consistent high-contrast keyboard focus outline across controls and resize separators |
| `--feedback-error-bg` | Theme-aware surface behind recoverable error messages |
| `--feedback-error-border` | Theme-aware border for recoverable error messages |
| `--control-radius-small` | Small control radius mapped from `$radius-primitive-small` |
| `--control-radius-medium`, `--control-radius-large` | Medium and large control/surface radii |
| `--sz-` prefix with numbers | Sizes in px |
| `--dialog-shadow` | Shared elevated-dialog shadow |
| `--transition-control` | Shared control-state transition |
| `--control-target-min` | Minimum compact-control hit target (24px) |
| `--resize-hit-target` | Resize separator interaction width with a narrow visual line |
| `--home-grid-max-size`, `--home-grid-size` | Maximum and viewport-constrained Home template grid size |
| `--docs-pane-min-width`, `--docs-pane-max-width` | Bounds used by the FractalDocs navigation and outline resize separators |
| `--docs-left-pane-default-width`, `--docs-right-pane-default-width` | Persisted FractalDocs pane defaults |
| `--docs-content-max-width`, `--docs-content-inline-padding`, `--docs-content-block-padding` | Documentation reading-column measure and pane spacing |
| `--docs-resizer-visual-width`, `--docs-text-line-height` | FractalDocs separator hairline and Markdown reading rhythm |
| `--feedback-danger-bg`, `--feedback-danger-bg-hover`, `--feedback-danger-border` | Theme-derived destructive-control surfaces |
| `--accent-surface-subtle` | Theme-derived subtle selection/drop surface |

Both dark and light mappings are defined in `_tokens.sass`; components consume only these semantic names.

## Foreground Colors

| Token | Value | Description |
|-------|-------|-------------|
| `--foreground10`–`--foreground50` | `#f3f3f5` → `#71717a` | Brightness scale in reverse |

## Accent / Semantic Colors

| Token | Value | Description |
|-------|-------|-------------|
| `--color10` | `#3b82f6` | Blue (primary accent) |
| `--color20` | `#10b981` | Green (secondary accent) |
| `--color30` | `#f59e0b` | Amber (warning/highlight) |
| `--theme-color` | `#3b82f6` | Main theme accent |
| `--theme-color-alt` | `#10b981` | Secondary theme accent |
| `--feedback-error` | `#ef4444` | Error / destructive |

## Border Colors

| Token | Value |
|-------|-------|
| `--border-primary` | `#1f1f24` |
| `--border-secondary` | `#27272f` |
| `--border-tertiary` | `#32323c` |

## Fixed Dimensions & Z-Index

| Token | Value |
|-------|-------|
| `--chrome-header-strip` | `40px` |
| `--chrome-footer` | `40px` |
| `--z-panel` | `10` |
| `--z-overlay` | `1000` (global modal/overlay layer, above workspace rulers and panels) |
| `--settings-dialog-max-width` | `900px` |
| `--settings-dialog-max-height` | `620px` |
| `--settings-dialog-viewport-inset` | `16px` |
| `--settings-dialog-sidebar-width` | `200px` |

## Overlays & Shadows

| Token | Value |
|-------|-------|
| `--overlay-bg` | `rgba(0,0,0,0.6)` |
| `--overlay-bg-dark` | `rgba(0,0,0,0.75)` |
| `--shadow-strong` | `rgba(0,0,0,0.5)` |
| `--shadow-stronger` | `rgba(0,0,0,0.6)` |

## Minimap, Dock & Gallery

| Token | Value |
|-------|-------|
| `--minimap-border` | `rgba(255,255,255,0.15)` |
| `--minimap-viewport-bg` | `rgba(255,255,255,0.03)` |
| `--minimap-viewport-shadow` | `rgba(0,0,0,0.25)` |
| `--dock-shadow` | `rgba(0,0,0,0.4)` |
| `--dock-menu-shadow` | `rgba(0,0,0,0.3)` |
| `--gallery-card-hover-bg` | `rgba(59,130,246,0.03)` |
