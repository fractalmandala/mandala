---
id: 18-workspace-shell
title: Shared Workspace Shell
type: design
tags: [shell, layout, panes, motion, sass, tokens]
summary: Defines the shared workspace shell's surface hierarchy, resize affordances, and reduced-motion-safe pane transition language.
relates_to: [01-tokens, 04-layout-system, 06-animations, ADR-003, ADR-046]
updated: 2026-07-22
---


**Sources:**

- [`workspaceLayout.svelte.ts`](../../src/lib/state/workspaceLayout.svelte.ts)
- [`WorkspaceShell.svelte`](../../src/lib/components/shell/WorkspaceShell.svelte)
- [`_workspace-shell.sass`](../../src/lib/styles/components/_workspace-shell.sass)

## Surface hierarchy

The shell composes a primary navigation surface, optional secondary navigation surface, central workspace, and optional inspector.

## Semantic tokens

`_tokens.sass` exposes the shell's semantic surface, divider, focus, and motion tokens. Components consume only these semantic values; theme variants may remap the underlying surfaces without changing shell selectors.

## Motion language

- Pane collapse/expand: `flex-grow` transitions over `--shell-motion-duration` with `--shell-motion-ease`.
- Header collapse controls: left-side workspace surfaces use the shared `sidebarL.svelte` icon and right-side workspace surfaces use `sidebarR.svelte`, both driven by the active profile's collapsed state.
- Resizing: transitions turn off while a Paneforge resizer has pointer capture.
- Split containment: every pane has a zero minimum size and clips overflow, so canvases cannot visually spill into an adjacent allocated surface.
- Profile topology: three-surface profiles render exactly three Paneforge panes; the optional left-secondary pane exists only for four-surface profiles, so the right resizer always borders the center and inspector panes.
- Feedback: divider lines brighten to `--shell-divider-active` on hover, drag, and keyboard focus.
- Accessibility: `prefers-reduced-motion` disables pane and navigation-control transitions.

## Profile composition

| Profile | Surfaces | Initial purpose |
|---|---|---|
| Notes | left, left-secondary, center, right | Vault navigation, file list, editor, AI work panel |
| Dev | left, center, right | Tool selector, graph canvas, graph inspector |
| Code | left, center, right | Explorer, editor/terminal workspace, copilot and browser utilities |
| Design | left, center, right | Layers/components, canvas, style/export/AI inspector |
| Agent | left, center, right | Session navigation, conversation, work panel |
| Media | left, center, right | Library navigation, media grid, inspector |
| Docs | left, center, right | Documentation tree, rendered content, outline |
