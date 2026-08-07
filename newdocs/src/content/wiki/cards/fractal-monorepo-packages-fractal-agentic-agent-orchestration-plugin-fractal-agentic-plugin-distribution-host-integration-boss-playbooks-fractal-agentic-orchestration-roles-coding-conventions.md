---
title: Boss Playbooks — Fractal Agentic Orchestration Roles — Coding Conventions
description: - Every boss INDEX.md uses the same fixed structure: YAML frontmatter with type: guide, activation command link, mission/boundaries, stack gate, agent lists, mapped skills, mapped commands, phased pl…
tags: [packages/fractal_agentic/plugin_core/bosses]
type: card
module: packages/fractal_agentic/plugin_core/bosses
path: packages/fractal_agentic/plugin_core/bosses
created: 2026-08-05
updated: 2026-08-06
---

- Every boss INDEX.md uses the same fixed structure: YAML frontmatter with `type: guide`, activation command link, mission/boundaries, stack gate, agent lists, mapped skills, mapped commands, phased playbook, verification defaults, and handoff arrows.
- Cross-boss dependencies are declared explicitly in a `## Handoffs` section using `→` for outgoing handoffs and `←` for incoming ones, never implied through prose.
- Skills and commands are referenced by relative paths to their canonical indexes (`../../../skills/...`, `../../../commands/...`, `../../../agents/...` rather than inline descriptions.
- Playbooks are organized into numbered phases (Phase 0/1/2/3/4) with ordered step-by-step instructions per phase, establishing a consistent delivery cadence across all bosses.
- Stack detection is described declaratively in a `stack gate` or `surface gate` subsection that tells the orchestrator how to choose reviewers based on manifests and file extensions.
