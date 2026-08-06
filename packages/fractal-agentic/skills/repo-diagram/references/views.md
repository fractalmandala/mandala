# The four views

One renderer, one contract. What differs is the node vocabulary, where the data
comes from, and the ELK preset. Presets live in `toolkit/src/layout.js`.

---

## `layout` — where code lives

**Question:** what is in here, how is it organised, and what is it styled with?

**Nodes:** `package`, `dir`, `stylesheet`. Directory granularity unless the
repo is under ~150 files.
**Edges:** `import:*` and `style:*`, both secondary — they annotate the
picture, they don't drive it.
**Source:** `extract.mjs`. Generated; regenerate in CI.

**ELK:** top level `layered`/`RIGHT` with `hierarchyHandling:
SEPARATE_CHILDREN`; each container `rectpacking`, `aspectRatio 1.7`.

> Do **not** use `INCLUDE_CHILDREN`. It routes cross-hierarchy edges through
> the layout engine and sprays children across enormous containers. Packing
> each container independently is what keeps boxes readable at depth.

**Must include the style layer.** People open a layout scan to change
something, and usually the thing they want to change is visual. See the style
section of `contract.md`.

**Route maps are this view**, with containment taken from URL segments instead
of directories. Don't build a separate type for it.

---

## `system` — what it's made of, and how a request travels

**Question:** what are the moving parts, what talks to what, and what happens
when a user does X?

**Nodes:** `entry`, `cron`, `service`, `state`, `command`, `ipc`, `store`,
`component`, `function`, `shared`, `external`, `tool`, `integration`, `model`,
`agent`. Logical, not physical: "Billing service", not `src/services/`.
**Edges:** `renders` `reads` `writes` `calls` `commands` `dispatches` `listens`
`ipc` `navigates` `triggers` `uses` `transforms`. **Put the interesting
sentence on the edge** — "charges Stripe on trial end" belongs on the
connection, not in a node's detail.
**Groups:** swim lanes, by domain the way a team would say it ("Billing",
"Ingestion"), not by file layout. 2–5 lanes.
**Flows:** 3–8, and this is the view where they matter most.
**Source:** an agent reading the code — see `system-scan-prompt.md`. Editorial.

**ELK:** `lanes` preset — root `layered`/`DOWN` so lanes stack, each lane
`layered`/`RIGHT` so its nodes read left to right.

Frameworks that declare their own wiring are worth special-casing, because the
edges become facts rather than guesses:

- **SvelteKit** — `+page.server.ts` → `+page.svelte` is a typed data edge; form
  actions and remote functions are named round-trips; runes give real state
  nodes (`$state` a source, `$derived` a computed node, `$effect` a sink)
- **Tauri / Electron** — the `invoke` command registry is a complete `ipc` edge
  list, and it is the highest-value edge set in a desktop app because a static
  import graph says nothing about it
- **Next.js** — server components → client components, server actions

---

## `boundary` — who may depend on whom

**Question:** are we leaking across architectural layers?

**Nodes:** ~a dozen `layer` nodes, **declared** in `.repograph/boundary.json` —
never inferred. Inferring them from the code makes every violation invisible by
definition.
**Edges:** `allowed` in grey, `violation` in red, weighted by import count.
**Source:** rules file + `boundary.mjs`. Generated.

**ELK:** `layout` preset; the graph is small.

This is the one view that can fail a build — `boundary.mjs` exits non-zero when
violations exist. The picture explains the failure; it doesn't detect it.

---

## `health` — where risk concentrates

**Question:** which files change often *and* are hard to change safely?

**No nodes, no edges.** A health scan is a metric heat map; forcing it into a
graph would be a category error. It carries `files[]` instead, and gets the
treemap canvas: area = LOC, colour = churn × complexity ranked within the repo.
**Source:** `health.mjs` — one `git log --numstat` pass plus a branch-token
density proxy over the worktree. Language-agnostic.

Needs real history. A `--depth 1` clone yields one commit and a meaningless
scan; clone fully before running.

Notes must come from the numbers: "3 files absorb 58% of churn",
"19 high-churn files have a single author", "high complexity + zero churn =
stable but expensive when you finally must touch it". No vague advice.

---

## Cross-view linking

Views connect through **shared node IDs, never a shared canvas**. If
`apps/web/components/auth` is the same ID in the layout scan and in three
system flows, any view can offer "appears in 4 scans". Emit an `index.json`
mapping node ID → scan files when producing a set.

That gives whole-system navigability without ever drawing the whole system.