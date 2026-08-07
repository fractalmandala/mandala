---
title: Agent Profiles & Custom Agent Definitions — Coding Conventions
description: - Every agent .md starts with YAML frontmatter declaring name, description, tools, and model (usually inherit to use the caller's model).
tags: [packages/fractal_agentic/plugin_core/agents]
type: card
module: packages/fractal_agentic/plugin_core/agents
path: packages/fractal_agentic/plugin_core/agents
created: 2026-08-05
updated: 2026-08-06
---

- Every agent `.md` starts with YAML frontmatter declaring `name`, `description`, `tools`, and `model` (usually `inherit` to use the caller's model).
- Prompt content follows a fixed section order: role definition, process/checklist, common patterns or false positives, and concrete code examples showing BAD vs GOOD.
- A 'Prompt Defense Baseline' block appears at the top of every agent prompt enforcing identity preservation, confidentiality, and input sanitization rules.
- Capability-pinned agents ship a sibling `.toml` with `name`, `description`, `model`, `model_reasoning_effort`, and optionally `sandbox_mode = "read-only"` to constrain execution.
- The `INDEX.md` table is the single source of truth for agent inventory; counts in boss playbooks must never be hardcoded but derived from it.
- Agent descriptions consistently begin with a trigger phrase such as 'Use PROACTIVELY when...' or 'MUST BE USED for...' to guide boss routing decisions.
