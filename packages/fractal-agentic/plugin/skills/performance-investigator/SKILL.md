---
name: performance-investigator
description: Studies src-tauri Rust code and src TS/Svelte code to trace startup path, IPC call order, render triggers, and other performance-critical flows, then writes a thorough investigation report to docs/performance/. Invoke when the user asks to audit loading speed, document app startup, profile runtime performance, or investigate why something feels slow (e.g. "document app's loading speed", "performance audit", "what runs at startup?", "why is X slow?").
---

# Performance Investigator

Generates a thorough, evidence-based performance investigation of FractalEngine Studio by static analysis of the Rust backend (`src-tauri/src/`) and the TypeScript / Svelte frontend (`src/lib/`). Produces one or more markdown reports under `docs/performance/`, each with a uniform frontmatter block that the doc-index regenerator can pick up.

Reports are **not** measurements — they are _models_ of where time goes, derived from reading code paths end to end. When the agent has the means to actually measure (browser DevTools, `console.time`, Rust `tracing`, Tauri DevTools), the report should fold those numbers in alongside the static model.

---

## When to Invoke

- User says **"document the app's loading speed"**, **"audit app startup"**, **"performance report"**, **"what runs when the app launches?"**, **"trace IPC cold-start"**, or similar.
- User asks **"why does X feel slow?"** — investigator produces a focused report on that specific subsystem.
- User asks for a **render-path / reactivity audit** of a Svelte component (`$effect`, `$derived`, store subscriptions).
- User asks for an **IPC hot-path audit** — which Rust commands get invoked most often, which are synchronous, which do blocking I/O.
- User wants a **bundle / asset / startup asset load** audit (fonts, icons, code-split chunks).
- User wants a periodic performance **re-baseline** after a large refactor.

Do **not** invoke for one-off micro-optimizations the user already knows about — just edit the code. Invoke when a _documented investigation_ is the deliverable.

---

## Output Location and Naming

All reports land in `docs/performance/`. Create the folder on first use (`mkdir -p docs/performance`).

File naming convention (always kebab-case, always `.md`):

| User intent                    | Suggested filename       |
| ------------------------------ | ------------------------ |
| "document app's loading speed" | `loading-speed.md`       |
| "audit startup"                | `startup-path.md`        |
| "ipc performance"              | `ipc-hot-path.md`        |
| "render performance of Editor" | `render-editor.md`       |
| "AI chat performance"          | `ai-chat-performance.md` |
| "bundle / asset weight"        | `asset-load.md`          |

If the user does not name a topic, default to `loading-speed.md` for cold-start investigations, `startup-path.md` for general launch audits.

---

## Frontmatter (required for every report)

Every report must begin with this exact frontmatter block. Fields are filled by the agent; only `updated` may be re-touched later without re-issuing the report.

```yaml
---
id: performance-001
title: App Loading Speed
type: performance
summary: Cold-start trace from Tauri `main.rs` → SvelteKit bootstrap → first paint, with each phase's blocking work and a list of likely wins.
updated: 2026-06-25
---
```

| Field     | Rule                                                                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`      | `performance-` + zero-padded serial (start at `001`, never reuse a number, even if a report is deleted). Use `LS docs/performance` to pick the next number. |
| `title`   | Human-readable slug title (Title Case, ≤ 60 chars). Mirrors the filename stem in Title Case.                                                                |
| `type`    | Always exactly `performance`.                                                                                                                               |
| `summary` | One sentence — what the report is for, what it found, what to act on. The single most important sentence in the file.                                       |
| `updated` | Today's date in `YYYY-MM-DD`. Use the user's "today" from environment.                                                                                      |

Do **not** add `tags`, `relates_to`, `status`, or `source` — this doc type is intentionally narrower than ADR/design/routing to keep the index schema stable. If the user wants to cross-link, mention other doc IDs in the report body, not in the frontmatter.

After writing the file, regenerate `docs/INDEX.md` via `agents/skills/doc-frontmatter` (the agent does this; do not hand-edit the index).

---

## Workflow

### Phase 1 — Frame the Investigation

Before reading any code, write the framing into the report under an `## Investigation Scope` heading:

1. **What the user asked for** — paraphrase their request verbatim if short.
2. **What subsystems are in scope** — Rust backend? Specific component? Whole stack?
3. **What subsystems are out of scope** — be explicit so the report doesn't get blamed for gaps it never claimed to cover.
4. **Methodology** — "static trace", "static trace + measured timings from …", "comparison of N candidate paths", etc.
5. **Known unknowns** — questions the report cannot answer from code alone (e.g. actual cold-start wall-clock time without a real run).

Example:

```markdown
## Investigation Scope

**Requested:** "document app's loading speed".
**In scope:** Tauri `main.rs` → `lib.rs` command registration → SvelteKit bootstrap → first interactive component mount.
**Out of scope:** Network requests from the in-app browser, AI model load (separate sidecar), runtime IPC traffic.
**Methodology:** Static trace of the launch path; no live measurements in this pass.
**Known unknowns:** Actual wall-clock time, browser cache state, GPU availability.
```

### Phase 2 — Trace the Rust Launch Path

Read these in order; each is a checkpoint where time can be spent:

1. `src-tauri/src/main.rs` — `fn main()` entry, any eager work before `App::run()`.
2. `src-tauri/src/lib.rs` — `pub fn run()`, Tauri builder chain, plugins, `setup` hook.
3. `src-tauri/src/lib.rs` — every `invoke_handler` registration; note each one's signature.
4. `src-tauri/tauri.conf.json` — `app.windows[*].url`, `beforeDevCommand` / `beforeBuildCommand`, `frontendDist`, `withGlobalTauri`.
5. `src-tauri/build.rs` — anything blocking before the binary links (uncommon but possible).
6. `src-tauri/Cargo.toml` — feature flags, dependency count, optional `libggml*` / `libllama*` sidecar presence.

For each phase, capture in the report:

- **Function / block name** and file path with line range.
- **What it does** in one sentence.
- **Cost shape** — does it block, spawn, defer, conditionally compile?
- **First-load relevance** — does this run before the webview paints, after first paint, or only on first user action?
- **Source link** in the format [`path`](file:///absolute/path#Lstart-Lend).

### Phase 3 — Trace the Frontend Bootstrap

Read in order; this is what happens inside the webview once Tauri hands off:

1. `src/routes/+layout.svelte` and any `+layout.ts` / `+layout.server.ts` — what loads on every route.
2. `src/routes/+page.svelte` and its `+page.ts` / `+page.server.ts` — first paint content.
3. `src/lib/ipc.ts` — the single IPC gateway. List every exported function and which Rust command it maps to. Mark which fire on app boot.
4. `src/lib/ipc-mock.ts` — note that browser-mode mocks exist so the same code path runs under `pnpm dev`; this matters for understanding what gets _deferred_ vs. _blocked_ in Tauri vs. browser mode.
5. `src/lib/state/*.svelte.ts` — global state initialization. Anything in the module body that runs on first import is _de-facto_ startup cost.
6. `src/lib/styles/index.sass` — SASS aggregation. If styles are large, the first paint is blocked on parsing; quantify the count of `.sass` files imported and any `@font-face` URL loads.
7. `src/lib/components/ClassicIdeLayout.svelte` and `src/lib/components/Canvas.svelte` — whichever mounts first as the visible shell. Note any `$effect(...)` blocks that fire on mount; they are the _first wave_ of reactive work after first paint.

For each phase capture the same five fields as Phase 2.

### Phase 4 — Trace One Wave of Reactivity

The first wave after first paint is what the user _feels_ as "speed". Walk one mount cycle from a top-level component downward:

1. Pick a likely first mount target — usually `ClassicIdeLayout.svelte` or `Canvas.svelte` depending on which layout the workspace serializes.
2. For each `import` of another `.svelte` or `.ts` file in its `<script>`, note:
   - Is the import **eager** (default) or **lazy** (`await import(...)`, dynamic)?
   - Does the imported module do work in its **module body** (not just inside a function)? Module-body work runs once at import time and counts against first paint.
3. For each `$state(...)` declaration: is it lazy (`$state(() => ...)` style isn't valid in runes — note whether it has an initializer expression that allocates immediately)?
4. For each `$derived(...)`: is it cheap or does it call into a function that does work? Note any `$derived.by(() => ...)` whose body is heavy.
5. For each `$effect(...)` and `$effect.pre(...)`: what triggers it, and what does it do?
6. For each `{#each}` over a large array: note the array size assumption and any keyed fallback.

Produce a small **wave table**:

```markdown
### Wave 1 — Shell mount (first paint → ~50ms target)

| File                      | Line | Action                           | Cost shape      |
| ------------------------- | ---- | -------------------------------- | --------------- |
| `+layout.svelte`          | L1   | SvelteKit hydrate                | sync            |
| `ClassicIdeLayout.svelte` | L4   | import `Canvas` (eager)          | sync, ~N KB     |
| `Canvas.svelte`           | L20  | `new LayoutStore()`              | sync, allocates |
| `ide.svelte.ts`           | L1   | module body — reads localStorage | sync I/O        |
```

Repeat for **Wave 2** (workspace deserialize, IPC bootstrap calls) and **Wave 3** (first user-actionable state, e.g. file tree loaded).

### Phase 5 — Surface Performance Drivers

Pull a **performance drivers** section from everything observed. Group findings into these categories so the user can act on them:

- **Bundle / asset weight** — large deps loaded eagerly (e.g. `monaco` vs `codemirror`, `mermaid`, font subsets, AI runtime).
- **Synchronous I/O at boot** — `localStorage` reads, `IndexedDB` opens, file system reads in module bodies.
- **Eager IPC calls at boot** — which `ipc.ts` functions fire on first paint and which Rust commands they map to.
- **Render hotspots** — `$effect` bodies that re-run on every keystroke, large `{#each}` blocks without keys, derived recomputation cascades.
- **Reactivity foot-guns** — `$state` containing mutable refs that escape detection, `$derived` that captures the wrong scope.
- **Tauri-side cost** — heavy `setup` hook work, plugin init that pre-warms a connection, native menu construction cost.
- **Conditional compilation** — features gated behind `cfg(...)` / `#[cfg(...)]` that aren't running in browser mode but _do_ run in Tauri (or vice versa).

For each driver: name, location, _why_ it costs what it costs, _what to try first_ to reduce it. Mark each finding's confidence:

- **`measured`** — actual number observed (rare in a static pass; include if the user provided one).
- **`inferred-high`** — clearly expensive from code (synchronous I/O, large loop, large import).
- **`inferred-low`** — could be fine, but worth measuring.

### Phase 6 — Recommendations

End with a `## Recommendations` section. Every recommendation must:

1. Cite a specific file path and line range.
2. State a concrete change (e.g. "move `localStorage` read inside `onMount`", "lazy-import `Mermaid.svelte` from `Response.svelte`").
3. Estimate the **expected impact** qualitatively (large / medium / small) and confidence (`measured` / `inferred-high` / `inferred-low`).
4. Note **risk** — what could regress (lost state, flash of unstyled content, layout shift).

Order recommendations by **expected impact / risk**, not by file. The user is reading the doc to decide what to do next.

### Phase 7 — Write the File

1. Confirm the next serial number via `LS docs/performance`.
2. Compose the file with frontmatter first, then the sections in order:
   - `## Investigation Scope`
   - `## Rust Launch Path` (omit if out of scope)
   - `## Frontend Bootstrap` (omit if out of scope)
   - `## Reactivity Waves`
   - `## Performance Drivers`
   - `## Recommendations`
   - `## Appendix: Files Read` — every file the agent actually opened to produce the report, with a one-line note on what was extracted.
3. Write to `docs/performance/<slug>.md`.
4. Run `agents/skills/doc-frontmatter` (or the `frontmatter_tool.py scan` + manual `apply`) to register the new file. The doc-frontmatter skill knows the schema — pass `type: performance` so the index row goes in a sensible place.
5. Surface the file path to the user with a `file:///` link, plus a 2-3 sentence summary of the headline finding. Do not paste the whole document — they can open it.

---

## Quality Bar

A report is **done** when:

- Every claim cites a file path + line range.
- Every recommendation has a concrete change, an impact estimate, and a risk note.
- The user can answer "what should I work on first?" by reading the Recommendations section alone.
- The report is honest about what it didn't measure — no fake numbers, no "approximately N ms" without a source.

A report is **not done** if it:

- Lists functions without explaining the cost shape.
- Recommends "use Web Workers" or "lazy load" without saying _which_ module and _what_ gets split.
- Mixes browser-mode and Tauri-mode behavior without flagging which it traced.
- Skips the frontmatter or uses the wrong `id` serial.

---

## Example Invocation Walkthrough

User says: **"document app's loading speed"**.

1. Skill fires. Agent reads Phase 1, fills the `## Investigation Scope` block with the paraphrase.
2. Agent reads `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` — produces Phase 2 trace.
3. Agent reads `src/routes/+layout.svelte`, `src/routes/+page.svelte`, `src/lib/ipc.ts`, `src/lib/state/ide.svelte.ts`, `src/lib/styles/index.sass`, `src/lib/components/ClassicIdeLayout.svelte` — produces Phase 3 trace.
4. Agent reads `ClassicIdeLayout.svelte` and walks its imports — produces Phase 4 waves.
5. Agent groups findings into Phase 5 drivers.
6. Agent writes Phase 6 recommendations.
7. Agent writes `docs/performance/loading-speed.md` with `id: performance-001` (or next serial), `type: performance`.
8. Agent runs doc-frontmatter to register.
9. Agent reports: "Wrote [loading-speed.md](file:///...) — three drivers, top recommendation is to defer `ide.svelte.ts`'s localStorage read into `onMount`."

---

## Anti-Patterns

- **Don't recommend changes you didn't trace.** If you didn't read the file, don't claim it's a hotspot.
- **Don't invent timings.** No "~100ms probably" without a source. Either measure or label as inferred.
- **Don't repeat app-documenter's job.** This skill is performance-only; structure / class registry / component architecture docs live in `docs/routing/` via `app-documenter`.
- **Don't write to `docs/adr/` or `docs/design/`** — those have stricter schemas. Performance findings belong in `docs/performance/`.
- **Don't skip the Appendix.** It's how the next agent (or the user) re-verifies the work.
