---
title: Mandala Monorepo Root
description: pnpm monorepo \"fractals\" tying apps/, sites/, packages/ together with a shared SvelteKit/Svelte5/Tauri/TS + indented-SASS stack.
tags: [monorepo, root, pnpm, sveltekit, tauri]
type: card
module: mandala-root
path: .
created: 2026-08-04
updated: 2026-08-06
---

- **Path:** `.`
- **Workspace:** pnpm monorepo; root `package.json` name `fractals` (private, type module), `pnpm-workspace.yaml`. `packageManager` pinned to `pnpm@11.13.1`.
- **Stack:** SvelteKit 2 + Svelte 5 (runes) + Tauri 2 + TypeScript; indented SASS (`.sass` styling only.
- **Top-level dirs:** `apps/` (desktop apps), `sites/` (websites), `packages/` (npm libs + agentic plugin), `vendors/` (third-party), `basedocs/`+`docs/learnings/` (docs), `deposits/` (gitignored media), `ide-workspaces/`.
- **Workspace scripts (root):** filter into `@fractals/desktop`, `@fractals/fractalbodha`, `@fractals/fractalbuilder`, `@fractals/fracta`; `setup:hooks`/`prepare` set `core.hooksPath .githooks`.
- **Excluded from knowledge build (root .gitignore, separately-tracked):** `apps/fractalknow`, `apps/fractalengine`, `apps/fractalai`, `deposits`, `sites/fractaldharma`.
- **External corpus included:** `/Users/amrit/100cabinet/10wiki/fractal-wiki`, `/Users/amrit/100cabinet/90AI`.
- **Agent process default:** Fractal Agentic plugin (best-effort, non-blocking) — see [Fractal Agentic System](fractal-agentic.md).
