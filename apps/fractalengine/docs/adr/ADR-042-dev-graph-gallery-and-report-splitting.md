---
id: ADR-042
title: Adopt Self-Contained Graph Components and the HTML-to-Svelte Report-Split Pipeline
type: adr
tags: [dev, visualization, graph-components, report-split, sass, pipeline]
summary: Every visual report ships as a self-contained <name>graph.svelte + <name>graph.sass pair under modules/dev, generated mechanically (data swap or split-report.mjs) with scoped styles and container-relative coordinates, wired as exclusive DevLayout items.
relates_to: [ADR-003, ADR-041, dev, graph-reports, add-a-module-graph-report]
status: accepted
updated: 2026-07-18
---

# ADR-042: Adopt Self-Contained Graph Components and the HTML-to-Svelte Report-Split Pipeline

**Status:** Accepted
**Date:** 2026-07-18
**Decision makers:** Amrit (owner), Kimi (agent)

---

## Context

By mid-session on 2026-07-18, nine visual reports needed in-app access: five module-flow graphs (code, agent/ai, design, media, notes — the ADR-041 contract data) and four standalone HTML reports from earlier sessions (the d3 code-health treemap, the ELK codebase-flow graph, the 633 KB wiki constellation, and the 266 KB corpus atlas). The standalone HTMLs were built as full-window documents: global element selectors (`header`, `button`, `h1`), `position: fixed` chrome, mouse math in window coordinates (`innerWidth`, raw `clientX/Y`), CDN `<script>` tags, and inlined JSON data.

The Dev Area (`src/lib/modules/dev/DevLayout.svelte`) already existed as the natural home, with a sidebar that opens one item at a time into the central slot. Three forces bounded the solution. First, the owner explicitly waived the two-layer token rule for these visualizations ("design and styling however you like") while keeping the indented-SASS and no-`<style>`-block rules — so styles ship as `.sass` files aggregated through `index.sass`, which also means any unscoped global selector would restyle the entire app. Second, these are dev-only diagnostic tools: correctness of the visualization matters more than idiomatic app architecture, and hand-rewriting nine renderers in Svelte would be days of work with real regression risk. Third, everything must pass `pnpm check` and the docs-contracts tests.

---

## Decision

We will ship each report as a **self-contained component pair** — `<name>graph.svelte` in `src/lib/modules/dev/components/` and `<name>graph.sass` in `src/lib/modules/dev/styles/` — **generated mechanically rather than hand-written**, and wire them as exclusive items in `DevLayout`.

Module-flow graphs are produced by swapping the `DEFAULT_DATA` block of a proven component (`codegraph.svelte`), keeping markup, logic, and styles identical across all five. Standalone HTML reports are converted by `docs/context-temporary/split-report.mjs`, which: extracts the CSS and rewrites it as indented SASS with **every rule scoped under a per-report root class** (`.healthgraph`, `.flowgraph`, `.atlasgraph`, `.wikigraph`) so nothing leaks app-wide; converts layout chrome from `position: fixed` to `absolute` while mouse-following tooltips/popovers stay `fixed`; inlines the scan JSON as `const DATA`; wraps the legacy JS in `onMount` with dynamic CDN loading; and patches window-coordinate code — `innerWidth`/`innerHeight` sizing becomes container-relative via `canvas.parentElement` or viewport `clientWidth`, raw `clientX/Y` becomes canvas-local via `getBoundingClientRect()`, and window resize listeners become `ResizeObserver`s. Ported legacy JS runs under `// @ts-nocheck` with a note that runtime verification happens through the page's `#err` trap.

We chose this over iframing the HTML files (no asset pipeline for them, broken relative paths, sandbox friction) and over hand-rewriting each visualization idiomatically (days of effort for dev-only tooling, high regression risk against proven renders).

---

## Consequences

### Positive

- Nine reports are one click apart in the Dev Area (Code, Agent, Design, Media, Notes, Health, Flow, Atlas, Wiki) with uniform open/close wiring.
- Style isolation is mechanical and verifiable: all four split stylesheets compile clean and every selector carries the report root class, so `index.sass` aggregation cannot leak into app chrome.
- The pipeline is repeatable: a new module report is a data swap; a new HTML report is one config entry in `split-report.mjs` (markers, CDN list, fixed→absolute selectors, coordinate patches).
- `pnpm check` reports 0 errors / 0 warnings and docs-contracts 4/4 with all nine components present.

### Negative

- Two components inline very large JSON (`atlasgraph.svelte` ≈ 887 KB, `wikigraph.svelte` ≈ 266 KB), adding dev-server transform cost on first load; if it becomes painful the data should move to a fetched static asset.
- Split components depend on CDN availability at runtime (d3-hierarchy, elkjs, four d3-force packages) — offline use renders a blank report.
- Ported renderers attach some window-level listeners (pan, tooltip) that are not removed on unmount; DevLayout's exclusive-item mounting keeps this benign, but it is a known leak.
- `// @ts-nocheck` removes type safety over roughly 2,000 lines of ported JS across the four split components.

### Neutral

- `split-report.mjs` and the generated standalone `index3.html` artifacts live in `docs/context-temporary/` — they are tooling, not production code.
- The fixed→absolute selector list and coordinate patches are per-report manual configuration; a report with novel mouse math needs a human to write its patch set.
- `DevLayout` gained a simple exclusive `itemN` selection registry; there is no dynamic contribution registration for these items.

---

## Alternatives Considered

### iframe the standalone HTML files

Mount each original HTML in an iframe inside the Dev Area. Rejected because the files are not served by the app's asset pipeline (they live in `docs/`), relative font/CDN references would break or double-load, and iframe sandboxing fights the mouse-heavy interactions these reports rely on.

### Hand-rewrite each visualization in idiomatic Svelte

Port every renderer to runes-based components like `codegraph.svelte`. Rejected for cost and risk: nine rewrites is days of work for dev-only diagnostics, and each rewrite risks subtle behavior drift from the proven standalone renders. Mechanical conversion preserves the verified original logic verbatim.

### Keep reports as external HTML

Do nothing in-app and open the HTML files in a browser. Rejected because the goal of the work was in-app access — the owner moved the workflow into Svelte explicitly ("we are in svelte now").

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-003 | Two-Layer CSS Token System with Indented SASS | Modified in scope; the owner granted a one-off token exemption for these report styles, while the indented-SASS and aggregation rules still apply |
| ADR-041 | Module-Flow Scan Contract and AppHealth Renderer | Depends on; the five module `*graph.svelte` components embed ADR-041 contract data |
