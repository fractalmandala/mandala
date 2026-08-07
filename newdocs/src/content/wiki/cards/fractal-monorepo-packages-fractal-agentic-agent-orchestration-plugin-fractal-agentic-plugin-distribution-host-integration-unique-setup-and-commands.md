---
title: Fractal Agentic Plugin Distribution & Host Integration — Unique Setup and Commands
description: npx fractal-agentic install [--target=<host|all] [--project] installs the plugin into detected hosts and optionally injects the AGENTS snippet; npx fractal-agentic verify delegates to scripts/verify.…
tags: [packages/fractal_agentic/plugin_core]
type: card
module: packages/fractal_agentic/plugin_core
path: packages/fractal_agentic/plugin_core
created: 2026-08-05
updated: 2026-08-06
---

`npx fractal-agentic install [--target=<host|all>] [--project]` installs the plugin into detected hosts and optionally injects the AGENTS snippet; `npx fractal-agentic verify` delegates to `scripts/verify.sh`; re-materializing hooks uses `sh plugin/scripts/install-hooks.sh --target project --project-dir <repo-root> --profile standard`.
