---
title: Fractal Monorepo Packages — Unique Setup and Commands
description: Each package follows the same script convention: dev (vite dev), build (vite build + prepack), prepack (svelte-kit sync && svelte-package && publint), check (svelte-kit sync && svelte-check), lint, f…
tags: [packages]
type: card
module: packages
path: packages
created: 2026-08-05
updated: 2026-08-06
---

Each package follows the same script convention: `dev` (vite dev), `build` (vite build + prepack), `prepack` (svelte-kit sync && svelte-package && publint), `check` (svelte-kit sync && svelte-check), `lint`, `format`. The fractal-agentic package additionally exposes a `fractal-agentic` CLI binary and ships host plugin manifests (.claude-plugin, .codex-plugin).
