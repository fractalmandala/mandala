---
id: 10-editor-theme
title: CodeMirror Theme Tokens and Variant Switching
type: design
tags: [editor, theme, codemirror]
summary: Documents the CodeMirror editor theme tokens and how light/dark/custom theme variants are switched.
relates_to: [12-token-theme-mapping]
updated: 2026-06-25
---

# EditorTheme — CodeMirror Configuration

**Source:** [editorTheme.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/editorTheme.ts)

---

## Theme (`customEditorTheme`)

Dynamic CodeMirror theme that maps all styling to CSS custom properties for token compliance.

| Scope | Key Properties |
|-------|----------------|
| `&` (root) | `color: var(--text-primary); background: var(--background10); font-size: var(--editor-font-size, 13px); font-family: var(--editor-font-family, ...)` |
| `.cm-scroller` | `overflow: auto` |
| `.cm-content` | `caretColor: var(--theme-color)` |
| `.cm-cursor` | `borderLeftColor: var(--theme-color); borderLeftWidth: 2px` |
| `.cm-selectionBackground` | `backgroundColor: var(--background50)` |
| `.cm-activeLine` | `backgroundColor: var(--background40)` |
| `.cm-gutters` | `backgroundColor: var(--background20); color: var(--text-tertiary); borderRight: 1px solid var(--border-primary)` |
| `.cm-activeLineGutter` | `backgroundColor: var(--background40); color: var(--text-primary)` |
| `.cm-searchMatch` | `backgroundColor: rgba(250, 204, 21, 0.3)` |
| `.cm-tooltip` | `border: 1px solid var(--border-primary); backgroundColor: var(--background20)` |
| `.cm-tooltip-autocomplete ul li[aria-selected]` | `backgroundColor: var(--background40); color: var(--text-primary)` |

**Theme mode:** `{ dark: true }`

## Syntax Highlighting (`customHighlightStyle`)

| Syntax Tag | Token Mapped | Style |
|------------|-------------|-------|
| `t.keyword` | `var(--theme-color)` | Bold |
| `t.operator`, `t.punctuation` | `var(--text-secondary)` | Regular |
| `t.typeName`, `t.className` | `var(--theme-color-alt)` | Bold for typeName |
| `t.tagName`, `t.self` | `var(--theme-color)` | Regular |
| `t.propertyName` | `var(--text-primary)` | Regular |
| `t.attributeName` | `var(--theme-color-alt)` | Regular |
| `t.comment` | `var(--text-tertiary)` | Italic |
| `t.string`, `t.number`, `t.regexp` | `var(--theme-color-alt)` | Regular |
| `t.bool` | `var(--theme-color-alt)` | Bold |
| `t.definition(t.name)` | `var(--text-primary)` | Bold |
| `t.function(t.definition(t.name))` | `var(--theme-color-alt)` | Bold |
| `t.heading` | `var(--theme-color)` | Bold |
| `t.emphasis` | — | Italic |
| `t.strong` | — | Bold |
| `t.link` | `var(--theme-color-alt)` | Underlined |

---

**Exported as:** `dynamicSyntaxHighlighting` (wrapped in `syntaxHighlighting()`).

Used in `Editor.svelte` as part of the CodeMirror `EditorState` configuration.
