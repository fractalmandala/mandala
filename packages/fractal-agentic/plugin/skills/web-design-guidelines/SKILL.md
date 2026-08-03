---
name: web-design-guidelines
description: Review UI code for FractalEngine IDE Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check code alignment with project guidelines".
metadata:
  author: Antigravity
  version: '2.0.0'
  argument-hint: <file-or-pattern>
---

# FractalEngine Studio Web Interface Guidelines

Audit and review frontend code to ensure strict compliance with the FractalEngine IDE architecture, styling conventions, and user interaction rules.

## Core Compliance Checklist

### 1. Framework & Reactivity Rules

- **Svelte 5 Runes Only**: Ensure all `.svelte` components utilize modern Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`).
- **No Legacy Patterns**: Absolutely ban legacy Svelte 3/4 reactivity (`$:`) and imports from `'svelte/store'`.
- **Reactive Derivations**: Always use `$derived()` expressions directly without wrapping them in an unnecessary arrow function (e.g., use `let x = $derived(val)` instead of `let x = $derived(() => val)`).

### 2. Styling Discipline (SASS Indention)

- **Indented SASS Only**: All styling definitions must use classic indented SASS (`.sass` extension) with single-tab indentation, no curly braces, and no semicolons. No `.scss` or CSS allowed.
- **No Inline Styles or Style Blocks**: Components must not contain `<style>` blocks or hardcoded style attributes. All styles must go into `src/lib/styles/components/` and be imported in `src/lib/styles/index.sass`.
- **JIT Compatibility**: Classes should align with the `fractals-styler` JIT class mapping.

### 3. Design Tokens Architecture

- **No Hardcoded Values**: Components must never hardcode colors, font sizes, spacing, border radii, or shadows.
- **Two-layer CSS Variables**: Ensure styling variables follow the two-layer token mapping (Primitives → Semantic). Components must consume semantic CSS tokens (e.g., `--text-primary`, `--background10`, `--border-secondary`, `--theme-color`) defined in `src/lib/styles/_tokens.sass`.

### 4. IPC Architecture

- **Single Module Gateway**: Ensure all Tauri API invocations go through the single module gateway: [ipc.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts). No direct imports of `@tauri-apps/api/core` inside components.
- **Browser Mocking**: Maintain compatibility with the browser mock [ipc-mock.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc-mock.ts) to keep `pnpm dev` working fully outside Tauri.

### 5. Mandatory Undo/Redo Boundary

- **Undo Support**: All user-editable states must support a complete Undo/Redo boundary via keyboard shortcuts (`Cmd+Z`/`Ctrl+Z`) and application menu integrations.
- **Snapshot Representation**: Design settings, form inputs, layout modifications, and editors must have a defined snapshot structure and restore method.

### 6. Design Color Control

- **Spectrum Picker Only**: Do not use native browser `<input type="color">` for design inputs. Use the custom spectrum/hex picker popover.

## Audit Workflow

1. Scan files matching the provided target pattern.
2. Verify against the rules listed above.
3. Output findings in the terse `file:line: column - [RULE] description` format.
4. Report infractions clearly to the user.
