# Handoff — Graph Visualization Session → FractalEngine Repo Work

**Read this first if you're Kimi opening a fresh chat in this repo.** It carries forward a
2026-07-18 late-night session (~00:45–03:15 IST) so you don't start cold. Deeper detail lives
in long-term memory (`entities/projects/fractalengine-graph-visualizations.md`).

## What happened

Amrit (the owner) had five self-contained HTML graph visualizations built from JSON exports
of this repo and of `bodhaNew2`. All deliverables live in
`/Users/amrit/Documents/kimi/workspace/`:

- `foglamp-scan/index.html` — ELK-layout replica of the foglamp.dev codebase-scan renderer (from `docs/archive/scanner.json`)
- `health-scan/index.html` — d3 treemap heatmap, churn × complexity (from `docs/archive/scanner2.json`)
- `wiki-atlas/index.html` — canvas constellation of 1,265 communities (from `docs/archive/graph.json`, 24 MB)
- `bodha/index.html` — "Bodha Mandala": radial map of bodhaNew2's knowledge data with animated path tracing
- `fractal/index.html` — "Corpus Atlas": THIS repo's 12 doc-corpus scans (`docs/archive/scans/newgraphs/json00–json12.json`) merged into one graph — 515 nodes, 911 edges, 35 bridge nodes, 29 pattern hubs

## Rules Amrit works by (he enforces them)

1. **No screenshots or image-based verification.** Verify pages with headless Chrome
   `--dump-dom` + assertions written into the page's hidden `#err` div; inject test scripts
   into a `/tmp` copy, never into the deliverable.
2. Deliverables are **one self-contained `index.html`** — data injected inline
   (escape `</script>` as `<\/script>`), CDN fonts/scripts OK, **no npm/build tooling**.
3. Canvas init order is `resize(); fit(); draw();` — never `fit()` before real dimensions
   exist (this exact bug shipped once: graph drawn at scale 0, "out of frame, can't click").
4. Test interactions with **synthetic pointer events** at a node's projected screen
   position; calling panel functions directly does not exercise the pick/transform code.
5. Copy outside files into the workspace before operating on them.
6. He runs sprint timers with theatrical deadlines. Early delivery is celebrated;
   if you need more time, ask for a specific number of minutes.

## Repo facts worth knowing

- ADR-001: Tauri + SvelteKit. ADR-023: IDE module extraction + kernel deferral.
- `docs/plans/AI-MODULE-PLAN.md`, `docs/design/` (two-layer token system), Bits UI and
  PaneForge reference notes, UI-inspiration images (Serum synth, sidebar tabs).
- Doc-corpus scans type entities as document/concept/code/rationale/paper/image and edges
  as references/cites/implements/calls/shares_data_with, confidence EXTRACTED or INFERRED.
  `json00.json` is the chunk→files manifest. 29 hyperedges name cross-cutting patterns.
- Top hub in the merged corpus graph: `ipc.ts` (IPC Gateway), degree 19.

## If he asks for "the uncharted panel"

bodhaNew2's `paths.json` has 73 steps; only 19 resolve to nodes in any dataset — the 54
others are articles not yet in the graph (shown as ghost waypoints in the mandala). He was
offered a panel listing them grouped by path as a "roadmap of the unmapped" and didn't take
it — revive only if he asks.
