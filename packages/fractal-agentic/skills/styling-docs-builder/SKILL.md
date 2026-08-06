---
name: styling-docs-builder
description: Scans Svelte files and SASS stylesheets to generate structured documentation of layouts, components, typography, and their styling classes with file locations. Invoke when user asks to document styling, generate design docs, or map where styles live.
---

# Styling & Design Documentation Builder

Generates living documentation of the project's styling and design system by scanning source files, extracting class usage, SASS variable references, and file locations. The output lets agents and humans understand how any component, layout, or page is styled without re-reading all project files.

---

## When to Invoke

- User says "document the styling", "build design docs", "map the styles"
- User asks "how is X styled?" or "where is the typography defined?"
- User wants to understand which classes style a component/layout/page
- User needs a reference doc for the design system, tokens, or component styles
- Before onboarding a new agent or developer to reduce context-reading overhead
- After restructuring styles or adding new components

---

## Workflow

### Phase 1 — Discover Source Files

Use `Glob` to discover the full set of files to scan:

- **Svelte pages**: `src/routes/**/*.svelte`
- **Svelte library components**: `src/lib/**/*.svelte`
- **Component Svelte files**: `src/lib/components/**/*.svelte`
- **Indented SASS stylesheets**: `src/lib/styles/**/*.sass`
- **Any other SASS files**: `src/**/*.sass`, `src/**/*.scss` (if they exist)

Store the file list grouped by category: `pages`, `components`, `styles`.

### Phase 2 — Scan Stylesheets

Read **every** `.sass` file in `src/lib/styles/`. For each file, extract:

1. **File path** (absolute, `file:///` protocol)
2. **Token/variable definitions** — any line containing `$variable:` or `--variable:` definitions. Note the variable name and value.
3. **CSS class definitions** — any line defining `.class-name` with its properties
4. **Nesting structure** — note indentation-based nesting to capture selectors like `.parent .child`
5. **`@use` / `@forward` / `@import` dependencies** — which stylesheets reference which others

Organise the output per file. Example:

```markdown
### `_tokens.sass`

**Path:** [src/lib/styles/_tokens.sass](file:///...)

**Token definitions:**

| Variable           | Value                 | Category         |
| ------------------ | --------------------- | ---------------- |
| `--text-primary`   | `#f3f3f5`             | text color       |
| `--background10`   | `#0d0d0f`             | background shade |
| `--border-primary` | `#1f1f24`             | border color     |
| `--theme-color`    | `#3b82f6`             | accent           |
| `$tile-bg`         | `var(--background20)` | canvas/tile      |
| ...                | ...                   | ...              |
```

### Phase 3 — Scan Svelte Files (Markup)

Read the `.svelte` files the user is interested in (or all of them if the user wants a full survey). For each file, extract:

1. **File path** (absolute)
2. **Template structure** — the top-level HTML elements and their class attributes
3. **Class attribute values** — all `class="..."` strings, noting which elements they belong to
4. **Component composition** — which child components are used (`<Sidebar />`, `<Tile />`, etc.)
5. **Svelte directives** — `class:active`, `class:selected`, `style:`, etc.

Example:

```markdown
### `Editor.svelte`

**Path:** [src/lib/components/Editor.svelte](file:///...)

**Template structure:**
```

<div class="editor-workspace-wrapper">     ← outermost container
  <div class="editor-tabs-bar">            ← tab row
    {#each tabs as tab}
      <button class="tab-button" class:active={tab.isActive}>
    {/each}
  <div class="editor-container">           ← CodeMirror wrapper
```

**Classes used:** `editor-workspace-wrapper`, `editor-tabs-bar`, `tab-button`, `editor-container`, ...

````

### Phase 4 — Cross-Reference Styles to Markup

For each class name found in `.svelte` files, determine where its styles are defined:

1. Search all `.sass` files for `.class-name` definitions.
2. Note the file and line number where the class is styled.
3. Note any SASS variables or CSS custom properties the class references.

Build a **class-to-file mapping**:

```markdown
## Class Registry

| Class | Used in | Defined in | Depends on tokens |
|-------|---------|------------|-------------------|
| `.editor-workspace-wrapper` | `Editor.svelte` | `_editor.sass` L12 | `--background10` |
| `.tab-button` | `Editor.svelte` | `_editor.sass` L34 | `--text-secondary`, `--border-secondary` |
| `.tile-header` | `Tile.svelte` | `_tile.sass` L8 | `$tile-bg`, `--border-secondary` |
| ... | ... | ... | ... |
````

### Phase 5 — Document Typography

Typography is a cross-cutting concern. To document it:

1. Read `_typography.sass` (if it exists) and extract all type-related rules.
2. Read the `_tokens.sass` for any `--font-*` or `--text-*` tokens.
3. Read `editorTheme.ts` for CodeMirror-specific font settings.
4. For each Svelte file, identify elements that carry typographic classes (`.heading`, `.body`, `.code`, `.mono`, etc.).

Output:

```markdown
## Typography

### Font Tokens (from `_tokens.sass`)

- `--editor-font-size`: 13px (dynamic via theme)
- `--editor-font-family`: `'JetBrains Mono', 'Fira Code', ...`

### Font Usage by Component

| Component     | Font/Style           | Source                           |
| ------------- | -------------------- | -------------------------------- |
| `Editor`      | monospace, 13px      | `editorTheme.ts`, `_editor.sass` |
| `Terminal`    | monospace, 13px      | `_terminal.sass`                 |
| `Sidebar`     | sans-serif, inherits | `_sidebar.sass`                  |
| `Tile` header | sans-serif, 12px     | `_tile.sass`                     |
| ...           | ...                  | ...                              |
```

### Phase 6 — Document Layout Structure

Read `_layout.sass` and `_primitives.sass` to understand the utility class system and overall page layout.

Output:

```markdown
## Layout System

### Page Shell (`_layout.sass`)

- `.board-region` — the main canvas area filling the viewport
- `.chrome-header` — top bar, height `--chrome-header-strip` (40px)
- `.chrome-footer` — bottom bar, height `--chrome-footer` (40px)

### Utility Primitives (`_primitives.sass`)

| Class               | Behavior                                |
| ------------------- | --------------------------------------- |
| `.box`              | `display: flex; flex-direction: column` |
| `.row`              | `display: flex; flex-direction: row`    |
| `.row.wrap`         | flex wrap enabled                       |
| `.row.ycenter`      | `align-items: center`                   |
| `.box.xcenter`      | `align-items: center`                   |
| `.grid.grid-cols-2` | CSS grid, 2 columns                     |
| ...                 | ...                                     |
```

### Phase 7 — Assemble Documentation

Present the output in one of three modes depending on user intent:

#### Mode A: Full Design System Reference

Write to `docs/DESIGN-SYSTEM.md` (or the path the user specifies). Include:

- Table of Contents
- Token reference (all CSS variables and SASS variables with values)
- Class registry (class → component → stylesheet mapping)
- Typography reference
- Layout system documentation
- Per-component style breakdown

#### Mode B: Single Component/Page Deep-Dive

When the user asks "document the styling of X", produce a focused report covering only that file:

- Classes used and where they're defined
- Token dependencies
- Typography applied
- Layout context

#### Mode C: Typography Audit

When the user asks about typography specifically:

- All font-size, font-family, line-height definitions across all SASS files and Svelte components
- Where each type scale value is used
- Any inconsistent or missing type definitions

---

## Output Format Rules

1. **Use `file:///` absolute links** — every file reference must be clickable, e.g. `[src/lib/styles/_tokens.sass](file:///absolute/path/to/_tokens.sass)`.
2. **Include line numbers** — when referencing a class definition or token, note the line number: `_editor.sass L34`.
3. **Tables for structured data** — use Markdown tables for class registries, token maps, and cross-references.
4. **Hierarchy by indentation** — when documenting template structures, use indentation to show DOM nesting.
5. **One file per table section** — group entries by their source file so readers can navigate by file.

---

## Important Rules

1. **Read before writing** — always read the full content of any SASS or Svelte file you reference. Do not rely on Grep alone for structure — use Read to understand nesting and context.
2. **Always link sources** — every class name, token, or style rule documented must be accompanied by a clickable file link. A documentation entry without a source link is not useful.
3. **Ask for scope** — if the user doesn't specify a scope, ask: "Do you want the full design system reference, a deep-dive on a specific component, or a typography audit?" Do not default to full-scan if the user might want targeted output.
4. **Don't document what doesn't exist** — if a file or class referenced in a Svelte template cannot be found in any stylesheet, flag it as an **orphan class** in a separate section.
5. **Preserve SASS comments** — if SASS files contain `//` comments explaining a class or variable, include those in the documentation. They represent design intent.
6. **Update, don't duplicate** — if `docs/DESIGN-SYSTEM.md` already exists, read it first and update sections rather than rewriting from scratch. Flag what changed.
7. **Respect the two-layer token system** — when documenting tokens, explicitly note whether they are CSS custom properties (Layer 2 semantic) or SASS variables (consumers of CSS var). This is a project architectural rule (see ADR-003).
