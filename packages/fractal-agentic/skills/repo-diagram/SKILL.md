---
name: repo-diagram
description: Generate interactive scans of any codebase — a layout map of containment and styling, a system map of logical architecture with traceable flows, a boundary check of layer rules, or a health heat map of churn and complexity. Use when the user asks to visualize, map, diagram, chart, or scan a repo's structure, architecture, dependencies, data flow, styling, layer boundaries, or risk hotspots; when they ask "what does this codebase look like", "show me how X flows through the system", "where is the risk", "are we leaking across layers"; or when onboarding to an unfamiliar repo. Produces a self-contained interactive HTML file.
---

# repo-diagram

Four views over one contract and one renderer.

## The two rules

**You produce only the data. A fixed renderer draws the scan. Write no HTML
or CSS.** Every scan is a JSON object matching `references/contract.md`;
`build.mjs` turns it into an interactive page. The moment you hand-write markup
for a diagram you have made a one-off that nobody can regenerate, restyle, or
diff. If the renderer cannot express something, extend the renderer.

**One scan answers one question.** Never merge views onto one canvas. Two
questions means two files, cross-referenced by shared node IDs.

## The four views

Everything a codebase diagram is usually asked for collapses into these. Read
`references/views.md` before choosing.

| View | Question | Origin |
|---|---|---|
| `layout` | Where does code live, and what is it styled with? | extracted |
| `system` | What is this made of, and how does a request travel through it? | agent-authored |
| `boundary` | Who is allowed to depend on whom, and who actually does? | rules + extracted |
| `health` | Where does risk concentrate? | git history |

Deliberately **not** separate views, because each is a feature of the above:

- *route map* → a `layout` scan whose containment comes from URL segments
- *lifecycle / sequence* → a `flow` on any scan; ordered steps already do this
- *"show me the flows"* → `flows[]`, available on every graph view

## Flows and notes — use them

These are the difference between a map and an answer, and they are the most
commonly skipped part of the contract.

**`flows`** are named, ordered journeys with a real trigger. Selecting one dims
everything else, auto-expands whatever containers hide the steps, numbers the
path and fits the view. A scan with three good flows beats a scan with perfect
nesting and none. Triggers must be UI affordances you actually saw in the code
— a button, a keybinding, a route, a cron — never invented ones.

**`notes`** are grounded structural findings with a severity. "Layout renders 9
children directly — god-layout." "3 files absorb 58% of churn." "State written
from 7 components — fan-in hotspot." They let the scan assert something instead
of leaving every reading to the viewer. Ground each one in something you
measured or read; no vague advice, no rankings you invented.

## Procedure

### 1. Pick the view

From the user's actual question, using the table above. If genuinely
ambiguous, ask. Do not default to drawing everything.

### 2. Survey before extracting

- **Language and ecosystem** — what extensions carry the logic
- **Workspace layout** — monorepo or single package? read the root manifest
- **Alias config** — `tsconfig.json` paths, `jsconfig.json`, bundler aliases.
  Unresolved aliases silently become missing edges, which is worse than no diagram
- **Styling approach** — global CSS/SASS, CSS modules, utility-first, scoped
  `<style>`, or `cva`/`tv` recipes. Most repos mix two or three; the analyzer
  handles all of them at once, but you need to know what to expect
- **Scale** — under ~150 files you can work at file granularity; above that,
  directory granularity and let drilling reveal detail

### 3. Produce the scan

```bash
cd toolkit && npm install

node extract.mjs  <repo> <maxDepth> scan-layout.json    # layout
node health.mjs   <repo>            scan-health.json    # health
node boundary.mjs <repo>            scan-boundary.json  # boundary (needs rules)
# system: you write the JSON — see references/system-scan-prompt.md
```

`boundary.mjs` writes a starter `.repograph/boundary.json` and stops if no
rules exist. Rules are **declared, never inferred** — inferring them from the
code would make every violation invisible by definition.

### 4. Validate — always

```bash
node validate.mjs scan-layout.json
```

`build.mjs` refuses to render an invalid scan, but run it yourself so you see
the warnings. It catches what a diagram hides: dangling edge and flow-step IDs,
containment cycles, caps, a silently empty style layer, and import resolution
below 50% (which means alias config is being missed — fix the resolver, don't
ship it).

### 5. Render

```bash
node build.mjs scan-layout.json layout.html
```

One self-contained file, ELK and Svelte Flow inlined, no network at runtime.
Favicon domains in a scan are shown as text labels rather than fetched icons,
so the file stays offline-clean.

### 6. Verify — non-negotiable

```bash
node verify.mjs      # screenshots every built view, exercises flow selection
```

Read the screenshots. Layout bugs are invisible in the JSON. Check nesting
holds, no node escapes its parent, labels aren't truncated, flow highlighting
traces the path, no console errors. Then confirm the scan answers the question
from step 1 — if it doesn't, the problem is granularity, not styling.

## Design invariants

**Collapse by default.** Everything below the top level starts folded; a
collapsed container shows a rolled-up count. Also the performance strategy.

**Lift edges, never drop them.** Collapsing reattaches edges to the container
and sums their `weight`. Folding loses detail, never signal.

**Containment picks the layout; everything else is an overlay.** Boxes must not
move when a layer is toggled. Spatial memory is the whole value of a map.

**`group` is containment.** A system scan's swim lanes are synthesized into
parent nodes at load, so lanes reuse drilling, collapsing and edge-lifting
rather than needing their own machinery.

**Authored classes get listed; utility classes get counted.** A class is
authored if something in the repo defines it, utility otherwise. Computed, not
configured — no framework list to maintain.

**Every style fact must be reversible.** "This container uses `.card`" is half
the job; the scan must answer "if I edit `.card`, what breaks?" That reverse
index is `data.defines.consumedBy`, and it is the most useful thing on the
diagram when the reason you opened it was to change something.

**Strip scaffolding directories.** `src`, `lib`, `app` are build convention,
not architecture. Don't spend a nesting level on them.

## Generated vs editorial

`layout`, `boundary` and `health` are **generated** — the truth is mechanical.
Regenerate them in CI and treat them as disposable.

`system` is **editorial** — someone decides what matters and what to omit, and
that judgment is the value. Extracting it exhaustively produces noise. Keep the
curated scan in the repo so it can be validated: flag node IDs whose
`sourceRef` no longer resolves. Stale-scan detection is what keeps this from
becoming the wiki page nobody trusts by month four.

## Delivering into an app

This skill stops at a standalone HTML file, deliberately. Embedding a scan into
a host application — converting to a framework component, scoping its styles,
registering it in a layout, wiring a nav item — is **project-specific** and
belongs in a separate skill for that repo. Hardcoded component paths and file
line numbers go stale within weeks and are wrong in every other repo. Keep the
producer general and the delivery local; they share only the scan JSON.

## Files

- `references/contract.md` — the scan envelope every view emits
- `references/views.md` — per-view node vocabulary, ELK preset and gotchas
- `references/system-scan-prompt.md` — the agent brief for a system scan
- `toolkit/validate.mjs` — one gate for every scan
- `toolkit/extract.mjs` — layout extractor (JS/TS/Svelte/Vue/Astro)
- `toolkit/styles.mjs` — stylesheet and class-usage analyzer
- `toolkit/health.mjs` — git churn × complexity
- `toolkit/boundary.mjs` — declared rules vs actual imports
- `toolkit/src/layout.js` — ELK presets and the edge-lifting algorithm
- `toolkit/src/App.svelte` — shell: stats, flows, notes, layers, inspector
- `toolkit/src/GraphCanvas.svelte` / `TreemapCanvas.svelte` — the two canvases
- `toolkit/build.mjs` — validates, then bundles scan + renderer into one file
- `toolkit/verify.mjs` — screenshots each view