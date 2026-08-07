---
title: Fractalwiki SvelteKit Documentation Site — Unique Setup and Commands
description: Run pnpm dev for development, pnpm build for production, pnpm preview to serve the built output, and pnpm check to run svelte-check against tsconfig.json. The site depends on site-config.json having…
tags: [sites/fractalwiki]
type: card
module: sites/fractalwiki
path: sites/fractalwiki
created: 2026-08-05
updated: 2026-08-06
---

Run `pnpm dev` for development, `pnpm build` for production, `pnpm preview` to serve the built output, and `pnpm check` to run `svelte-check` against `tsconfig.json`. The site depends on `site-config.json` having a valid `vaultRootPath` pointing to an external Markdown vault (default `/Users/amrit/100cabinet/10wiki`; if the file or path is missing, the server falls back to a default config. The `prepare` script runs `svelte-kit sync` to generate `$types` used by route load functions.
