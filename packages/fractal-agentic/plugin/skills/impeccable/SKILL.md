---
name: impeccable
description: Design, redesign, audit, critique, polish, or otherwise improve the FractalEngine Studio user interface. Covers app shell panels, editors, sidebars, terminal console, layouts, themes, components, forms, and settings. Guides compliance with Svelte 5 runes, indented SASS, design tokens, IPC gateways, and mandatory undo boundaries.
argument-hint: '[{{command_hint}}] [target]'
user-invocable: true
allowed-tools:
  - Bash(npx impeccable *)
license: Apache 2.0
---

# Impeccable Design & Code Iteration for FractalEngine Studio

This skill guides the design, development, and auditing of components and layouts within FractalEngine Studio. It ensures that every visual and code change preserves the IDE's distinctive dark space aesthetic and conforms strictly to project constraints.

## 1. Strict Project Architectural Constraints

Every UI change must pass the following rules:

### A. Svelte 5 Reactivity (Runes Only)

- Use only modern Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`).
- **No legacy syntax**: Do not write `$: ` reactive statements or import `svelte/store`.
- **Derived values**: Write derived states using `$derived(...)` directly without wrapping them in an unnecessary arrow function (e.g., use `let numLines = $derived(text.split('\n').length)` instead of `let numLines = $derived(() => text.split('\n').length)`).

### B. Styling Discipline (Classic Indented SASS Only)

- **File extension**: Styles must use the `.sass` extension.
- **Syntax**: Use indented syntax only. Single tab indented, no curly braces, and no semicolons.
- **No Style Blocks**: Svelte files must not contain `<style>` blocks. Write all component styles under `src/lib/styles/components/` and import them in `src/lib/styles/index.sass`.
- **No Inline Styles**: Never use inline `style` attributes on HTML elements.

### C. Two-Layer Design Tokens

- **No Hardcoding**: Components must never hardcode colors, font sizes, spacing, shadows, or border-radius values.
- **Semantic Consumption**: Map all elements to semantic variables defined in `src/lib/styles/_tokens.sass` (e.g., `--background10`, `--foreground20`, `--text-primary`, `--border-secondary`, `--theme-color`, `--feedback-error`).

### D. Single IPC Gateway

- **Tauri Integration**: All interprocess communication (Tauri calls) must go through the single module gateway: [ipc.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts). Do not import `@tauri-apps/api` directly in components.
- **Browser Compatibility**: Ensure the browser mock [ipc-mock.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc-mock.ts) is updated when new native capabilities are added.

### E. Mandatory Undo/Redo Boundary

- **Undo Support**: Any state modified by user interactions (sliders, input text, dropdown selections, panel states) must define an undo boundary, snapshot format, and restore handler on the `ideState` undo stack.
- **Keyboard Hook**: Wire state undo/redo actions to `Cmd+Z` / `Ctrl+Z` globally.

### F. Spectrum Color Picker

- Avoid native `<input type="color">` elements. Use the shared spectrum/hex picker popover for color selectors.

---

## 2. Design Guidance & Style Guidelines

### A. Layout Structure & Alignment

- **Dimensions**: Maintain resizability. Sidebar widths and terminal heights must bind to layout states in `ideState` and resize via draggable handles.
- **Terminal Docking**: The terminal must support drag-and-drop docking to three locations: `bottom`, `left`, or `right` regions, automatically rendering inside the selected container.

### B. Typography

- Pair monospace typefaces for code interfaces and sans-serif fonts for utility/sidebars.
- Headings and label metrics must adjust proportionally using semantic font sizes.

### C. Color Consistency

- Ensure text contrast is >= 4.5:1 for body and >= 3:1 for large headers against the active theme background.
- Follow the theme's color schema from [starterTemplates.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/data/starterTemplates.ts).

### D. Absolute Design Bans

- **No Rounded Corners > 4px**: Keep panels, tabs, code areas, and buttons structured and crisp (0px to 4px) to retain an authentic developer tool visual identity.
- **No Gradient Text / Blurs**: Avoid decorative glow gradients or heavy glassmorphism blurs.
- **No side-stripe borders**: Avoid colored vertical stripes on container margins.
- **No generic card grids**: Avoid repeating generic cards with icon/header layout.

---

## 3. Workflow & Setup

1. Check current workspace state: inspect active layout sizes, theme values, and dependencies.
2. Read the designated route or component file to review context.
3. Apply structural edits matching Svelte 5 and indented SASS rules.
4. Verify changes compile successfully by building the static bundle.
