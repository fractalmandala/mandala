---
title: morphicons-svelte — Svelte 5 Icon Morphing Bindings — Unique Setup and Commands
description: Development workflow: pnpm install, then pnpm dev for the SvelteKit demo, pnpm check runs svelte-kit sync && svelte-check, pnpm test executes Vitest against tests//.test.ts, and pnpm build runs vite…
tags: [packages/morphicons_svelte]
type: card
module: packages/morphicons_svelte
path: packages/morphicons_svelte
created: 2026-08-05
updated: 2026-08-06
---

Development workflow: `pnpm install`, then `pnpm dev` for the SvelteKit demo, `pnpm check` runs `svelte-kit sync && svelte-check`, `pnpm test` executes Vitest against `tests/**/*.test.ts`, and `pnpm build` runs `vite build && svelte-package` to produce the distributable under `dist/`. Node engine requires >= 22.22.2 and pnpm 11.18.0.
