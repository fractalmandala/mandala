---
title: Fractal Agentic — Agent Orchestration Plugin — Architecture Design
description: The package is the npm distribution unit for the Fractal Agentic orchestration layer. Its bin/cli.js exposes the fractal-agentic command used by the plugincore child to install into host caches (.cla…
tags: [packages/fractal_agentic]
type: card
module: packages/fractal_agentic
path: packages/fractal_agentic
created: 2026-08-05
updated: 2026-08-06
---

The package is the npm distribution unit for the Fractal Agentic orchestration layer. Its `bin/cli.js` exposes the `fractal-agentic` command used by the `plugin_core` child to install into host caches (`.claude-plugin/`, `.codex-plugin/`, `.fractal-agentic/`. At runtime, each project's `AGENTS.md` points to this root via `FRACTAL_AGENTIC_ROOT`; the router reads `SOUL.md` → boss `INDEX.md` files under `bosses/*/` → loads the `boss-orchestration` skill and selected agents from `agents/` to execute `/orchestrate` delivery flows. Skills live flat under `skills/` as self-contained Markdown packages with optional scripts/references/agents subfolders; commands under `commands/` are human-facing entry points that delegate to the same boss/agent pipeline. The sibling `site/` module renders all of this armory as a browsable website but never replaces the plugin root. Hooks under `hooks/` provide per-host lifecycle integration, while `scripts/` and `evaluation_scripts/` supply installation, verification, and benchmark tooling shared across children.
