---
id: dev
title: Dev Area
type: area
tags: [dev, state, modules, codegraph, visualization, graph-reports]
relates_to: [ADR-041, ADR-042, graph-reports, add-a-module-graph-report]
summary: Covers modules/dev/** including the manifest-driven DevLayout, its undoable selection state, and Dev graph report visualizations.
updated: 2026-07-18
---

# Dev Area

## Purpose & boundaries

The Dev area houses development utilities and visualization tools inside `src/lib/modules/dev/`. Currently, it provides:
- **DevLayout**: A manifest-driven shell layout. Every `devItems.json` entry is listed in the left sidebar and opens one exclusive view in the central slot.
- **Graph reports**, each a self-contained `<name>graph.svelte` + `<name>graph.sass` pair in `components/` and `styles/`:

| Item | Report | Component | Origin |
|---|---|---|---|
| item1 | Code Graph | `codegraph.svelte` | Module-flow scan of the IDE module |
| item2 | Agent Graph | `agentgraph.svelte` | Module-flow scan of the AI module |
| item3 | Design Graph | `designgraph.svelte` | Module-flow scan of the designer module |
| item4 | Media Graph | `mediagraph.svelte` | Module-flow scan of the media module |
| item5 | Notes Graph | `notesgraph.svelte` | Module-flow scan of the notes module |
| item6 | Health Graph | `healthgraph.svelte` | Split from `app-report-health.html` (d3 treemap) |
| item7 | Flow Graph | `flowgraph.svelte` | Split from `app-report-flow.html` (ELK graph) |
| item8 | Atlas Graph | `atlasgraph.svelte` | Split from `app-report-atlas.html` (corpus atlas) |
| item9 | Wiki Graph | `wikigraph.svelte` | Split from `app-report-wiki.html` (constellation) |

`devItems.json` currently exposes item IDs 1–7 (Code, Agent, Design, Media, App Health, App Visually, and Notes) and item 8 (Meet the Team). `DevLayout` maps these IDs respectively to `codegraph`, `agentgraph`, `designgraph`, `mediagraph`, `healthgraph`, `flowgraph`, `notesgraph`, and `meetTheTeam`. The Atlas and Wiki report components remain available but are not exposed until they are added to the manifest.

## Report pipeline

- **Module-flow scans** (item1–item5) embed contract-v1 JSON (see [ADR-041](../adr/ADR-041-module-flow-scan-contract.md)) produced by scanner agents; the reports consumed live in `src/lib/data/module-report-*.json`, working copies in `docs/context-temporary/scan3-*.json`. All five share one identical stylesheet (the `.ahs` registry, copied per report).
- **Split reports** (item6–item9) are converted from standalone HTML by `docs/context-temporary/split-report.mjs` (see [ADR-042](../adr/ADR-042-dev-graph-gallery-and-report-splitting.md)): scoped sass, fixed→absolute chrome, container-relative mouse math, CDN loaders. Ported JS runs under `// @ts-nocheck` with runtime verification via each page's `#err` trap.
- Styling for all nine is documented in [graph-reports](../design/graph-reports.md); the token rule is owner-exempted here, indented SASS and `index.sass` aggregation are not.

## Wiring

Sass registrations live in `src/lib/styles/index.sass`. Item buttons and render slots live in `DevLayout.svelte`: `selectAndOpen(item.id)` toggles the selected manifest item, while `selectedItem` conditionals render its central component. The shared `mountIn` action moves each module-flow graph's `.ahs-side` inspector into DevLayout’s right pane, so the central area is dedicated to the interactive canvas. `Devlauncher` and `DevLayout` share the same Dev state, so the header controls operate the rendered panes. The repeatable playbook is [add-a-module-graph-report](../guides/add-a-module-graph-report.md).

## State & persistence

- **Dev State**: `state/dev.svelte.ts` owns and persists the selected graph plus both sidebar layouts. `DevLayout.svelte` consumes this shared state directly, so hot reloads retain the active graph.
- **Template persistence**: `dev` is a registered app-template id, so HMR reconstruction restores the Dev workspace instead of falling back to the home workspace.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`agentgraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/agentgraph.svelte) | agentgraph.svelte |
| [`atlasgraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/atlasgraph.svelte) | @ts-nocheck — ported legacy renderer, checked at runtime via #err |
| [`codegraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/codegraph.svelte) | codegraph.svelte |
| [`designgraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/designgraph.svelte) | designgraph.svelte |
| [`devlauncher.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/devlauncher.svelte) | devlauncher.svelte |
| [`flowgraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/flowgraph.svelte) | @ts-nocheck — ported legacy renderer, checked at runtime via #err |
| [`fractalsveltegraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/fractalsveltegraph.svelte) | The input JSON data loaded as static constant |
| [`healthgraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/healthgraph.svelte) | @ts-nocheck — ported legacy renderer, checked at runtime via #err |
| [`mediagraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/mediagraph.svelte) | mediagraph.svelte |
| [`notesgraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/notesgraph.svelte) | notesgraph.svelte |
| [`reportgraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/reportgraph.svelte) | reportgraph.svelte |
| [`wikigraph.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/wikigraph.svelte) | @ts-nocheck — ported legacy renderer, checked at runtime via #err |
| [`devItems.json`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/devItems.json) | devItems.json |
| [`DevLayout.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/DevLayout.svelte) | DevLayout.svelte |
| [`devmodels.json`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/devmodels.json) | devmodels.json |
| [`meetTheTeam.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/items/meetTheTeam.svelte) | meetTheTeam.svelte |
| [`dev.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/state/dev.svelte.ts) | dev.svelte.ts |
| [`developer.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/state/developer.svelte.ts) | Keep PanelId as the type for resizable panels. |
| [`atlasgraph.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/styles/atlasgraph.sass) | atlasgraph — split from app-report-atlas.html (scoped, fixed→absolute for chrome) |
| [`codegraph.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/styles/codegraph.sass) | codegraph.sass |
| [`devitems.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/styles/devitems.sass) | devitems.sass |
| [`flowgraph.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/styles/flowgraph.sass) | flowgraph — split from app-report-flow.html (scoped, fixed→absolute for chrome) |
| [`fractalsveltegraph.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/styles/fractalsveltegraph.sass) | fractalsveltegraph.sass |
| [`healthgraph.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/styles/healthgraph.sass) | healthgraph — split from app-report-health.html (scoped, fixed→absolute for chrome) |
| [`wikigraph.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/styles/wikigraph.sass) | wikigraph — split from app-report-wiki.html (scoped, fixed→absolute for chrome) |

<!-- filetable:end -->
