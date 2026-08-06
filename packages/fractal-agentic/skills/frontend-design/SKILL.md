---
name: frontend-design
description: Design principles and styling rules for building and auditing the FractalEngine Studio user interface. Helps with visual hierarchy, layout structure, typography, and styling consistency in line with project standards.
license: Complete terms in LICENSE.txt
---

# FractalEngine Studio Frontend Design Guidelines

This document guides design choices for FractalEngine Studio. Every new layout, panel, component, or visual tweak must adhere to these design principles, preventing generic templated defaults and maintaining a professional, integrated IDE look (similar to premium themes like JetBrains Dark or VS Code Slate).

## 1. Visual Hierarchy & Theme Constraints

- **Dark Space Theme**: By default, the UI uses the custom Dark Space color palette defined in `src/lib/styles/_tokens.sass`.
- **Contrast Ratios**: All UI text must hit at least 4.5:1 contrast against its background. Large headers (>= 18px) must hit at least 3:1.
- **Two-Layer CSS Variables**: Every color, shadow, padding, or border-radius value must consume semantic design variables:
  - `--background10` / `--foreground10` (Editor surface, primary panels)
  - `--background20` / `--foreground20` (Sidebar wrappers, tab headers)
  - `--background30` / `--foreground30` (Footer strip, borders, input backgrounds)
  - `--text-primary` / `--text-secondary` / `--text-tertiary`
  - `--theme-color` / `--theme-color-alt` (Highlights, active markers, focus rings)
  - `--feedback-error` (Error text, warning indicators)

## 2. Layout Structure & Resizing

- **App Shell Layout**: Consists of a slim Header Strip (`--chrome-header-strip`), a central Main Workspace containing Left Sidebar, Editor, Right Sidebar, and a bottom Terminal, followed by a slim Footer Strip (`--chrome-footer`).
- **Resizability**: Left Sidebar, Right Sidebar, and Terminal are resizable via draggable handles. Do not hardcode fixed widths; read and write layout dimensions from `ideState` (`leftSidebarWidth`, `rightSidebarWidth`, `terminalHeight`).
- **Docking Areas**: The terminal can be dynamically docked (`bottom`, `left`, `right`). Ensure layout grids adapt fluidly to these locations.

## 3. Typography & Styling Rules

- **Monospace Alignment**: The editor surface and line numbers column must align using strict monospace font definitions.
- **Classic SASS Only**: All styling must be written in classic indented SASS (`.sass` syntax, no curly braces or semicolons) using tabs for indentation. Do not write CSS or `.scss`.
- **No Style Blocks in Svelte**: Never write `<style>` inside Svelte components. All component styles go into `src/lib/styles/components/` (e.g. `_editor.sass`, `_sidebar.sass`, `_terminal.sass`) and are imported in `src/lib/styles/index.sass`.

## 4. Absolute Styling Bans

Avoid these design traps to keep the interface looking polished and authentic:

- **No Hardcoded Metrics**: Never write hardcoded color hex values (`#fff`, `#000`), fixed pixel fonts, spacing, shadows, or border radii directly inside components or SASS rules. Always map them to semantic variables.
- **No Side-Stripe Accent Borders**: Avoid thick left/right borders on cards, alerts, or list items.
- **No Gradient Text**: Keep headings clean, readable, and solid colored.
- **No Excessive Rounding**: The interface uses structured, low-radius styling (mostly 0px to 4px border-radius) for an authentic developer workspace feel. Do not use `border-radius: 32px` or extreme roundings unless for full-pill badges.
- **No native HTML Color Inputs**: Color pickers must use the custom spectrum/hex picker popover.

## 5. Interaction & Undo Boundaries

- **Keyboard Navigation**: Interactive controls must have visible `:focus-visible` outlines using `--theme-color`.
- **Mandatory Undo/Redo**: Every user-editable state (such as text input changes, form field selections, theme triggers, layout presets, or workspace configurations) must be bounded by the global Undo/Redo stack in `ideState`.
- **State Serialization**: Ensure edits can be snapshotted and restored without reloading page components.
