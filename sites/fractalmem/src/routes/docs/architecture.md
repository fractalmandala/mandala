---
title: Architecture
description: About the SKAA system.
id: 1
---

SKAA is a persistent, structured episodic memory for an AI agent, exposed
as an MCP server so any MCP-capable client (Claude Desktop, Claude Code,
Cowork, or a custom agent) can read and write to it. It's built around
two independent classification axes layered on top of a plain log — see
`server/skaa/models.py` for the exact data model and `docs/SUTRAS.md` for
the rules governing how they're meant to be used.

## The two axes

### 1. pramana — how the karta knows what it's claiming
Every entry states its means of knowledge: `pratyaksa` (direct
observation — "I did/saw this"), `anumana` (inference — "I concluded this
from other evidence"), `sabda` (testimony — "someone/something else told
me this"), or `upamana` (analogy — "I know this by likeness to something
already known"). This is an honesty requirement, not a confidence score
(SYS-04) — it forces every write to be explicit about its own epistemic
status instead of flattening "I watched this happen" and "I'm guessing
based on a pattern" into the same undifferentiated log line.

### 2. karaka roles — who did what, to what, with what, for whom
Panini's six karakas map onto six columns: `karta` (agent), `karma`
(object/goal — in practice this project's convention is a slash-namespaced
task/domain string, e.g. `course-module/session-2`), `karana` (instrument),
`sampradana` (recipient/beneficiary), `apadana` (source/point of
departure), `adhikarana` (locus/context). Only `karta` and `karma` are
mandatory (SYS-02) — the rest exist for the entries where they add real
information and stay empty otherwise.

`dhatu_cluster` is a third, looser field: a free-text tag naming the
*verbal root* of the action (see `SUGGESTED_DHATU_ROOTS` in models.py for
a starter vocabulary — kr/to make, jna/to know, cit/to think, smr/to
remember, and so on). It's deliberately not an enum, because forcing a
closed vocabulary here just produces mistagging under deadline pressure —
see SYS-05 and the audit finding below.

## Tool reference

| Tool | Purpose |
|---|---|
| `skaa_status` | session id, entry count, tool count, pending proposal count |
| `skaa_memory_query` | token-overlap search with optional dhatu/karaka/pramana filters |
| `skaa_memory_write` | write one entry; rejects missing pramana/karta/karma |
| `skaa_session_close` | mine samskara proposals from ALL smriti, mark session closed |
| `skaa_samskara_proposals` | list proposals by status (default: pending) |
| `skaa_samskara_apply` | promote named proposal_ids into durable rules (SYS-03: never automatic) |
| `skaa_execute` | classify a natural-language instruction into a dhatu category (routing stub, SYS-07) |

## The four dhatu tools
`skaa_status` reports `tool_count: 4` and `tools: [dris, kri, gam, vad]` —
these name four *categories* of action (see, make, go, speak), not four
separate MCP tools. `skaa_execute`'s classifier sorts an instruction into
one of them and logs the decision. In this package that's as far as it
goes; see the roadmap below for what a fuller orchestrator would need.

## The samskara lifecycle
1. `skaa_session_close` calls `skaa.samskara.mine_proposals()`, which scans
   *all* smriti (not just the closing session) for three patterns:
   a karma-prefix recurring often enough to suggest a standing convention,
   entries whose own content flags an explicit stated preference, and
   entries flagging a recurring technical gotcha.
2. Each match is staged as a `pending` proposal with the source entry ids
   attached, so you can trace exactly why it fired.
3. `skaa_samskara_proposals` lists them for review.
4. `skaa_samskara_apply` promotes specific ids into `samskara_rules` —
   this is the only path from proposal to rule (SYS-03). Re-applying an
   already-applied id is a no-op, not a duplicate.

## Why SQLite per project
See `docs/ADR-001-schema.md` for the full decision record. Short version:
the original harness scanned per-session JSON files, which worked for
recall but not for cheap aggregate metrics; this package needs both, so
each project gets one `.skaa/smriti.db` file.

## What the July 29, 2026 audit found, and what this package changes
An audit of ~5 weeks of real SKAA use found: the recall mechanism itself
worked (a daily task rotation correctly avoided repeats every single run);
but pramana tagging had collapsed to near-universal `pratyaksa` with no
real epistemic differentiation happening; `dhatu_cluster` had similarly
collapsed toward a default "kr" tag regardless of the actual action; a
measurement harness (recall probes, a metrics script, a daily log, weekly
behavioral probes) had been *planned* in detail but never built; and the
samskara proposal pipeline had produced zero proposals in five weeks
because nothing was mining them. This package's `scripts/run_probes.py`,
`scripts/behavioral_probes.py`, `scripts/smriti-metrics.sh`, and
`skaa/samskara.py` exist specifically to close those last two gaps for
real, and SYS-04/SYS-05 exist to name the tagging drift so it's at least
visible next time it happens.

## Roadmap (not built here — noted honestly rather than left unstated)
- **A real orchestrator behind skaa_execute.** Today it's a keyword
  classifier (SYS-07). Turning it into something that actually dispatches
  to other tools would mean giving this package its own agent loop and
  API credentials — a different scope than "drop into any project."
- **Cross-project sync.** The FractalEngine plan's opt-in HTTP bridge
  (syncing selected entries between a global store and per-project stores)
  is a reasonable pattern if you outgrow per-project isolation, but it's
  not implemented here — `SKAA_DB_PATH` pointing at a shared file is the
  zero-code version of "global store" if you want that today.
- **Semantic (embedding-based) recall.** `SmritiStore.query()` uses token
  overlap, which is transparent and dependency-free but will miss
  paraphrases. If recall quality (tracked via `run_probes.py`) degrades as
  a project's smriti grows, an embedding index is the natural next layer
  — deliberately not added by default so this package has zero external
  API dependencies out of the box.
