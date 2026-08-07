---
title: Fractal Agentic — Agent Orchestration Plugin — Coding Conventions
description: - Each agent, boss, and skill is a Markdown document (SKILL.md or .md) optionally accompanied by a scripts/, references/, or agents/ subfolder — no compiled code is required.
tags: [packages/fractal_agentic]
type: card
module: packages/fractal_agentic
path: packages/fractal_agentic
created: 2026-08-05
updated: 2026-08-06
---

- Each agent, boss, and skill is a Markdown document (SKILL.md or *.md) optionally accompanied by a scripts/, references/, or agents/ subfolder — no compiled code is required.
- Host adapters are thin shims (CLAUDE.md, GEMINI.md, KIMI.md, OPENCODE.md) layered on top of the same host-agnostic content under the plugin root.
- Boss playbooks follow a fixed discovery path: SOUL.md → AGENTS.md router → boss INDEX.md → boss-orchestration skill, and discovery stops after the first match.
- Commands under commands/ are declarative Markdown entries that route to existing boss/agent capabilities rather than implementing new logic.
