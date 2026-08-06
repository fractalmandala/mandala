# Agent brief — system scan

Hand this to a fresh agent, with the target filled in. It produces data only.

---

Analyze **<module or repo>** and produce a **system scan** — a map of what the
codebase is made of and how a request travels through it: entry points, state,
services, commands, stores, IPC, external dependencies, and the user flows that
connect them.

You produce **only the data**: one JSON object matching `contract.md`. A fixed
renderer draws it. **Write no HTML or CSS.**

## Steps

1. Read the entry point. Follow its imports recursively, but only inside the
   target root plus the shared seams it actually uses. Do not recurse into
   `node_modules` or native/backend build dirs.
2. Run the recipes below and write `scan-system.json`.
3. Run `node validate.mjs scan-system.json` and fix everything it reports.
4. Report the file path and your three most important structural findings.

## Recipes

- **Layout tree** — from the entry, record every component rendered in markup
  as a `renders` edge; recurse into children inside the root. Components from
  outside become leaf nodes with `kind: "shared"` — do not expand them.
- **State** — one node per state module (`kind: "state"`). `reads` from a
  component consuming its reactive properties; `writes` from one calling its
  mutating methods.
- **Commands & navigation** — one node per registered command, keybinding as a
  tag. `commands` edges to what they invoke. `navigates` for anything switching
  module, view, tab or panel visibility.
- **IPC / network** — one node per backend command or endpoint crossing a
  process or network boundary, with a one-line summary of what it does. `ipc`
  or `calls` edges from each call site.
- **Services** — the internal business-logic modules the project owns
  (billing, ingestion, workers, domain services). Put the interesting sentence
  on the **edge**, not the node: "charges Stripe on trial end".
- **Functions** — only genuinely shared logic. Skip trivial utilities.
- **Groups** — 2–5 swim lanes named the way the team would say them.
- **Flows** — the 3–8 most telling journeys, each an ordered list of node IDs
  from trigger to final effect. Triggers must be real affordances you saw in
  code — a button, keybinding, route, palette entry, cron. Never invent one.
- **Cross-module** — another module you touch is ONE node with
  `kind: "external"`. Do not expand it.

## Exclude

Styles, tests, stories, type-only files, barrel re-exports with no logic,
anything under ~15 lines that adds no structure.

## Caps

nodes ≤ 80, edges ≤ 200, flows ≤ 10, notes ≤ 8. `detail` only for the ~15
highest-degree nodes. Labels ≤ 28 chars, `sub` ≤ 40, edge labels ≤ 24. Every
path repo-relative with forward slashes.

## Rules

- Node IDs are stable and unique; prefix by kind (`cmp:`, `state:`, `cmd:`,
  `ipc:`, `fn:`, `svc:`, `ext:`) or use the repo path.
- `kind` and `group` must agree. Every edge endpoint and flow step must exist.
- **Ground everything in code you actually read.** If you are unsure an import
  is used at runtime, leave it out. Never invent files, commands or flows.
- Set `sourceRef` on internal nodes so teammates can jump to the code.
- `notes` must be structural and evidence-based — "layout renders 9 children
  directly", "state written from 7 components", "zero IPC, frontend-only".
- Do **not** compute scores, risk or rankings. The renderer does that uniformly.
- Use today's date for `project.date`.