---
title: fractalmem — SKAA SvelteKit Site & Measurement Harness — Unique Setup and Commands
description: npm run dev / npm run build / npm run preview drive the SvelteKit app. The SKAA server is not built by npm — it is installed into a target project via ./scripts/install.sh <project-path, which sets u…
tags: [sites/fractalmem]
type: card
module: sites/fractalmem
path: sites/fractalmem
created: 2026-08-05
updated: 2026-08-06
---

`npm run dev` / `npm run build` / `npm run preview` drive the SvelteKit app. The SKAA server is not built by npm — it is installed into a target project via `./scripts/install.sh <project-path>`, which sets up either a `uv` or `venv` environment, initializes `smriti.db`, runs `--selftest`, and prints an MCP config block. Probes are executed with `python3 scripts/run_probes.py` and `python3 scripts/behavioral_probes.py` after installation.
