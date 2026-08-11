---
id: dev
title: Dev Area
type: area
tags: [dev, state, modules, codegraph, visualization, graph-reports]
relates_to: [ADR-041, ADR-042, graph-reports, add-a-module-graph-report]
summary: Covers modules/dev/** including the manifest-driven DevLayout, its undoable selection state, and Dev graph report visualizations.
updated: 2026-07-18
---

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
