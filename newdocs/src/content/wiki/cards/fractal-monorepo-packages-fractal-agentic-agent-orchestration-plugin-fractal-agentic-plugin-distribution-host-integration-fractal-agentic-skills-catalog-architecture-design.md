---
title: Fractal Agentic Skills Catalog — Architecture Design
description: Each skill is a flat directory under skills/ containing at minimum a SKILL.md frontmatter-declared entry (name, description, argument-hint, user-invocable, allowed-tools, license). Skills are organiz…
tags: [packages/fractal_agentic/plugin_core/skills]
type: card
module: packages/fractal_agentic/plugin_core/skills
path: packages/fractal_agentic/plugin_core/skills
created: 2026-08-05
updated: 2026-08-06
---

Each skill is a flat directory under `skills/` containing at minimum a `SKILL.md` frontmatter-declared entry (name, description, argument-hint, user-invocable, allowed-tools, license). Skills are organized by capability domain (e.g. `boss-orchestration`, `impeccable`, `memclaw`, `continuous-learning-v2` and may include subdirectories: `scripts/` for executable tooling, `references/` for supporting docs, `agents/` for YAML agent definitions, `templates/` for scaffolds, `hooks/` for lifecycle hooks, and `fixtures/tests/prompts` for evaluation suites. The top-level `INDEX.md` enumerates all 167 skills with ID, description, and source. Some skills (`impeccable`, `better-ui`, `boss-orchestration` act as orchestration kernels that delegate to other skills or spawn subagents via TOML pins. Dependency direction is one-way: skills reference shared infrastructure in `../../scripts/` (installers, inspectors) but never import each other — composition happens through the parent orchestrator reading multiple SKILL.md files.
