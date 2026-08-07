---
id: fractaldocs
title: FractalDocs
tags: [module, documentation, wiki, markdown, undo-redo]
relates_to: [ADR-015, ADR-026, shell-and-routes, ipc-and-data-layer, security-boundaries]
summary: Workspace documentation module with safe Markdown rendering, an accordion file tree, and resilient table-of-contents navigation.
updated: 2026-07-22
---

# FractalDocs Module

The `fractalDocs` module is the integrated workspace documentation wiki. It renders the active workspace's `/docs` tree in three panes: a collapsed-by-default navigation accordion, sanitized Markdown content, and a table of contents that scrolls the module's own content pane and updates the URL fragment.

## State Management (`docs.svelte.ts`)
The `docsState` is the centralized state controller:
- **Workspace lifecycle**: Captures the active `ideState.rootPath`, cancels stale initialization and file reads by request ID, and presents actionable empty/error states when a workspace or `/docs` folder is unavailable.
- **File tree**: Builds nested `DocsFileEntry` records using only `ipc.listDirectory()`. File labels are derived from paths, so opening the module does not read every Markdown file merely to construct navigation.
- **Rendered document contract**: `renderDocsMarkdown()` produces sanitized HTML and TOC entries in one pass. Heading labels, IDs, duplicate suffixes, and inline-Markdown text are therefore identical for the rendered document and the TOC.
- **Layout history**: `WorkspaceShell` owns persisted Docs surface sizes and collapsed state under the `docs` profile; the `docs` domain remains responsible for document state and mutations.

## Components
- **`DocsLayout.svelte`**: Owns workspace-root reinitialization and supplies the navigation, content, and outline snippets to the shared three-pane shell.
- **`DocsSidebarLeft.svelte`**: Recursively renders the docs tree as a sibling accordion: all folders start collapsed and opening one closes its sibling at the same level.
- **`DocsContent.svelte`**: Renders only the sanitized HTML prepared by state and exposes the scroll container targeted by TOC navigation. It presents loading, empty, and retryable error states.
- **`DocsSidebarRight.svelte`**: Uses the shared heading IDs to scroll the scoped content container, update the URL fragment, and expose the selected heading with `aria-current`.

## Validation Contract

`tests/unit/fractaldocs-state.test.ts` pins shared heading/TOC IDs (including inline Markdown and duplicate headings), sanitization, and filename-label behavior. Existing documentation, style-token, HTML-boundary, and undo-history contracts cover the surrounding integration points.

## File Usage in the Module

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`DocsContent.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/fractaldocs/components/DocsContent.svelte) | DocsContent.svelte |
| [`DocsLayout.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/fractaldocs/components/DocsLayout.svelte) | DocsLayout.svelte |
| [`DocsSidebarLeft.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/fractaldocs/components/DocsSidebarLeft.svelte) | DocsSidebarLeft.svelte |
| [`DocsSidebarRight.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/fractaldocs/components/DocsSidebarRight.svelte) | DocsSidebarRight.svelte |
| [`contributions.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/fractaldocs/contributions.ts) | contributions.ts |
| [`docs.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/fractaldocs/state/docs.svelte.ts) | docs.svelte.ts |
| [`_layout.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/fractaldocs/styles/_layout.sass) | _layout.sass |
| [`fractaldocs-state.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/fractaldocs-state.test.ts) | @vitest-environment jsdom |

<!-- filetable:end -->
