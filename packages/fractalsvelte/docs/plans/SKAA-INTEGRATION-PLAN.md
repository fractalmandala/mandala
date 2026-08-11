---
id: skaa-integration-plan
title: SKAA Integration Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**


**Goal:** Every intelligence that touches FractalEngine — coding agents working on the repo, and chat sessions inside the app's own AI module — builds and recalls memory through one shared protocol: the Sūtra-Kāraka Agent Architecture (SKAA) memory contract. Plus a measurement harness, live from day one, to check progress over the following days and weeks.

**Canonical harness:** `~/100cabinet/90AI/sanskrit-harness/` (MCP server `skaa`, HTTP on :7341, CLI). Protocol reference: its `ORIENTATION.md`.
**App-side vehicle:** ADR-011 "Local-First AI Memory and Context Harness" (currently *proposed*, unbuilt) + `docs/design/AI-MEMORY-ARCHITECTURE.md`. This plan **supersedes ADR-011's neutral schema with the SKAA contract** — same storage decisions (rusqlite, per-project `.fractal/memory.db`, FTS5+cosine+RRF), Sanskrit epistemics layered on top.

---

## Part I — The unification model

### I.1 The SKAA Memory Contract (v1)

One schema, two implementations. Every memory entry, wherever it lives, carries:

| Field | Type | Meaning |
|---|---|---|
| `entry_id` | uuid | identity |
| `content` | text | the observation/result/decision, self-contained |
| `pramana` | enum | `pratyaksa` (directly observed: tool output, confirmed fact) · `anumana` (inferred) · `sabda` (document/testimony, incl. user statements) · `upamana` (analogy/estimate) |
| `karta` | text | who produced it (`amrit`, `agent`, `app-chat`, `<model-id>`) |
| `karma` | text | namespaced target, e.g. `fractalengine/ai-module/retrieval` |
| `dhatu_cluster` | text | semantic cluster from `dhatu/INDEX.md` (`kr` completed actions, `jna` established facts, `vipad` failures, …) |
| `session_id` | text | originating session |
| `created_at` | timestamp | |

**Protocol rules (from the harness sūtras, held invariant on both sides):**

1. **Read before act** (RET-01/02): query smṛti before any step that may have been done before.
2. **Write after act**: every meaningful event — tool result, confirmed fact, user decision, failure — becomes an entry.
3. **Pramāṇa honesty**: never upgrade anumāna to pratyakṣa without direct observation. Retrieval ranks by pramāṇa weight; low-confidence entries are flagged in injected context.
4. **Conflict resolution**: higher pramāṇa wins; equal pramāṇa → vyāpti analysis; unresolvable → escalate to Amrit. Write the resolution back.
5. **Saṃskāra lifecycle** (SYS-03, hard): session close stages lesson *proposals*; only Amrit promotes them to doctrine. Never auto-applied. Confidence upgrades low→medium at 3 instances, medium→high at 7.
6. **Layer separation**: smṛti (episodic, per-session) ≠ saṃskāra (durable lessons) ≠ vāsanā (constitution, Amrit-only). Conflating them is the primary failure mode.

### I.2 Two populations, one contract

| Population | Store | Interface |
|---|---|---|
| **Repo agents** (Claude Code, subagents, any CLI/model working on the codebase) | Global harness smṛti at `sanskrit-harness/memory/smriti/` | Existing `skaa` MCP tools; HTTP :7341 for non-MCP surfaces; karma namespace `fractalengine/...` |
| **In-app chats** (AI module sessions in FractalEngine) | Per-project `.fractal/memory.db` (SQLite, ADR-011 storage) with SKAA columns | New IPC commands through the single gateway (`ipc.ts` + `ipc-mock.ts`) |

The **project store is authoritative for project work**; the global harness remains Amrit's cross-domain memory. A **bridge** (Phase 6) syncs selected high-value entries from the app to the global harness via HTTP :7341 when it's running — opt-in, never silent.

### I.3 Mapping ADR-011 → SKAA

| ADR-011 primitive | SKAA equivalent |
|---|---|
| MemoryItem type `decision` | entry with `dhatu_cluster: man/jna`, pramāṇa usually `sabda` (user decided) |
| `fact` | `jna`, pramāṇa `pratyaksa` or `sabda` per provenance |
| `error_fix` | `vipad` (failure) + follow-up `kr` (fix) |
| `preference` | candidate **saṃskāra proposal**, not a plain entry |
| `file_pattern`, `skill_usage` | `kr` entries; recurring ones surface as saṃskāra proposals |
| Resource (provenance pointer) | evidence backing the pramāṇa tag — pratyakṣa requires one |
| Consolidate sweep | subsumed by saṃskāra review at session close + dedup sweep |
| Extract step | one structured-output LLM call per turn, now emitting SKAA-shaped entries (assigns pramāṇa, karma, dhātu cluster) |

**Pramāṇa assignment defaults for the app's extractor:** tool/terminal/file output → `pratyaksa`; user statement or attached doc → `sabda`; model's own inference → `anumana`; estimates → `upamana`.

---

## Part II — Phases

### Phase 0 — Baseline + measurement harness first (day 0–1)
*Measure before changing anything, or "progress" has no meaning.*

- Write **ADR-025 "Adopt the SKAA memory contract"** (relates_to ADR-011, ADR-024); update ADR-011 status/notes; regenerate `docs/INDEX.md` rows.
- Create `scripts/smriti-metrics.sh` (or .py): snapshot global-harness smṛti count, entries/day by pramāṇa and karta, karma namespaces. Baseline today: **14 entries, zero project-namespaced, app has zero persistent memory.**
- Create `scripts/memory-probes.yaml` + runner (see Part III): seed 6–10 golden facts into the harness under `fractalengine/...`, record baseline recall scores.
- Create `docs/metrics/SMRITI-LOG.md` — append-only daily log the runner writes to.

### Phase 1 — Repo-agent adoption, zero app code (day 1–3)

- Add SKAA to the repo's `.mcp.json` so every Claude Code session on this project gets the tools.
- Add a **"Memory protocol (SKAA)"** section to `AGENTS.md`: on session start query smṛti (`karma: fractalengine/...`) for the touched area; write entries after meaningful completions/failures/decisions with correct pramāṇa; call `skaa_session_close` when done; karma namespace convention `fractalengine/<module-or-doc>/<topic>`; dhātu cluster quick-reference (`kr`, `jna`, `vipad`, `man`).
- Optional hardening: `SessionStart` hook injecting a recall reminder, `Stop` hook reminding to close the session (via `update-config` skill).
- **Gate:** two consecutive real work sessions each produce ≥1 well-formed entry and a clean close that stages proposals.

### Phase 2 — App storage foundation (day 3–7) *(ADR-011 Phase 1, SKAA-shaped)*

- Add `rusqlite`; schema migrations for `.fractal/memory.db`: `sessions`, `messages`, `smriti_entries` (contract columns from I.1), `samskaras`, `samskara_proposals`, `metrics`.
- Message capture: AI-module sessions become durable per-project; `@file`/`/skill` refs as structured metadata. No extraction yet.
- New IPC commands via the single gateway (ADR-004/ADR-018 discipline): `smritiWrite`, `smritiQuery`, `smritiSessionClose`, `samskaraProposals`, `samskaraApply`, `listSessions`, `loadSession` — **with full `ipc-mock.ts` parity so `pnpm dev` exercises the whole loop in-browser**.
- Project-lifecycle isolation per ADR-011 §8 (path + request-generation guards).
- Envelope-encrypt at rest via the shared `crypto.rs` (ADR-016).
- **Gate:** chat survives reload; mock and Tauri behave identically; typecheck/build green.

### Phase 3 — Extraction: turns → smṛti entries (week 2)

- Factor provider-agnostic `run_completion()` out of `run_api_model()` (per AI-MEMORY-ARCHITECTURE §5).
- Post-turn background extractor emits SKAA entries using the I.3 pramāṇa defaults; ship a curated subset (~12) of the 72 dhātu clusters with the extractor prompt, copied from `dhatu/clusters/`.
- Local-only embedding (never an API call for this step).
- **Gate:** transcript fixtures → expected entries; malformed/duplicate/boundary fixtures per AGENTS.md rule 12.

### Phase 4 — Retrieval & injection (week 2–3)

- FTS5 + brute-force cosine, RRF-fused, then **pramāṇa-weight rerank** (the SKAA delta over ADR-011); ~1500-token budget.
- Inject as a bhāṣya-style system block: applicable saṃskāras first (as *guides, not commands*), then smṛti hits with pramāṇa flags on low-confidence entries; explicit `@file`/`/skill` always take precedence.
- Auto-recall runs before each send (read-before-act inside the app, mirroring the orchestrator's Apādāna step).
- **Gate:** recall probes now run against the app store too; conflict fixture (contradictory entries, different pramāṇa) shows the higher pramāṇa winning in injected context.

### Phase 5 — Saṃskāra lifecycle in-app (week 3)

- Session close (explicit action + app-quit flush) runs the review LLM call over the session's entries → proposals into `samskara_proposals` table. **Never auto-applied — SYS-03 holds in the app too.**
- Review UI: proposals list with accept / edit / discard (this is Amrit's steward surface); applied saṃskāras get instance counts and confidence upgrades at 3/7.
- Add to `CommandPalette.svelte` ("Review saṃskāra proposals", "Query smṛti", "Close AI session") and `SettingsDialog.svelte` (memory on/off per project, extraction provider, token budget) per AGENTS.md rule 11. Undo boundaries for all user-editable memory state via `ideState`.

### Phase 6 — Bridge + Smṛti panel (week 3–4)

- **Bridge:** when :7341 is up, app can push selected entries (user-flagged, or accepted-saṃskāra grade) to the global harness with `karta: app-chat`; a `skaa_memory_query` passthrough lets in-app chat consult global smṛti. Opt-in toggle in Settings; degrade silently when the server is down.
- **Smṛti panel UI:** per-project memory inspector — entry browser filterable by pramāṇa/karma/dhātu, session history, pramāṇa-distribution and writes-per-day sparklines (reads the `metrics` table), proposal review front-and-center.
- **Docs pass per AGENTS.md rule 10:** routing docs for every new component, design docs for new styles (indented SASS under `src/lib/modules/ai/styles/`), ADR updates, `docs/INDEX.md` regeneration.

**Explicitly deferred:** knowledge-graph engine (ADR-011's rejection stands); multi-user sync; vāsanā-layer editing from inside the app (constitution stays files-on-disk, Amrit-only); porting the full 8-step Kāraka orchestrator into Rust (the app implements the *memory contract*, not the orchestrator — revisit only if Phase 3–4 extraction quality proves insufficient).

---

## Part III — Measurement framework (the next days and weeks)

### III.1 Instruments

1. **Counters (automatic, both stores):** entries written/day by karta and pramāṇa; recalls per turn; injected-context size; proposals staged vs applied; sessions closed vs abandoned. App writes to its `metrics` table; the harness side is computed by `scripts/smriti-metrics.sh` from session JSON files.
2. **Recall probe suite (`scripts/memory-probes.yaml`):** seeded facts + natural-language questions + expected-keyword rubrics. Runner queries both stores (MCP/HTTP for harness; IPC or direct SQLite for app), scores **recall@5** and precision, appends a dated row to `docs/metrics/SMRITI-LOG.md`. Grows over time: each week, add 2–3 probes drawn from that week's real work.
3. **Behavioral probes (weekly, manual, ~15 min):**
   - *Duplicate-work test:* ask a fresh agent session to plan a task completed the prior week — does it surface the prior result before redoing it?
   - *Convention-recall test:* ask the in-app chat a project-convention question answered in an earlier session.
   - *Conflict test:* seed two contradictory entries with different pramāṇa — verify the higher one wins in retrieval and the model's answer.
4. **Saṃskāra velocity:** proposals staged / reviewed / applied per week; count of confidence upgrades. A healthy system stages steadily and applies selectively; zero staging = capture is broken, auto-everything-applied = SYS-03 is broken.
5. **Cost guard:** extraction-call count and latency per turn (must stay off the streaming path).

### III.2 Cadence

- **Daily (≈2 min):** run the probe script; glance at the log row. Optionally automate via a scheduled task.
- **Weekly (≈20 min):** behavioral probes; review saṃskāra proposals (`skaa_samskara_proposals` + in-app panel); read the week's trend in SMRITI-LOG; add new probes; adjust extraction prompt or pramāṇa defaults if precision is drifting.

### III.3 Milestone checkpoints

| When | Success looks like |
|---|---|
| **Day 3** | Repo agents writing well-formed namespaced entries every session; baseline probe scores recorded; first proposals staged from real work. |
| **Week 1** | App chat durable per-project (Phase 2 gate passed); harness smṛti shows ≥5 sessions of `fractalengine/...` entries; zero pramāṇa-inflation incidents in spot-checks. |
| **Week 2** | Extractor live; app-store probes ≥70% recall@5 on seeded facts; duplicate-work test passes on the repo side. |
| **Week 3** | Retrieval injected into live chat; convention-recall test passes in-app; first saṃskāras applied through the review UI. |
| **Week 4** | Bridge live; both stores answer the same probe consistently; ≥3 applied saṃskāras with instance counts climbing; SMRITI-LOG shows a stable-or-rising recall trend across 3+ weeks. |

Regression rule: any probe score that drops for two consecutive days gets a `vipad` entry written about it — the measurement system eats its own dogfood.

---

## Part IV — Open questions for Amrit

1. **Global-vs-project smṛti for repo agents:** plan keeps repo agents on the global harness (namespaced). Alternative: point them at the project `.fractal/memory.db` once Phase 2 lands, making the project store the single source. Recommend deciding at the Week-2 checkpoint with real data.
2. **Extraction provider:** reuse the active chat provider (zero config, variable quality) or pin a dedicated cheap model for extraction? Plan assumes reuse; a Settings override ships in Phase 5.
3. **Harness HTTP autostart:** should FractalEngine offer to launch `harness_http.py` (as a sidecar-style convenience) when the bridge toggle is on, or require it running externally? Plan assumes external until decided.
4. **Dhātu subset:** which ~12 of the 72 clusters ship in the extractor prompt? Proposed seed: `kr, jna, man, vipad, cit, drś, gam, vad, budh, smṛ, śak, labh` — to be checked against `dhatu/INDEX.md` definitions.
