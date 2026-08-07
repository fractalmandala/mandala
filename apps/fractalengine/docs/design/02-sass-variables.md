---
id: 02-sass-variables
title: Indented SASS Variable Definitions and Overrides
type: design
tags: [sass, variables]
summary: Documents indented SASS variable definitions and override patterns used across the stylesheet system.
relates_to: [01-tokens]
updated: 2026-06-25
---

# SASS Variables (Layer 1: Primitives)

**Source:** [_tokens.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_tokens.sass) (Lines 41–94)

SASS variables that consume the CSS custom properties. Used in `.sass` stylesheets via `@use '../tokens' as *`.

---

## Canvas

| Variable | Maps To | Description |
|----------|---------|-------------|
| `$canvas-bg` | `var(--background10)` | Canvas background |
| `$canvas-grid-dot` | `var(--border-tertiary)` | Grid dot color |
| `$canvas-grid-size` | `22px` | Grid spacing (px) |

## Tile

| Variable | Maps To | Description |
|----------|---------|-------------|
| `$tile-bg` | `var(--background20)` | Tile background |
| `$tile-border` | `var(--border-secondary)` | Tile border |
| `$tile-border-active` | `var(--theme-color)` | Active tile border |
| `$tile-head-h` | `30px` | Tile header height |
| `$tile-radius` | `8px` | Tile border radius |
| `$tile-shadow` | `0 10px 34px var(--dock-shadow)` | Tile box-shadow |

## Module Legend Dots

| Variable | Maps To | Kind |
|----------|---------|------|
| `$module-code` | `var(--theme-color)` | Code (blue) |
| `$module-design` | `var(--theme-color-alt)` | Design (green) |
| `$module-wiki` | `var(--color30)` | Wiki (amber) |
| `$module-mail` | `var(--color10)` | Mail (blue) |
| `$module-db` | `var(--color20)` | Database (green) |
| `$module-system` | `var(--text-tertiary)` | System (grey) |

## Z-Index Scale

| Variable | Value | Context |
|----------|-------|---------|
| `$z-tile` | `10` | Default tile |
| `$z-tile-active` | `20` | Active (focused) tile |
| `$z-dock` | `100` | Tile dock launcher |
| `$z-minimap` | `100` | Minimap overlay |
| `$z-overlay` | `1000` | Modals, command palette |

## Shadow & Overlay Aliases

| Variable | Maps To |
|----------|---------|
| `$overlay-bg` | `var(--overlay-bg)` |
| `$overlay-bg-dark` | `var(--overlay-bg-dark)` |
| `$shadow-strong` | `var(--shadow-strong)` |
| `$shadow-stronger` | `var(--shadow-stronger)` |
| `$white-text` | `var(--white-text)` |
| `$minimap-border` | `var(--minimap-border)` |
| `$minimap-viewport-bg` | `var(--minimap-viewport-bg)` |
| `$minimap-viewport-shadow` | `var(--minimap-viewport-shadow)` |
| `$dock-shadow` | `var(--dock-shadow)` |
| `$dock-menu-shadow` | `var(--dock-menu-shadow)` |
| `$gallery-card-hover-bg` | `var(--gallery-card-hover-bg)` |

---

**Usage pattern:** `@use '../tokens' as *` at the top of each component `.sass` file.
