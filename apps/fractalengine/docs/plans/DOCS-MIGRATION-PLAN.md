---
id: docs-migration-plan
title: Docs Migration Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**

# Docs System Migration — Two-Stream Execution Plan

**Repo:** `apps/fractalengine`
**Goal:** Restructure `docs/` from a file-mirroring system (83 per-file routing docs +
76 unindexed strays) into a four-layer, fully-indexed, guard-tested system that
answers *"what code do I change, where, for what?"*:

```
docs/
├── INDEX.md        single greppable manifest — now over EVERYTHING below
├── adr/            decisions (unchanged)
├── design/         styling-system reference (unchanged — already area-shaped)
├── areas/          NEW — ~12 per-module/subsystem docs, replacing routing/ (83 files)
├── guides/         NEW — task playbooks ("add a module", "add a command", …)
├── plans/          NEW — executed two-stream plans, moved from app root (immutable records)
└── archive/        NEW — historical material, indexed and marked historical
```

**This phase touches NO application code.** Docs, doc tooling (scripts + two
`agents/skills/*`), AGENTS.md, and one new guard test only. All existing app tests
must pass untouched; the phase's own regression net is the extended docs guard tests.

**Inventory at plan time (verify, don't trust):** `docs/` holds 202 md files; INDEX
governs 126 (adr 28 · design 15 · routing 83). Ungoverned: `other/` 11, `harnessing/`
49, `superpowers/` 11, `performance/` 2, `daw/` 1, `new-rules/` 1, `public/` 1,
`HISTORY.md`, plus `sidebar-tabs.png` and `.DS_Store`. App root holds ~8 plan/audit
md files (`*-PLAN.md`, `25-06-2026-code-fixing-auditing-v1.md`, `GEMINI.md`).

You are one of two agents. Operator assigns **Agent A (areas & index machinery)** or
**Agent B (guides, triage & rules)**.

- Agent A: branch `docs-areas`.
- Agent B: branch `docs-guides-triage`.
- Both branch from the same clean `master` commit; Phase 3 runs once after merge.

### Shared contract

**Frozen area list (12 docs in `docs/areas/`, exactly these ids):**

| id | Covers |
|---|---|
| `designer` | `modules/designer/**` (engine, state, components, data, styles) |
| `notes` | `modules/notes/**` + vault bridge touchpoints |
| `ide` | `modules/ide/**` (layout, editor, sidebar/tree, terminal, fileIcons) |
| `ai` | `modules/ai/**` + core `AIChat.svelte` + `components/ai-elements/**` |
| `bookmarks` | `modules/bookmarks/**` |
| `kernel` | `state/ide.svelte.ts` + the `ai/browser/settings` facades + VaultBridge seam |
| `undo-system` | `state/undoHistory.svelte.ts`, `undo.svelte.ts`, `historyClock.ts`, domain registration pattern |
| `contributions` | `state/contributions.svelte.ts`, `coreContributions.ts`, per-module `contributions.ts` pattern |
| `ipc-and-data-layer` | `ipc.ts`, `ipc-mock.ts`, `IpcApi` contract, `src-tauri/src/{storage,memory}.rs`, mock-parity rules |
| `shell-and-routes` | `routes/**`, `state/{app,shell,canvas}.svelte.ts`, Home/Tile/dock/palette/settings shell components |
| `security-boundaries` | `sanitizeHtml.ts`, keychain usage, CSP/capabilities, guard tests (mirrors ADR-028) |
| `styling-system` | thin pointer doc: how `index.sass` aggregation + module styles work, linking into `docs/design/` (which stays the deep reference) |

**Frozen area-doc template (every areas/ doc uses exactly these sections):**
frontmatter (`type: area`) → *Purpose & boundaries* → *State & persistence* (state
modules, localStorage keys, DB tables) → *Extension points* (how this area is
extended: contributions, undo domain, IPC surface) → *Cross-area edges* (documented
imports in/out, with the ADR that sanctioned each) → *Gotchas* (hand-written, mined
from routing docs) → *File table* (GENERATED — between
`<!-- filetable:begin -->`/`<!-- filetable:end -->` markers, never hand-edited).

**New frontmatter `type` values:** `area`, `guide`, `plan`, `archive` (join existing
`adr`, `design`, `routing`-to-be-retired). The frontmatter unit test's allowed-types
list is extended by Stream A.

**File-ownership manifest (disjoint):**

**Stream A owns:** `docs/areas/**` (new), `docs/routing/**` (retiring),
`docs/INDEX.md`, `scripts/generate-doc-filetables.mjs` (new),
`agents/skills/doc-frontmatter/**` (extend for new types/sections),
`tests/unit/docs-contracts.test.ts` (new), `tests/unit/frontmatter.test.ts` (extend).

**Stream B owns:** `docs/guides/**` (new), `docs/plans/**` (new), `docs/archive/**`
(new), the ungoverned directories being triaged (`other/`, `harnessing/`,
`superpowers/`, `performance/`, `daw/`, `new-rules/`, `public/`, `HISTORY.md`, stray
binaries), the app-root `*-PLAN.md`/audit md files, `AGENTS.md`,
`agents/skills/app-documenter/**` + `agents/skills/styling-docs-builder/**` (rewrite
for the area workflow).

**Neither stream touches `docs/adr/` content or `docs/design/` content** (frontmatter
`relates_to` fixes for moved paths are Phase 3). If a needed edit falls in the other
stream's set, STOP and report.

---

## Stream A — Areas & index machinery (Agent A)

Branch `docs-areas`.

### A1. Mine before you retire (the real labor — do not skip to deletion)

Read all 83 `docs/routing/*.md` grouped by target area. Extract into a scratch table
per area: hand-written insights (gotchas, invariants, "why" notes, ADR links) vs
regenerable content (file summaries, import lists — discard, the generator replaces
them). Anything that reads like a decision belongs in an ADR — flag rather than copy
(report lists flagged items; writing ADRs is not this stream's job).

### A2. Write the 12 area docs

Per the frozen template. Sources: the mined insights, the module ADRs (021–028), and
the source tree itself. *State & persistence* sections must list actual localStorage
keys and DB tables (grep, don't recall). *Cross-area edges* must name the sanctioned
ones (tileKinds→ide, AIChat→designer panels, ai→ide work-panel, notes→kernel
addLog/pushUndo, VaultBridge) with their ADRs. Keep each doc ≤ ~150 lines of prose —
altitude is the point; deep detail links to ADRs or source.

### A3. `scripts/generate-doc-filetables.mjs`

Node script, no deps: walks `src/lib/**` + `src/routes/**` + `src-tauri/src/*.rs` +
`tests/**`, assigns every file to exactly ONE area via an explicit path-prefix map
(frozen in the script, mirroring the area table above; unmatched paths fail the run
with the offending path — no silent buckets). For each area doc, replaces the content
between its `filetable` markers with a table of `path — one-liner` (one-liner = first
line comment / doc-comment of the file, else the filename). Idempotent; run via
`node scripts/generate-doc-filetables.mjs` and add a `docs:filetables` npm script.

### A4. Guard tests

Extend `tests/unit/frontmatter.test.ts` for the new `type` values. New
`tests/unit/docs-contracts.test.ts`:
1. Every `.md` under GOVERNED_DIRS has valid frontmatter AND an INDEX.md row; every
   INDEX row's path exists on disk (both directions). Ship with
   `GOVERNED_DIRS = ['adr', 'design', 'areas']` and a marked TODO — Phase 3 flips it
   to ALL of `docs/` after Stream B's triage lands.
2. Every directory under `src/lib/modules/` has a matching `areas/` doc.
3. File-table freshness: running the generator produces zero diff (execute the
   generator's assignment logic in-process and compare against the docs), and every
   path in every file table exists.
4. `docs/` contains no unindexed loose files in governed dirs (catches the next
   `.DS_Store`/stray png class).
Failure messages name the missing/stale item.

### A5. Retire `docs/routing/`

`git rm` the directory (history preserves it). Rebuild INDEX.md via the extended
`doc-frontmatter` tooling: sections for adr / design / areas (guides/plans/archive
sections will appear in Phase 3's regen after merge — leave the tooling ready for
those types). Update the INDEX header counts line.

### A6. Verify and commit

`npx vitest run` (frontmatter + docs-contracts green under the shipped
GOVERNED_DIRS) → `pnpm check` && `npx playwright test` (untouched, green — proves no
app impact) → commit with the mining table summary in the report.

---

## Stream B — Guides, triage & rules (Agent B)

Branch `docs-guides-triage`.

### B1. Guides (`docs/guides/`, `type: guide`) — distill, don't invent

Six guides, each a task playbook with exact file paths and a checklist ending in the
guard tests that verify the task:
1. `add-a-module.md` — from the AI-module and bookmarks plans: module folder shape,
   template registration **incl. both validators** (`app.svelte.ts`,
   `canvas.svelte.ts`), lazy `+page` branch, `contributions.ts`, undo domain via
   `UndoHistory.transact()`, sass registration, area-doc update.
2. `add-a-command-or-keybinding.md` — contributions registry + contract test.
3. `add-an-ipc-function.md` — gateway + mock + `IpcApi` + NATIVE_ONLY rules +
   ipc-contract test + (if native) Rust command registration.
4. `add-styles-or-tokens.md` — two-layer tokens, module sass, index.sass, style
   contracts; links into `docs/design/`.
5. `render-external-html.md` — sanitizeHtml profiles, html-boundary allowlist,
   ADR-028.
6. `write-a-two-stream-plan.md` — the house method: Phase-0 frozen contracts,
   disjoint ownership manifests, stay-behind lists, per-stream gates, Phase-3
   integration + mutation checks. Source: the seven plans this repo has executed.

### B2. Plans (`docs/plans/`, `type: plan`)

`git mv` every app-root plan (`DESIGNER-…`, `NOTES-…`, `IDE-…`, `AI-MODULE-…`,
`CONTRIBUTION-REGISTRY-…`, `UNDO-ENGINE-…`, `DATA-LAYER-…`, `SECURITY-CONTRACT-…`,
`DOCS-MIGRATION-PLAN.md` itself) into `docs/plans/`, adding frontmatter (status:
executed/active). Delete the `docs/other/` duplicates of the same plans. Plans are
immutable records — add a one-line banner: "Executed plan — kept as record; see
areas/ and guides/ for current truth."

Remaining app-root loose files, explicit dispositions:
- `25-06-2026-code-fixing-auditing-v1.md` (June audit record) → `docs/archive/`
  with `type: archive` frontmatter and an index row.
- `GEMINI.md` → STAYS at app root untouched (agent-instructions shim, like
  `CLAUDE.md`/`AGENTS.md` — not documentation).
- Anything else matching `*.md` at app root: triage with the B3 rules and list the
  decision in your report; the app root must end the phase holding only
  `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `README*` if present.

### B3. Triage the ungoverned directories (one decision each, in your report)

For each of `other/` (residue after B2), `harnessing/` (49 files), `superpowers/`,
`performance/`, `daw/`, `new-rules/`, `public/`, `HISTORY.md`: read enough to
classify → (a) still-true reference → merge into an area/guide and delete source,
(b) historical value → `docs/archive/<name>/` with frontmatter (`type: archive`) and
an index row, (c) obsolete/duplicate → delete. `daw/` likely belongs to the separate
FractalBeats project — if so, archive with a note or report for relocation. Delete
`.DS_Store`; move `sidebar-tabs.png` next to its consumer or into `archive/`. NOTHING
may remain outside governance — Phase 3 flips the guard to all of `docs/`.

### B4. AGENTS.md rewrite (exhaustive — grep `routing` in AGENTS.md and clear every hit)

At plan time the file references the routing system in exactly four places; update
all of them plus the rule links:
1. **Rule 10** (line ~21, "Document new/changed components in `docs/routing`…")
   becomes: "update the `docs/areas/` doc(s) for what you touched; add an ADR for
   decisions; update a guide if a playbook changed; run
   `tests/unit/docs-contracts.test.ts` — it enforces index coverage and file-table
   freshness. Regenerate file tables via `pnpm docs:filetables` after adding/moving
   source files."
2. **Section 2 directory entry** (line ~52, the `docs/routing/` bullet) → replaced by
   `docs/areas/` and `docs/guides/` bullets (one line each); other entries point at
   area docs, not routing docs.
3. **Section 3 rule 1** (line ~60, "Never open a file in `docs/adr/`, `docs/design/`,
   or `docs/routing/` speculatively") → same rule over `adr/design/areas/guides/
   plans/archive`.
4. **Section 3 rule 5** (line ~64, "Keep `docs/INDEX.md` in sync… `docs/routing/`")
   → same obligation over all governed dirs, and note the docs-contracts test as its
   enforcement.
5. Every rule that embeds procedural detail links to its guide (rules 6→styles guide,
   7→ipc guide, 9→undo section of add-a-module, 11→command guide, 13→html guide) —
   one source per fact.
After editing, `grep -n routing AGENTS.md` must return only hits unrelated to docs
(e.g. the ai-elements "Mermaid routing" prose) — include the residual-hit list in
your report. (`CLAUDE.md` is a shim that inlines AGENTS.md and needs no edit;
verify.)

### B5. Skills rewrite

`agents/skills/app-documenter/` re-targeted from "one routing doc per source file" to
"update the owning area doc; regenerate file tables". `styling-docs-builder`
unchanged in target (design/ stays) but references updated. Do not touch
`doc-frontmatter` (Stream A's).

### B6. Verify and commit

`npx vitest run` (existing docs tests green — your files carry valid frontmatter even
though your sections enter INDEX at Phase 3) → `pnpm check` && `npx playwright test`
(untouched) → commit. **Report must list**: the guide files, the per-directory triage
decision table, and every deletion.

---

## Phase 3 — Integration & verification (run ONCE after merge)

1. Merge `docs-areas`, then `docs-guides-triage`.
2. Run the extended `doc-frontmatter`/INDEX tooling once: full INDEX regen now
   including guides/plans/archive sections; update header counts.
3. Flip `GOVERNED_DIRS` in `docs-contracts.test.ts` to all of `docs/`; run
   `npx vitest run` — green means every doc in the repo is indexed, typed, and fresh.
4. **Mutation checks**: (a) add an unindexed `docs/scratch.md` → test fails; (b)
   delete an INDEX row → fails; (c) add a dummy `src/lib/modules/notes/x.ts` without
   regenerating file tables → freshness check fails; (d) revert each.
5. Repo-wide straggler grep: `grep -rn "docs/routing" src docs agents AGENTS.md
   CLAUDE.md` → every hit updated (ADR `relates_to` frontmatter referencing routing
   paths gets rewritten to the owning area doc) or justified in the report.
6. `pnpm check` && `pnpm build` && full `npx playwright test` — untouched and green
   (belt-and-suspenders that no app code moved).
7. Spot the reader experience: pick three tasks ("add a palette command to notes",
   "change editor tab styling", "add an IPC function") and walk INDEX → guide → area
   doc → code purely via the docs. Each walk must succeed without opening a stale
   reference. Fix what fails the walk.

## Explicitly out of scope (do not improvise)

- Any `src/` or `src-tauri/` code change; any ADR content rewrites (frontmatter
  path-fixes in Phase 3 only).
- Auto-generating prose from code beyond the file tables; doc-site tooling
  (mdBook/VitePress etc.); README/marketing docs.
- Rewriting the executed plans' content (immutable records).
- Git-history surgery on deleted docs.
