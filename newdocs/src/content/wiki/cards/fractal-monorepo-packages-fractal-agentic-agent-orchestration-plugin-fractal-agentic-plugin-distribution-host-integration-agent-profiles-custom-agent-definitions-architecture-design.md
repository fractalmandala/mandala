---
title: Agent Profiles & Custom Agent Definitions — Architecture Design
description: Each agent is a self-contained profile file: a .md file with YAML frontmatter (name, description, tools, model) followed by structured prompt sections (role, process, checklist, examples). Three spec…
tags: [packages/fractal_agentic/plugin_core/agents]
type: card
module: packages/fractal_agentic/plugin_core/agents
path: packages/fractal_agentic/plugin_core/agents
created: 2026-08-05
updated: 2026-08-06
---

Each agent is a self-contained profile file: a `.md` file with YAML frontmatter (`name`, `description`, `tools`, `model` followed by structured prompt sections (role, process, checklist, examples). Three special agents — routine-implementer, complex-implementer, fresh-reviewer — are paired with a sibling `.toml` capability-pin that declares `name`, `description`, `model`, `model_reasoning_effort`, and optional `sandbox_mode` (read-only for fresh-reviewer). The `INDEX.md` serves as the live inventory table that the startup router and boss playbooks reference instead of hardcoding counts. Agents are grouped by responsibility: domain reviewers (React/Vue/Svelte/Flutter/Rust), quality gates (code-reviewer, security-reviewer, build-error-resolver, silent-failure-hunter), orchestration lanes (routine/complex implementers, fresh reviewer), and utility specialists (architect, code-explorer, doc-updater, opensource pipeline, GAN harness, loop-operator, weekly-synthesizer). Dependency direction is one-way: bosses and orchestrators consume these profiles; agents never import each other.
