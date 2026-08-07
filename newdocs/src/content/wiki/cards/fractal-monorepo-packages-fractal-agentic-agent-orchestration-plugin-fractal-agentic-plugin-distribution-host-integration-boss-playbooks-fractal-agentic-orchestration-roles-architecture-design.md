---
title: Boss Playbooks — Fractal Agentic Orchestration Roles — Architecture Design
description: Each of the seven bosses is a self-contained playbook directory under packages/fractal-agentic/plugin/bosses/ (agent, code, creator, design, meta, svelte, workflow), each containing a single INDEX.md…
tags: [packages/fractal_agentic/plugin_core/bosses]
type: card
module: packages/fractal_agentic/plugin_core/bosses
path: packages/fractal_agentic/plugin_core/bosses
created: 2026-08-05
updated: 2026-08-06
---

Each of the seven bosses is a self-contained playbook directory under `packages/fractal-agentic/plugin/bosses/` (`agent`, `code`, `creator`, `design`, `meta`, `svelte`, `workflow`, each containing a single `INDEX.md` that serves as the canonical entry point. Every INDEX.md follows an identical schema: YAML frontmatter (`title`, `description`, `type: guide`, an activation command (`/activate-boss-*`, mission-and-boundaries section, stack/surface gate, primary/secondary agent lists, mapped skills, mapped commands, phased playbook, verification defaults, and explicit handoff arrows to other bosses. Bosses are documentation-only artifacts consumed by the fractal-agentic orchestration runtime; they reference sibling indexes at `../../../skills/`, `../../../agents/`, and `../../../commands/` but contain no executable code. Cross-boss dependency direction is explicit via the handoff sections (e.g., Creator pulls from Design/Svelte/Code/Agent/Workflow/Meta in a table, while others declare one-way handoffs). The Meta boss owns portfolio health and is the only boss with bidirectional inbound handoffs from all others, making it the central maintenance hub.
