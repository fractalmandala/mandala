---
title: Smriti Log
description: A running record of the project's memory health.
id: 4
---


A running, append-only record of this project's smriti health. Every run
of `smriti-metrics.sh`, `run_probes.py`, or `behavioral_probes.py` adds
one row. Don't hand-edit past rows — if a number looks wrong, fix the
cause and let the next run correct the log.

Column meaning:
- **Date** — the day the check ran (one row per run; multiple runs in a
  day are fine, they're not deduplicated).
- **Total entries** — `smriti_count` at the time of the run.
- **New (24h) / Probe pass rate** — whichever the originating script
  reports; `smriti-metrics.sh` fills "New (24h)", `run_probes.py` fills
  "Probe pass rate", `behavioral_probes.py` fills free-text notes.
- **Notes** — which script wrote the row, plus any counts specific to it
  (duplicate-work candidates, conflicts found, etc).

Read this file sideways, not just top-to-bottom: a probe pass rate that
drifts down over a few weeks while total entries climbs is the signature
of a store that's accumulating faster than it's staying recallable —
that's the moment to prune, re-tag dhatu_cluster values, or split the
store by session more aggressively.

| Date | Total entries | New (24h) | Probe pass rate | Notes |
|---|---|---|---|---|
