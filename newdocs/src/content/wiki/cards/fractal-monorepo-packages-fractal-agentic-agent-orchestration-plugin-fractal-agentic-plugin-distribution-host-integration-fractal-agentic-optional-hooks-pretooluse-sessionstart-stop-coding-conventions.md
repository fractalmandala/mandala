---
title: Fractal Agentic Optional Hooks (PreToolUse / SessionStart / Stop) — Coding Conventions
description: - Each hook script begins by calling lib.skipIfDisabled(hookId) so disabled hooks exit silently with code 0.
tags: [packages/fractal_agentic/plugin_core/hooks]
type: card
module: packages/fractal_agentic/plugin_core/hooks
path: packages/fractal_agentic/plugin_core/hooks
created: 2026-08-05
updated: 2026-08-06
---

- Each hook script begins by calling `lib.skipIfDisabled(hookId)` so disabled hooks exit silently with code 0.
- Blocking decisions use `lib.block(reason)` which writes a JSON payload with `decision: 'block'` and exits with code 2 (Claude-compatible), while allowing continues with `lib.allow(message)` and exit code 0.
- Hook input is parsed through `lib.parseInput` and tool fields are accessed via `toolInput`/`toolName`/`commandFrom`/`filePathFrom` helpers that normalize multiple host field naming conventions.
- Scripts resolve the plugin root via `lib.pluginRoot()`, which prefers `FRACTAL_AGENTIC_ROOT` and falls back to resolving up from `__dirname`, keeping scripts portable across installation targets.
- Host configuration lives in separate JSON files per IDE (`hooks.claude.json`, `hooks.cursor.json` that only declare event-to-command mappings without logic, while behavior is centralized in `profiles.json` and `scripts/lib.js`.
