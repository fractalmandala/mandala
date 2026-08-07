---
id: ADR-041
title: Adopt the Module-Flow Scan Contract and AppHealth Renderer
type: adr
tags: [module-flow, scan-contract, apphealth, visualization, dev]
summary: Defines the module-flow scan JSON contract (nodes, typed edges, ordered flows, groups) produced by scanner agents, and the single shared AppHealthScan Svelte renderer that draws any module from it.
relates_to: [ADR-003, ADR-015, ADR-042, dev, graph-reports, add-a-module-graph-report]
status: accepted
updated: 2026-07-18
---

# ADR-041: Adopt the Module-Flow Scan Contract and AppHealth Renderer

**Status:** Accepted
**Date:** 2026-07-18
**Decision makers:** Amrit (owner), Kimi (agent)

---

## Context

FractalEngine Studio has grown to five workspace modules — code (`src/lib/modules/ide`), notes, design, media, and ai — each with its own layout tree, rune-based state store, contribution-registry commands, and IPC surface. There was no way to see how a module is actually wired: which components the layout renders, who reads or writes the state store, which commands and keybindings exist, which IPC gateway functions are called, and how a real user journey (create note, autosave, search) travels through those parts.

An earlier session established a successful pattern for this class of problem: an agent studies the repository and produces only a small JSON document, and a fixed renderer draws it (the foglamp codebase scan and the code health scan, both rendered as standalone `index.html` files). Two forces shaped any new design. First, the scans are produced by separate agents that start with zero repository context, so the output contract must be fully self-describing and mechanically verifiable — the renderer can never special-case a broken scan. Second, five modules need five graphs, and the value is precisely in comparing them, so one renderer must draw all five from the same contract rather than five bespoke pages diverging per module.

The app's standing constraints also apply: Svelte 5 runes only, indented SASS, no `<style>` blocks in components, and `pnpm check` plus the docs-contracts tests must stay green.

---

## Decision

We will represent each module as a **module-flow scan JSON document (contract v1)** and render every module with a single shared renderer — the `AppHealthScan` Svelte component in `src/lib/components/apphealth/`, backed by a pure, DOM-free layout engine (`graphLayout.ts`).

The contract fixes: seven swim-lane `groups` (layout, components, shared, state, commands, ipc, external); typed `nodes` with stable prefixed ids (`cmp:`, `state:`, `cmd:`, `ipc:`, `fn:`, `shared:`, `ext:`); a closed `edges` vocabulary (`renders`, `imports`, `reads`, `writes`, `calls`, `commands`, `dispatches`, `listens`, `ipc`, `navigates`); `flows` as ordered lists of node ids whose triggers must be real UI affordances found in code; and grounded `notes`. Caps keep documents renderer-sized (≤70 nodes, ≤180 edges, ≤8 flows, ≤6 notes). Scanner agents must validate referential integrity (no dangling edge endpoints or flow steps, no unknown kinds) before writing the file, and the renderer re-validates with `validateScan()` and surfaces violations as a header badge instead of failing.

The renderer computes canonical group columns, orders components by the `renders` tree from the module's entry layout, reduces crossings with barycenter sweeps, and draws bezier edges colored by kind. Interaction includes hover spotlight with adjacency dimming, a selection detail panel, edge-kind legend filters, search, pan/wheel-zoom/fit, and flow playback that walks ordered steps with numbered badges and animated edge dashes.

We chose this over Mermaid-style static diagrams because static diagrams cannot carry flows, metadata panels, or interaction, and over five bespoke d3/ELK pages because a single contract-driven renderer keeps all five modules visually comparable and eliminates per-module rendering code.

---

## Consequences

### Positive

- All five modules render through one engine, so structural differences (god-layouts, state fan-in hotspots, IPC-heavy vs frontend-only modules) are directly comparable.
- The contract is enforceable at both ends: scanner-side validation before write, renderer-side `validateScan()` on load — a malformed agent scan degrades to a badge, never a crash.
- `graphLayout.ts` is pure TypeScript with no Svelte or DOM dependency, covered by `tests/unit/apphealth-layout.test.ts` (5 tests) including adversarial contract cases.
- Flows are first-class data, enabling animated step-through playback rather than static arrows.
- New modules or re-scans need no renderer work — only a fresh JSON.

### Negative

- Scans are point-in-time static analysis. `reads`/`writes`/`calls` edges are agent judgment from reading code, not instrumented truth; they drift as modules evolve until re-scanned.
- Large modules lose detail to the caps (≤70 nodes) — the code module already uses 31 nodes and 13 IPC calls, so growth will force pruning decisions in the scanner prompt.
- The contract lives in the scanner prompt and `types.ts`; both must be edited together, and there is no schema-version negotiation beyond the `version: 1` field.

### Neutral

- Scan artifacts live in two places: `docs/context-temporary/scan3-*.json` (working copies) and `src/lib/data/module-report-*.json` (app-consumed reports).
- The scanner prompt itself is session documentation; the repeatable playbook is captured in `docs/guides/add-a-module-graph-report.md`.

---

## Alternatives Considered

### Mermaid or static diagram exports

Generate Mermaid graphs per module and commit SVGs. Rejected because the output is non-interactive, cannot attach per-node metadata (path, loc, summary, tags), cannot replay flows, and goes stale silently — the forces behind wanting the graphs (exploration and comparison) require live filtering and hover context.

### Five bespoke d3/ELK pages

Hand-build a tailored visualization per module like the earlier foglamp and health scans. Rejected because five renderers would diverge immediately, destroying cross-module comparability, and each new module would cost a new page instead of a new JSON document.

### Prose architecture documentation only

Write per-module wiring descriptions into `docs/areas/`. Rejected as the primary mechanism because prose cannot be validated against the code and cannot be explored interactively; area docs remain useful as complements (see `docs/areas/dev.md`) but do not show the graph.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-003 | Two-Layer CSS Token System with Indented SASS | Related; the renderer's own sass follows indented SASS, though the owner granted a token exemption for these dev visualizations (see ADR-042) |
| ADR-015 | App Template Routing and Domain State Boundaries | Depends on; the module boundaries being scanned are the ADR-015 state domains |
| ADR-042 | Self-Contained Graph Components and Report-Split Pipeline | Enabled by; this contract is what the five module `*graph.svelte` components embed |
