---
id: sp-plan-2026-06-24-codemirror-editor
title: "Superpowers Plan: 2026-06-24-codemirror-editor"
type: archive
tags: [superpowers, plan, history]
updated: 2026-07-15
---

> **Historical superpowers implementation plan — kept as reference.**


This plan details the replacement of the simple `<textarea>` editor in **FractalEngine Studio** with a professional CodeMirror 6 editor engine. It includes support for syntax highlighting (TypeScript, Svelte/HTML, SASS, Markdown), auto-completions, and maps the IDE's 100+ VS Code themes dynamically using token CSS custom properties.

---

## User Review Required

> [!IMPORTANT]
> **Automatic Theme Mapping**: Instead of writing separate CodeMirror styles for each of the 100+ themes, we will build a custom CodeMirror theme and highlight extension (`src/lib/editorTheme.ts`) that binds directly to the SASS design token CSS custom variables (e.g. `--background10`, `--text-primary`, `--theme-color`, `--theme-color-alt`).
>
> When the user changes the IDE theme in the footer, Svelte re-resolves the CSS variables on the root element. CodeMirror will automatically redraw using the new theme colors instantly, preserving high visual contrast and matching the active theme perfectly.
>
> **Package Installation**: We will add the CodeMirror dependencies to `package.json`. You will need to run `pnpm install` inside the app directory to install them.

---

## Proposed Changes

### 1. Build and Config Updates

#### [MODIFY] `package.json`
- Add CodeMirror 6 packages to dependencies:
  - `codemirror`: Core editor packages.
  - `@codemirror/lang-javascript`: TypeScript/JavaScript support.
  - `@codemirror/lang-html`: Svelte/HTML support.
  - `@codemirror/lang-sass`: SASS syntax support.
  - `@codemirror/lang-markdown`: Markdown support.
  - `@lezer/highlight`: Syntax tags.

---

### 2. Editor Theme and Syntax Highlighting

#### [NEW] `editorTheme.ts`
- Implement a custom CodeMirror theme extension (`customEditorTheme`) that maps:
  - Background & Text: `var(--background10)` & `var(--text-primary)`
  - Cursor: `var(--theme-color)`
  - Active Line Highlight: `var(--background40)`
  - Selection: `var(--background50)`
  - Gutters (Line Numbers): `var(--background20)` with border `var(--border-primary)` and color `var(--text-tertiary)`
- Implement a custom syntax highlighter style (`customHighlightStyle`) matching tags to tokens:
  - Keywords & Control: `var(--theme-color)` (bold)
  - Strings & Numbers: `var(--theme-color-alt)`
  - Comments: `var(--text-tertiary)` (italic)
  - Variable Names & Tags: `var(--text-primary)`
  - Functions & Classes: `var(--theme-color-alt)`

---

### 3. Svelte UI Components

#### [MODIFY] `Editor.svelte`
- Replace the raw `<textarea>` with a CodeMirror container `div`.
- Handle Svelte 5 component bindings and effects:
  - On mount: Initialize the CodeMirror `EditorView` with the active file's content, selected language pack, keymaps, and the custom theme extension.
  - On active file change: Reconfigure the editor instance (load new content, swap language extension, and reset history).
  - On content edit: Dispatch changes to `ideState.updateActiveFileContent(value)`.
  - On keypress: Route `Cmd+S` (Save) and editor-focused `Cmd+Z`/`Cmd+Shift+Z` actions.

---

## Verification Plan

### Automated Steps
1. Run `pnpm install` in the app directory to download the new packages.
2. Run `pnpm run check` to verify TypeScript compiler configurations.
3. Run `pnpm run build` to verify static compilation.

### Manual Verification
1. **Syntax Highlighting**: Open a `.svelte`, `.ts`, `.sass`, or `.md` file. Verify code tokens are colored according to syntax rules.
2. **Dynamic Theming**: Change the active editor theme in the footer. Verify CodeMirror's workspace background, gutter, line highlights, selection highlights, and code tokens immediately update to match the theme.
3. **Interactive Actions**: Type inside the editor. Verify the tab's unsaved dot indicator appears, and pressing `Cmd+S` saves changes. Verify local editor undo (`Cmd+Z`) and redo work correctly.
