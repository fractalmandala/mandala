---
id: ADR-012
title: Markdown Notes & Wiki Workspace with TipTap WYSIWYG Editor
type: adr
tags: [notes, wiki, tiptap, editor]
summary: Introduces a markdown notes/wiki workspace built on TipTap with vault sidebars and deferred, grammar-scoped editor dependencies.
relates_to: [ADR-013, ADR-014, ADR-018]
status: accepted
updated: 2026-07-13
---


**Status:** Accepted
**Date:** 2026-06-25
**Decision makers:** Architecture Committee, Frontend Lead

---

## Context

The application needed a dedicated workspace for markdown note-taking and wiki management — beyond what the existing code editor (CodeMirror) provides. Users requested a Notion/Obsidian-style editing experience with:

- True WYSIWYG rich-text editing (bold, italic, headings, tables, lists, etc.)
- Slash-commands for quick block insertion
- Split-pane view showing raw markdown alongside rendered rich text
- Three-panel layout: folder vault → file list → editor
- Integration with the existing AI Copilot sidebar

The existing CodeMirror editor only provides raw markdown source editing with syntax highlighting, not rich-text rendering. A separate solution was required.

## Decision

We will create a **Notes & Wiki workspace** using:

- **[TipTap](https://tiptap.dev/)** (v3) as the rich-text editor framework, built on ProseMirror
- **`marked`** for markdown-to-HTML conversion
- **`turndown`** for HTML-to-markdown serialization (Syncing TipTap output back to markdown files)
- **`lowlight`** for code block syntax highlighting inside the rich editor
- A **dedicated layout component** (`NotesLayout.svelte`) with a CSS grid substrate, similar to how `ClassicIdeLayout` is conditionally rendered for the `code` template

### Architecture

1. **Layout routing**: The `notes` template ID triggers conditional rendering of `<NotesLayout />` in `+page.svelte`, analogous to the `code` → `<ClassicIdeLayout />` pattern.

2. **Component breakdown**:
   - `NotesLayout.svelte` — CSS grid container, state owner (folder loading, file selection, debounced save)
   - `NotesSidebar1.svelte` — Folder vault panel (lists subdirectories of the workspace root)
   - `NotesSidebar2.svelte` — File list panel (shows `.md` files in selected folder)
   - `NotesEditor.svelte` — Split-pane TipTap WYSIWYG with toolbar and slash commands
   - Sidebar 3 area — embedded existing `AIChat`, `ModelMarketplace`, `SkillsMarketplace` with tab switching

3. **Markdown sync**: TipTap stores content as ProseMirror nodes. When the content changes, `turndown` converts the HTML back to markdown, which is saved to the `.md` file on disk with 800ms debounce. When switching files, `marked` converts the file's markdown content to HTML for TipTap.

4. **Slash commands**: A custom TipTap `Extension` using `@tiptap/suggestion` renders a floating menu when the user types `/` at the start of a line. It provides 13 commands (headings, formatting, lists, blockquote, code block, table, divider).

5. **View modes**: The editor pane supports three view toggles — split (default), raw-only, and rich-only — controlled by `ViewMode` state.

6. **Template entry**: Registered as the `notes` template in `templates.ts`, selectable from the Template Gallery with a markdown icon.

7. **Dependency boundary**: TipTap, its extensions, Turndown, and the selected Highlight.js grammars load on first rich-editor use. `createLowlight` remains a static *named* import so the bundler can tree-shake the package's `all` and `common` grammar barrels; the application registers only JavaScript, TypeScript, Python, Rust, Bash, JSON, CSS, XML/HTML, YAML, Markdown, SQL, and Go.

8. **Lossless metadata boundary**: `notes/frontmatter.ts` preserves the opening YAML block byte-for-byte while the rich editor rewrites only the markdown body.

9. **Recoverable autosave**: the pending `{ path, content }` payload remains buffered until `writeFile` succeeds. Failures expose dirty/error state and Retry instead of clearing the only recoverable copy.

## Consequences

### Positive
- True rich-text editing with formatting toolbar, mouse-driven selection, and WYSIWYG output
- Slash-command menu for power users to quickly insert blocks without leaving the keyboard
- Split-pane view satisfies both "I want to see the raw markdown" and "I want to see the rendered output" workflows
- Reuses the existing AI Chat, Models, and Skills panels in the right sidebar, maintaining UI consistency
- Files remain as plain `.md` on disk — no lock-in to a proprietary format
- TipTap's extension ecosystem is large (tables, task lists, highlight, images, links, etc.) — future extension is straightforward

### Negative
- Rich editing still requires a deferred runtime download for TipTap, its extensions, Turndown, and the selected syntax grammars
- Two-way markdown sync (TipTap HTML ↔ markdown string) is lossy for some edge cases (complex nested tables, inline HTML in markdown)
- TipTap v3 is relatively new and the Svelte ecosystem integration is community-driven
- The grid layout is fixed (not user-resizable like the canvas tile system) — future work may need to make panels draggable

### Neutral
- The layout pattern (conditional routing per template ID) is already established by ADR-010
- The `.md` files in the vault folder are the single source of truth — TipTap is just an editing surface
- Auto-save with debounce balances responsiveness with write amplification
- Notes layout geometry has independent undo/redo history; editor content continues to use TipTap history.

---

## Alternatives Considered

### 1. Build rich-text on top of CodeMirror
Rejected: CodeMirror is fundamentally a code editor (source text), not a rich-text engine. Building ProseMirror-like block editing on top of it would reimplement most of TipTap.

### 2. Use a simpler rich-text library (Quill, TinyMCE)
Rejected: These lack the extensible Node-based block model that slash commands and structured content (tables, task lists, code blocks) require.

### 3. Keep markdown-only editing (CodeMirror + preview pane)
Considered but rejected for the MVP: the user explicitly requested TipTap-level WYSIWYG with slash commands and the extension ecosystem.

### 4. Store documents as ProseMirror JSON
Rejected: Keeping files as standard `.md` ensures interoperability with other tools and avoids format lock-in.
