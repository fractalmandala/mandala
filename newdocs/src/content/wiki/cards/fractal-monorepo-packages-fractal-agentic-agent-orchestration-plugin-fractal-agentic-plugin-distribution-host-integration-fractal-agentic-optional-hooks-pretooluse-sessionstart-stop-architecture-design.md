---
title: Fractal Agentic Optional Hooks (PreToolUse / SessionStart / Stop) — Architecture Design
description: The module is a collection of standalone Node.js scripts under scripts/ plus host-specific JSON manifests that map events to those scripts. profiles.json declares three activation tiers (minimal, sta…
tags: [packages/fractal_agentic/plugin_core/hooks]
type: card
module: packages/fractal_agentic/plugin_core/hooks
path: packages/fractal_agentic/plugin_core/hooks
created: 2026-08-05
updated: 2026-08-06
---

The module is a collection of standalone Node.js scripts under `scripts/` plus host-specific JSON manifests that map events to those scripts. `profiles.json` declares three activation tiers (`minimal`, `standard`, `strict` keyed by hook IDs; each script calls `lib.js` utilities (`hookEnabled`, `skipIfDisabled`, `allow`, `block` to honor the active profile and `FRACTAL_DISABLED_HOOKS`. Two host entry points exist: `hooks.claude.json` (Claude `PreToolUse`/`SessionStart`/`Stop` with matchers like `Bash` and `Write|Edit|MultiEdit` and `hooks.cursor.json` (Cursor's `sessionStart`/`beforeShellExecution`/`afterFileEdit`/`stop`. The `.fractal-agentic/hooks.claude.json` is a materialized copy with absolute paths written by `install-hooks.sh`, tracked in `hooks-installed.json`. Scripts are intentionally host-portable — they resolve plugin root via `FRACTAL_AGENTIC_ROOT` or `__dirname` fallback and never hard-code paths. Dependency direction is one-way: every script depends only on `lib.js`; no inter-script communication occurs at runtime.
