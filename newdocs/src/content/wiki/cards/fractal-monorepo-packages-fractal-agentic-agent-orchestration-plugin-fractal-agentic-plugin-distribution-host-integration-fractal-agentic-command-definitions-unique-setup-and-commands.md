---
title: Fractal Agentic Command Definitions — Unique Setup and Commands
description: The INDEX.md must be updated whenever commands change; startup routers and boss playbooks should never hardcode command counts. Some commands require exporting environment variables such as FRACTALWI…
tags: [packages/fractal_agentic/plugin_core/commands]
type: card
module: packages/fractal_agentic/plugin_core/commands
path: packages/fractal_agentic/plugin_core/commands
created: 2026-08-05
updated: 2026-08-06
---

The INDEX.md must be updated whenever commands change; startup routers and boss playbooks should never hardcode command counts. Some commands require exporting environment variables such as `FRACTAL_WIKI_ROOT` before use. Health checks can be run via `sh <plugin>/scripts/check-armory.sh`.
