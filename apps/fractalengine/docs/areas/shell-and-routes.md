---
id: shell-and-routes
title: Shell and Routes Area
type: area
tags: [shell, routing, sveltekit]
relates_to: [ADR-001, ADR-005, ADR-008, ADR-015]
summary: Covers routes/**, canvas layout state, and core shell components.
updated: 2026-07-22
---

# Shell and Routes Area

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

## File table

## Dictation shell integration

The root layout initializes the shared dictation controller once, routes the configurable fallback shortcut, and treats Fn/Globe as a focused-window push-to-talk signal when the webview receives that key. `SettingsDialog` exposes the on-device locale and status; individual writing surfaces retain their own native undo history when final dictated text is committed.

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`focusTrap.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/actions/focusTrap.ts) | Svelte action for modal dialogs: moves focus inside on mount, cycles Tab/Shift+Tab |
| [`mountIn.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/actions/mountIn.ts) | mountIn.ts |
| [`AppDock.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/AppDock.svelte) | AppDock.svelte |
| [`apphealth.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/apphealth/apphealth.sass) | AppHealth — module flow scan renderer |
| [`AppHealthScan.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/apphealth/AppHealthScan.svelte) | AppHealthScan.svelte |
| [`graphLayout.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/apphealth/graphLayout.ts) | graphLayout.ts |
| [`index.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/apphealth/index.ts) | index.ts |
| [`sampleScan.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/apphealth/sampleScan.ts) | sampleScan.ts |
| [`types.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/apphealth/types.ts) | types.ts |
| [`Canvas.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/Canvas.svelte) | Canvas.svelte |
| [`CommandPalette.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/CommandPalette.svelte) | CommandPalette.svelte |
| [`genericlayout.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/genericlayout.svelte) | sizes = [sidebar, content, inspector] |
| [`homeaccordion.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/homeaccordion.svelte) | homeaccordion.svelte |
| [`HomeTilesLayout.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/HomeTilesLayout.svelte) | HomeTilesLayout.svelte |
| [`Minimap.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/Minimap.svelte) | Minimap.svelte |
| [`ModelMarketplace.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ModelMarketplace.svelte) | Registry records for local sidecar models — provides runnable/downloaded status (B2) |
| [`SearchOverlay.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/SearchOverlay.svelte) | SearchOverlay.svelte |
| [`SettingsDialog.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/SettingsDialog.svelte) | SettingsDialog.svelte |
| [`WorkspaceShell.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/shell/WorkspaceShell.svelte) | WorkspaceShell.svelte |
| [`SkillsMarketplace.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/SkillsMarketplace.svelte) | SkillsMarketplace.svelte |
| [`Tile.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/Tile.svelte) | Tile.svelte |
| [`TileDock.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/TileDock.svelte) | TileDock.svelte |
| [`trial.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/trial.svelte) | trial.svelte |
| [`VirtualList.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/VirtualList.svelte) | VirtualList.svelte |
| [`modelContextWindows.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/modelContextWindows.ts) | Max context-window sizes (in tokens) for known models, used as the denominator |
| [`module-report-agent.json`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/module-report-agent.json) | module-report-agent.json |
| [`module-report-code.json`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/module-report-code.json) | module-report-code.json |
| [`module-report-design.json`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/module-report-design.json) | module-report-design.json |
| [`module-report-media.json`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/module-report-media.json) | module-report-media.json |
| [`module-report-notes.json`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/module-report-notes.json) | module-report-notes.json |
| [`modules.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/modules.ts) | modules.ts |
| [`skillsCatalog.json`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/skillsCatalog.json) | skillsCatalog.json |
| [`templates.json`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/templates.json) | templates.json |
| [`templates.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/templates.ts) | templates.ts |
| [`tileKinds.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/data/tileKinds.ts) | Documented core → IDE-module edge; revisit during the future kernel decomposition. |
| [`app.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/app.svelte.ts) | app.svelte.ts |
| [`canvas.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/canvas.svelte.ts) | canvas.svelte.ts |
| [`shell.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/shell.svelte.ts) | shell.svelte.ts |
| [`+error.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/routes/+error.svelte) | +error.svelte |
| [`+layout.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/routes/+layout.svelte) | +layout.svelte |
| [`+layout.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/routes/+layout.ts) | +layout.ts |
| [`+page.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte) | +page.svelte |
| [`+page.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/routes/browser/+page.svelte) | Do not construct BrowserWindowState until the native chrome webview identifies itself. |
| [`canvas_layout.json`](file:////Users/amrit/fractals/apps/fractalengine/src/routes/canvas_layout.json) | canvas_layout.json |
| [`+page.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/routes/webfront/+page.svelte) | +page.svelte |

<!-- filetable:end -->
