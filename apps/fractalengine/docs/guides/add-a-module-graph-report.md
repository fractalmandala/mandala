---
id: add-a-module-graph-report
title: Adding a Module Graph Report
type: guide
tags: [dev, visualization, guide, graph-reports]
relates_to: [ADR-041, ADR-042, graph-reports, dev]
summary: Playbook for producing a new Dev Area graph report — either a module-flow scan (agent JSON + data swap) or a standalone HTML report (split-report.mjs conversion) — and wiring it as an exclusive DevLayout item.
updated: 2026-07-18
---

# Adding a Module Graph Report

Every visual report in the Dev Area is a self-contained pair: `<name>graph.svelte` in `src/lib/modules/dev/components/` and `<name>graph.sass` in `src/lib/modules/dev/styles/`, wired as an exclusive `itemN` in [DevLayout.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/DevLayout.svelte). There are two production flows depending on the report's origin. Decisions: [ADR-041](../adr/ADR-041-module-flow-scan-contract.md) (scan contract), [ADR-042](../adr/ADR-042-dev-graph-gallery-and-report-splitting.md) (component pairs + pipeline). Styling rules: [graph-reports](../design/graph-reports.md).

## Flow A — module-flow scan (new module graph)

Use this to graph a workspace module's routing, components, state, commands, and IPC.

### 1. Run the scanner agent

Hand a fresh agent the module-flow scanner prompt (the one that produced `src/lib/data/module-report-code.json` and siblings). It studies one module and writes a contract-v1 JSON: seven swim-lane groups, prefixed node ids (`cmp:`, `state:`, `cmd:`, `ipc:`, `fn:`, `shared:`, `ext:`), typed edges, ordered flows, grounded notes. Caps: ≤70 nodes, ≤180 edges, ≤8 flows, ≤6 notes.

### 2. Validate the JSON

```bash
node -e "
const d = require('./src/lib/data/module-report-<module>.json');
const ids = new Set(d.nodes.map(n => n.id));
const KINDS = ['renders','imports','reads','writes','calls','commands','dispatches','listens','ipc','navigates'];
const bad = [];
for (const e of d.edges) {
  if (!ids.has(e.from) || !ids.has(e.to)) bad.push('dangling edge ' + e.from + '->' + e.to);
  if (!KINDS.includes(e.kind)) bad.push('unknown kind ' + e.kind);
}
for (const f of d.flows) for (const s of f.steps) if (!ids.has(s)) bad.push('dangling flow step ' + s);
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
console.log('ok:', d.nodes.length, 'nodes,', d.edges.length, 'edges,', d.flows.length, 'flows');
"
```

The renderer re-validates with `validateScan()` on load, but fix violations in the JSON — the header badge is a progression, not a pass.

### 3. Generate the component pair

Copy [codegraph.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/components/codegraph.svelte) to `<name>graph.svelte` and replace only the `DEFAULT_DATA` block (starts at `const DEFAULT_DATA = `, ends at the closing `};`) with the new JSON. Copy [codegraph.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/dev/styles/codegraph.sass) to `<name>graph.sass` verbatim — all five module graphs share this stylesheet. Do not rename the `.ahs` classes; the sass and markup must stay identical across module graphs.

## Flow B — standalone HTML report (existing .html artifact)

Use this to bring an existing standalone report (like the health treemap or ELK flow graph) in-app.

### 1. Add a job config to the splitter

Edit `docs/context-temporary/split-report.mjs` and add a job: input HTML path, output component/sass names, the data extraction markers (`dataId`, `dataLine`), the `cdn` array, `fixedToAbsolute` selectors for layout chrome, and any `cssPatches` / coordinate patches (`innerWidth` → container-relative, `clientX/Y` → `getBoundingClientRect()`-local, window resize → `ResizeObserver`).

### 2. Run the splitter

```bash
node docs/context-temporary/split-report.mjs
```

It writes the `.svelte` (legacy JS wrapped in `onMount` under `// @ts-nocheck`, JSON inlined as `const DATA`) and the `.sass` (every rule scoped under a per-report root class like `.<name>graph`). Verify no unscoped global selectors survive — they would restyle the whole app after aggregation.

## Wiring (both flows)

1. **Register the sass**: add `@use '../modules/dev/styles/<name>graph'` to [index.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/index.sass) after the existing graph lines (currently lines 46–54).
2. **Import in DevLayout**: add `import <Name>graph from '$lib/modules/dev/components/<name>graph.svelte'` alongside the existing graph imports (lines 7–15).
3. **Add the sidebar item**: copy an existing exclusive item block (the `{#if selectedItem !== 'itemN'}` open button + close button pair) and renumber to the next free `itemN`.
4. **Add the render slot**: add `{#if selectedItem === 'itemN'}<<Name>graph/>{/if}` in the central slot next to the existing slots (around lines 212–229).

## Verification

```bash
pnpm exec sass --no-source-map src/lib/modules/dev/styles/<name>graph.sass /tmp/x.css   # sass compiles
pnpm check                                                                              # 0 errors / 0 warnings
pnpm docs:filetables                                                                    # refresh file tables
pnpm vitest run tests/unit/docs-contracts.test.ts                                       # index coverage
```

Then open the Dev Area in the running app and click the new item; for split reports, check the `#err` trap stays empty and tooltips follow the mouse inside the container.

## Documentation closeout

Per AGENTS.md rule 10: update `docs/areas/dev.md` (report inventory), record styling in `docs/design/graph-reports.md`, and regenerate the affected `docs/INDEX.md` rows via `agents/skills/doc-frontmatter`.
