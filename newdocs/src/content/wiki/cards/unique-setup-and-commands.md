---
title: Mandala Monorepo — Unique Setup and Commands
description: Agent sessions begin by loading AGENTS.md, which auto-detects the Fractal Agentic plugin (via FRACTALAGENTICROOT or upward search for plugin.json + docs/bosses/INDEX.md + skills/boss-orchestration/SK…
tags: [repo]
type: card
module: repo
path: repo
created: 2026-08-05
updated: 2026-08-06
---

Agent sessions begin by loading `AGENTS.md`, which auto-detects the Fractal Agentic plugin (via `FRACTAL_AGENTIC_ROOT` or upward search for `plugin.json` + `docs/bosses/INDEX.md` + `skills/boss-orchestration/SKILL.md` and sets a `capability_mode` pin; missing plugin degrades gracefully without blocking work. Per-child IDE sessions are launched from the workspace files in `ide_workspaces/`.
