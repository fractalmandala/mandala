---
title: Fractal Agentic Skills Catalog — Coding Conventions
description: - Every skill declares metadata in a YAML frontmatter block at the top of SKILL.md with fields name, description, and optionally argument-hint, user-invocable, allowed-tools, license, and metadata.or…
tags: [packages/fractal_agentic/plugin_core/skills]
type: card
module: packages/fractal_agentic/plugin_core/skills
path: packages/fractal_agentic/plugin_core/skills
created: 2026-08-05
updated: 2026-08-06
---

- Every skill declares metadata in a YAML frontmatter block at the top of `SKILL.md` with fields `name`, `description`, and optionally `argument-hint`, `user-invocable`, `allowed-tools`, `license`, and `metadata.origin/version`.
- Skill directories follow a consistent layout: `SKILL.md` as the entry point, with optional `scripts/` for executables, `references/` for supporting documentation, `agents/` for YAML agent definitions, `templates/` for scaffolds, and `hooks/` for lifecycle hooks.
- Orchestration skills (boss-orchestration, impeccable, continuous-learning-v2) delegate implementation to subagents or other skills rather than embedding logic inline, using TOML pin types like `fractal_agentic_routine_implementer` or spawning via `npx <skill>` commands.
- Scripts inside skills use relative paths back to the plugin root via `../../scripts/` for shared utilities like `install-agents.sh`, `inspect-agent-runtime.sh`, and `check-armory.sh`, keeping cross-skill tooling centralized.
- Evaluation and compliance skills package their test fixtures, prompts, and runners together (e.g. `skill-comply/` with `fixtures/`, `prompts/`, `scripts/`, `tests/`, and a `pyproject.toml`; `agent-self-evaluation/` with `examples/`, `references/`, `scripts/`, `templates/`.
- Agent-facing configuration lives in `agents/openai.yaml` files within skills that integrate with OpenAI-compatible hosts, standardizing model selection and tool exposure across skills.
