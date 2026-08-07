---
title: Fractal Agentic Site — Armory Explorer Website — Unique Setup and Commands
description: Run pnpm install && pnpm dev to start the dev server; pnpm build produces a static site via Vercel adapter; pnpm check runs svelte-kit sync && svelte-check; pnpm lint checks with Prettier and ESLint;…
tags: [packages/fractal_agentic/site]
type: card
module: packages/fractal_agentic/site
path: packages/fractal_agentic/site
created: 2026-08-05
updated: 2026-08-06
---

Run `pnpm install && pnpm dev` to start the dev server; `pnpm build` produces a static site via Vercel adapter; `pnpm check` runs `svelte-kit sync && svelte-check`; `pnpm lint` checks with Prettier and ESLint; `pnpm format` reformats with Prettier. Dev server allows reading the sibling `plugin/` directory via Vite's `server.fs.allow` so markdown content can be edited alongside the site.
