---
title: Fractal Agentic Qoder Plugin (Orchestration Armory) — Coding Conventions
description: - Each skill is a self-contained directory under skills/<id/ containing a SKILL.md entrypoint, with optional scripts/, references/, templates/, and agents/ subdirectories — no symlinks to external re…
tags: [packages/fractal_agentic_qoder_plugin]
type: card
module: packages/fractal_agentic_qoder_plugin
path: packages/fractal_agentic_qoder_plugin
created: 2026-08-05
updated: 2026-08-06
---

- Each skill is a self-contained directory under `skills/<id>/` containing a `SKILL.md` entrypoint, with optional `scripts/`, `references/`, `templates/`, and `agents/` subdirectories — no symlinks to external repos.
- Each command is a single markdown file under `commands/` named after its slash token (e.g., `activate-boss-design.md`, `orchestrate.md` and cross-referenced from `commands/INDEX.md`.
- Each boss playbook follows the same shape: an `INDEX.md` declaring mission, mapped agents/skills/commands, phases, verification defaults, and handoffs, selected exclusively by the `AGENTS.md` router.
- Agent definitions pair a markdown prompt file (`.md` with a TOML configuration file (`.toml` defining `agent_type`, model pins, and spawn metadata, installed via `install-agents.sh` without overwriting existing files.
- Hook scripts under `hooks/scripts/` are invoked through `hooks.<host>.json` event matchers (PreToolUse, SessionStart, Stop) using `${FRACTAL_AGENTIC_ROOT}` path resolution and short timeouts (5–120s).
- All installer and verification scripts use `set -eu`, explicit argument parsing, preflight checks, staged temp-file writes, and post-install exactness comparisons — never mutating user files.
