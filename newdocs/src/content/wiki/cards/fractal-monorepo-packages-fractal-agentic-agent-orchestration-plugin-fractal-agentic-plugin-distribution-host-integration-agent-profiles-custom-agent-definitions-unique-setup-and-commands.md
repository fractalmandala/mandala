---
title: Agent Profiles & Custom Agent Definitions — Unique Setup and Commands
description: Agents are registered by updating INDEX.md rather than modifying any runtime config; the startup router reads this index dynamically. Capability-pinned agents require matching .toml files alongside t…
tags: [packages/fractal_agentic/plugin_core/agents]
type: card
module: packages/fractal_agentic/plugin_core/agents
path: packages/fractal_agentic/plugin_core/agents
created: 2026-08-05
updated: 2026-08-06
---

Agents are registered by updating `INDEX.md` rather than modifying any runtime config; the startup router reads this index dynamically. Capability-pinned agents require matching `.toml` files alongside their `.md` so the orchestrator can resolve the correct model and sandbox mode per lane.
