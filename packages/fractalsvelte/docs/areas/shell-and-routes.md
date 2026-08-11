---
id: shell-and-routes
title: Shell and Routes Area
type: area
tags: [shell, routing, sveltekit]
relates_to: [ADR-001, ADR-005, ADR-008, ADR-015]
summary: Covers routes/**, canvas layout state, and core shell components.
updated: 2026-07-22
---

## Purpose & boundaries

The Shell and Routes area manages SvelteKit routing layouts under `src/routes/` and core shell overlays (Docks, Canvas layout tiles, settings palettes).

## State & persistence

- **Global Shell State**: `state/app.svelte.ts`, `state/shell.svelte.ts`.
- **Canvas Tile Coordinates**: `state/canvas.svelte.ts`.
- **Persistence**: Remembers active canvas tile positioning configuration.
- **Workspace profiles**: `workspaceLayout.svelte.ts` persists and isolates shell geometry for Code, Design, Agent, Media, Docs, Notes, and Dev; the header uses the active template's matching profile and surface.
- **Resize synchronization**: `WorkspaceShell` defers persisted-layout synchronization while a Paneforge divider is actively dragging, then commits one profile-local undo gesture when the drag ends.

## Extension points

- **Layout Templates**: Dock layout template collections configured in `src/lib/data/templates.ts`.

## Cross-area edges

- **Tile Hosts**: Renders individual app modules (editor, designer, notes) in custom moveable tile blocks on the spatial canvas workspace.

## Gotchas

- **Browser action styling**: Equal-width vault form actions use `.vault-row-btn--grow` instead of inline flex.
- **Template gallery**: Template icon filtering moved from inline CSS to the shared `.icon-muted` primitive.
- **Tile dock styles**: Dock icon emphasis moved from inline CSS to the shared `.icon-emphasis` primitive.
- **Module changes**: Direct module-to-module switches use the named `fractalengine-workspace` View Transition surface. Home and Blank intentionally remain instant, and reduced-motion or unsupported-webview environments fall back to an immediate swap.
- **Sidebar controls**: The active module's left-sidebar control sits in the left header group immediately before the Fracta mark; right-surface controls remain with the module action strip on the right.
- **Sidebar icon contract**: Header controls that expand or collapse left-side workspace surfaces render `sidebarL.svelte`; right-side workspace surfaces render `sidebarR.svelte`. Each receives the active profile's collapsed state so the icon animation and pane state stay aligned.
