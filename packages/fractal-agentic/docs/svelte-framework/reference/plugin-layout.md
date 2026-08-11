---
title: "Plugin layout reference"
description: "Understand where user docs, skills, commands, scripts, references, and evals belong."
type: reference
---

# Plugin layout reference

The installable Fractal Agentic plugin is rooted at `packages/fractal-agentic/`.

```text
plugin.json                 plugin metadata and skill root
.codex-plugin/plugin.json   Codex plugin metadata mirror
AGENTS.md                   startup router and precedence
SOUL.md                     portable principles
skills/<name>/SKILL.md      reusable workflow instructions
skills/<name>/references/   deep reference material and schemas
skills/<name>/scripts/      executable validators and resolvers
skills/<name>/evals/        fixtures and prompt cases
commands/<name>.md          slash-command entry points
docs/                       human-facing guides shipped with the plugin
agents/                     optional capability-lane templates
scripts/                    package-wide verification and install tools
```

OpenAI describes plugins as packages that can contain skills, apps, and app templates.
Skill-only plugins are valid. [Plugins in Codex](https://help.openai.com/en/articles/20001256-plugins-in-codex/)

## Authoring rules

- Put user guidance in `docs/`.
- Put agent-required instructions in `SKILL.md`.
- Put detailed material needed only for a branch in `references/`.
- Put executable Python or JavaScript in `scripts/`.
- Put repeatable test inputs in `evals/`.
- Keep `plugin.json` and `.codex-plugin/plugin.json` valid and aligned.
- Update live indexes when adding a discoverable skill, command, or agent.

The plugin package is the distribution unit; the skill remains the reusable workflow
authoring unit.
