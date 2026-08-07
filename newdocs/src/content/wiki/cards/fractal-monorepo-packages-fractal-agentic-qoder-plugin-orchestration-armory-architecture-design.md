---
title: Fractal Agentic Qoder Plugin (Orchestration Armory) — Architecture Design
description: The package is a flat plugin root (FRACTALAGENTICROOT) consumed by multiple hosts (Claude Code, Codex, Gemini, Kimi, OpenCode, Cursor) via thin shims (CLAUDE.md, GEMINI.md, KIMI.md, OPENCODE.md) and…
tags: [packages/fractal_agentic_qoder_plugin]
type: card
module: packages/fractal_agentic_qoder_plugin
path: packages/fractal_agentic_qoder_plugin
created: 2026-08-05
updated: 2026-08-06
---

The package is a flat plugin root (`FRACTAL_AGENTIC_ROOT` consumed by multiple hosts (Claude Code, Codex, Gemini, Kimi, OpenCode, Cursor) via thin shims (`CLAUDE.md`, `GEMINI.md`, `KIMI.md`, `OPENCODE.md` and per-host manifest files (`.claude-plugin/plugin.json`, `.qoder-plugin/plugin.json`, `plugin.json`. Core orchestration lives in three parallel directories: `agents/` (TOML + markdown agent definitions), `skills/` (vendored SKILL.md packages with optional scripts/references/templates), and `commands/` (slash-command markdown entries). The startup router is `AGENTS.md`, which selects exactly one of seven nested boss playbooks under `docs/bosses/<boss>/INDEX.md`; each boss playbook maps its own agents, skills, commands, phases, and verification defaults. The executable runtime contract is `skills/boss-orchestration/SKILL.md` plus its `references/` (role-contracts, routing-matrix, handoffs, boss-prompts). Optional hooks are declared in `hooks/hooks.<host>.json` and implemented as Node.js scripts under `hooks/scripts/`, invoked on PreToolUse, SessionStart, and Stop events. Installation and health are driven by shell scripts under `scripts/` (`install-agents.sh`, `check-armory.sh`, `verify.sh`, `resolve-plugin-root.sh` that never overwrite user files and enforce non-blocking progression. Evaluation tooling lives in `evaluation_scripts/` (latency check, load simulator). Dependency direction is strictly outward: the plugin reads project-local `AGENTS.md` for conventions but never mutates it; all content is read-only at runtime except for hook-triggered side effects.
