---
id: graph-reports
title: Graph Report Styling
type: design
tags: [dev, visualization, sass, graph-reports, token-exemption]
summary: Styling reference for the nine Dev Area graph reports — the shared .ahs module-graph class registry, the four scoped standalone-report roots, palettes, keyframes, and the owner-granted token exemption.
relates_to: [ADR-041, ADR-042, 11-style-aggregation, dev]
updated: 2026-07-18
---


Styling reference for the nine visual reports in the Dev Area (`src/lib/modules/dev/`). These are dev-only diagnostic visualizations. **The two-layer token rule does not apply to them** — the owner explicitly waived it ("design and styling however you like") so each report can use a fixed dark diagnostic palette. Two rules still apply without exception: classic single-tab indented SASS, and aggregation through `index.sass` (no `<style>` blocks in components). Decision records: [ADR-041](../adr/ADR-041-module-flow-scan-contract.md), [ADR-042](../adr/ADR-042-dev-graph-gallery-and-report-splitting.md).

## The two styling families

| Family | Reports | Stylesheet(s) | Scoping root |
|---|---|---|---|
| Module-flow graphs | Code, Agent, Design, Media, Notes | `codegraph.sass` + 4 identical copies (524 lines each) | `.ahs` |
| Split standalone reports | Health, Flow, Atlas, Wiki | `healthgraph.sass` (483), `flowgraph.sass` (493), `atlasgraph.sass` (296), `wikigraph.sass` (243) | `.healthgraph`, `.flowgraph`, `.atlasgraph`, `.wikigraph` |

Every selector in all nine stylesheets carries its scoping root class, so aggregation through `index.sass` cannot leak into app chrome. Registration lives at `index.sass` lines 46–54, one `@use` per report.

## Module-flow family — the `.ahs` registry

The five module graphs (Code, Agent, Design, Media, Notes) share one stylesheet verbatim: `codegraph.sass`, copied per report so each pair stays self-contained (see [ADR-042](../adr/ADR-042-dev-graph-gallery-and-report-splitting.md)). It was originally authored as `apphealth.sass` (539 lines) for the `AppHealthScan` renderer.

| Class | Role |
|---|---|
| `.ahs` | Report root; dark canvas, absolute-positioned SVG + node layers |
| `.ahs-header` | Top chrome: title, module badge, validation badge, stats |
| `.ahs-toolbar` | Search box, edge-kind legend filters, fit / reset buttons |
| `.ahs-lane` / `.ahs-lane-label` | Swim-lane column backgrounds and group headers |
| `.ahs-node` | Node card (184×46), colored left border by group |
| `.ahs-node.dimmed` | Non-adjacent node during hover spotlight |
| `.ahs-node.selected` | Selection ring feeding the detail panel |
| `.ahs-edge` | Bezier edge path, colored by kind, animated dashes during flow playback |
| `.ahs-flow` | Flow playback bar: step badges, play/pause, progress |
| `.ahs-side` | Detail panel: path, loc, summary, tags, adjacency; vertically scrollable |
| `.ahs-badge` | Contract-validation violation badge in the header |

### Palettes (TypeScript-owned, not SASS)

Node group and edge colors live in `graphLayout.ts` so the SVG renderer can read them; SASS only consumes them via inline styles.

Group colors — `GROUP_COLORS`, `graphLayout.ts:18`:

| Group | Hex |
|---|---|
| layout | `#a78bfa` |
| components | `#60a5fa` |
| shared | `#94a3b8` |
| state | `#22d3ee` |
| commands | `#34d399` |
| ipc | `#fb7185` |
| external | `#fbbf24` |

Edge colors — `EDGE_COLORS`, `graphLayout.ts:41`:

| Edge kind | Hex | | Edge kind | Hex |
|---|---|---|---|---|
| renders | `#8b5cf6` | | dispatches | `#fb7185` |
| imports | `#64748b` | | listens | `#f472b6` |
| reads | `#22d3ee` | | ipc | `#f43f5e` |
| writes | `#f59e0b` | | navigates | `#38bdf8` |
| calls | `#c084fc` | | commands | `#34d399` |

Layout constants (`CARD_W` 184, `CARD_H` 46, column gap 88, row height 64) sit directly below the color tables in the same file.

### Keyframes

`ahs-dash` (`codegraph.sass:245`) — marching dashes on edges during flow playback.

## Split standalone reports — scoped roots

The four standalone HTML reports were converted by `docs/context-temporary/split-report.mjs` (see [ADR-042](../adr/ADR-042-dev-graph-gallery-and-report-splitting.md)). Each conversion rewrote every CSS rule under the report's root class, converted layout chrome from `position: fixed` to `absolute` (mouse-following tooltips stay `fixed`), and preserved the original keyframes:

| Stylesheet | Root | Keyframes |
|---|---|---|
| `healthgraph.sass` | `.healthgraph` | `tile-in` (:317), `flash` (:348), `pulse` (:463) |
| `flowgraph.sass` | `.flowgraph` | `node-in` (:185), `spin-ring` (:280), `fade-in` (:290), `flow` (:330), `pulse` (:478) |
| `atlasgraph.sass` | `.atlasgraph` | `atlas-spin` (:278) |
| `wikigraph.sass` | `.wikigraph` | `wiki-spin` (:220) |

`pulse` exists in both `healthgraph.sass` and `flowgraph.sass` but is scoped under different roots, so no collision occurs after aggregation.

## Rules for new reports

1. Pick a unique root class (`.<name>graph`) and scope every selector under it.
2. Ship a `<name>graph.svelte` + `<name>graph.sass` pair under `src/lib/modules/dev/`; register the sass in `index.sass` after line 54.
3. Indented SASS, single-tab indent, no braces/semicolons — even though tokens are waived.
4. Never introduce global element selectors (`header`, `button`, `h1`) unscoped; the splitter rejects them.
5. Follow the full wiring playbook in [add-a-module-graph-report](../guides/add-a-module-graph-report.md).
