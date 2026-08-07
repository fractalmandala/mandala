---
title: Fractal Agentic Skills Catalog — Unique Setup and Commands
description: Many skills require host-side installation: ~/.claude/skills/<skill/ placement, hook registration in ~/.claude/settings.json, or running per-skill installers like scripts/install-agents.sh --check. C…
tags: [packages/fractal_agentic/plugin_core/skills]
type: card
module: packages/fractal_agentic/plugin_core/skills
path: packages/fractal_agentic/plugin_core/skills
created: 2026-08-05
updated: 2026-08-06
---

Many skills require host-side installation: `~/.claude/skills/<skill>/` placement, hook registration in `~/.claude/settings.json`, or running per-skill installers like `scripts/install-agents.sh --check`. Continuous-learning-v2 requires PreToolUse/PostToolUse hooks pointing to `hooks/observe.sh`. MemClaw needs an OpenClaw gateway plugin configured in `openclaw.json` with `plugins.slots.memory = memclaw`. Skill-comply runs via `python -m skill_comply.scripts.run` from its own `pyproject.toml`.
