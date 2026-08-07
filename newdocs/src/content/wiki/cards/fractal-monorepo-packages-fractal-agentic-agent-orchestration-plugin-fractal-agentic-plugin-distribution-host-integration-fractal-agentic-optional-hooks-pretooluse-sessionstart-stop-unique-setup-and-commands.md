---
title: Fractal Agentic Optional Hooks (PreToolUse / SessionStart / Stop) — Unique Setup and Commands
description: Installation is user-driven via sh \"$FRACTALAGENTICROOT/scripts/install-hooks.sh\" --target <config|claude|cursor|project|all --profile <minimal|standard|strict --project-dir .. After install, users s…
tags: [packages/fractal_agentic/plugin_core/hooks]
type: card
module: packages/fractal_agentic/plugin_core/hooks
path: packages/fractal_agentic/plugin_core/hooks
created: 2026-08-05
updated: 2026-08-06
---

Installation is user-driven via `sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --target <config|claude|cursor|project|all> --profile <minimal|standard|strict> --project-dir .`. After install, users `source ~/.config/fractal-agentic/env.sh` and restart their agent. Status can be checked with `/hooks-status` or `--check`. Profiles and disabled hooks are controlled through `FRACTAL_HOOK_PROFILE` and `FRACTAL_DISABLED_HOOKS` environment variables.
