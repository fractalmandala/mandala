---
title: Fractal Agentic Plugin Distribution & Host Integration — Coding Conventions
description: - Each host gets its own absolute-path hook manifest file named hooks.<host.json under .fractal-agentic/, with installation metadata recorded in hooks-installed.json.
tags: [packages/fractal_agentic/plugin_core]
type: card
module: packages/fractal_agentic/plugin_core
path: packages/fractal_agentic/plugin_core
created: 2026-08-05
updated: 2026-08-06
---

- Each host gets its own absolute-path hook manifest file named `hooks.<host>.json` under `.fractal-agentic/`, with installation metadata recorded in `hooks-installed.json`.
- Hook scripts are thin Node.js wrappers invoked via `node "<absolute-path>/plugin/hooks/scripts/<name>.js"` with explicit `timeout` values, never executed directly as shell commands.
- Installer operations use try/catch around `fs.cpSync`/`execSync` calls and log prefixed `[Host]` messages rather than throwing, so one host failure does not abort the others.
