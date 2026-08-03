---
title: Project Storage
description: On how projects using this package store the data.
id: 20
---


## Status
Accepted (this package's default; supersedes the original sanskrit-harness's
per-session JSON-file approach for any project that installs this package).

## Context
The original SKAA harness (June 2026) stored smriti as one JSON file per
session on disk, with a `retrieve_cross_session()` routine that scanned
every session file on recall. That worked well enough to prove the core
idea — cross-session recall that survives restarts — but has three limits
that show up as a project's smriti grows:

1. No structured query. Filtering by `dhatu_cluster`, `karaka_role`, or
   `pramana_min` means loading and parsing every file every time.
2. No cheap aggregate metrics. Counting entries by pramana or by domain
   requires the same full scan — there's no way to build a lightweight
   `smriti-metrics.sh` against a directory of JSON files without a decent
   amount of custom parsing logic duplicated between every tool that wants
   a count.
3. No natural place to put samskara proposals or applied rules — they'd
   need their own file-based store, invented from scratch, with the same
   scanning problems.

Separately, a July 15, 2026 integration plan for a different codebase
(FractalEngine) proposed exactly this move — a per-project SQLite file
(there, `.fractal/memory.db`) with the karaka/pramana/dhatu columns as
first-class fields — under a planned ADR-025 superseding an earlier
ADR-011. That plan was never carried out (per the July 29, 2026 audit of
SKAA usage: no entries in smriti show the measurement harness or the
SQLite migration actually shipping). This package **is** that migration,
generalized so any project can adopt it, plus the measurement harness the
original plan called for but didn't build.

## Decision
Each project that installs this package gets its own SQLite file at
`.skaa/smriti.db`, created and migrated by `skaa.db.SmritiStore`. The
schema mirrors the tool signatures already observed in production use:
`entry_id, session_id, created_at, content, pramana, karta, karma, karana,
sampradana, apadana, adhikarana, dhatu_cluster, karaka_role, tags`, plus
two supporting tables (`samskara_proposals`, `samskara_rules`) and a thin
`sessions` table for open/close bookkeeping.

## Alternatives considered
- **Keep per-session JSON files.** Simplest possible thing, zero new
  dependencies (sqlite3 is stdlib in Python but still a format decision).
  Rejected for this package because the measurement harness (this
  package's other stated goal) needs cheap structured aggregation, and
  re-implementing that over JSON files is just reinventing a worse SQLite.
- **A single global cross-project store** (one database for every project
  a person works in, like the original harness's `amrit-main` session
  spanning Chat/Cowork/Code). Rejected as the *default* for this package
  because "install into any project" implies portability and isolation —
  a project's memory should travel with the project (or be deletable with
  it) rather than living in a personal global file a stranger inheriting
  the repo can't find. Nothing stops you from pointing `SKAA_DB_PATH` at
  a shared location if you want the global-store behavior back; that's a
  one-line config choice, not a code change.
- **Postgres/other server database.** Rejected as the default because it
  adds an operational dependency (a running server) to something meant to
  `pip install` and go; nothing in `skaa.db` is SQLite-specific at the SQL
  level, so swapping the driver is a reasonable follow-up if a project
  needs concurrent writers across multiple machines.

## Consequences
- Positive: `smriti-metrics.sh`, `run_probes.py`, and `behavioral_probes.py`
  all work off simple SQL, no bespoke file-scanning code.
- Positive: one file to back up, move, or delete (`.skaa/smriti.db`).
- Negative: not automatically shared across projects or across machines —
  if that global-recall behavior is wanted, it has to be built as an
  explicit sync/export step (see the "cross-project sync" item in
  ARCHITECTURE.md's roadmap section), the same way the original
  FractalEngine plan proposed an opt-in HTTP bridge for exactly that.
- Negative: `SmritiStore` is intentionally not thread-safe (see its
  docstring in `skaa/db.py`) — this package assumes one server process per
  project, matching how MCP servers are normally run.
