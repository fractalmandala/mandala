---
title: fractalmandala
description: Personal knowledge site — SvelteKit writing vault with curated Writings, a wiki section, and a sync-banks script for bank content refresh.
tags: [site, sveltekit, content, writings, wiki]
type: card
module: sites/fractalmandala
path: sites/fractalmandala
created: 2026-08-06
updated: 2026-08-06
---

`sites/fractalmandala` is a SvelteKit content site (scaffolded with `sv`, Vercel adapter, mdsvex) serving as a personal writing vault. Content lives as markdown under `src/content/`.

## Content model

- `src/content/Writings/` — the writing corpus, organized as `raw/` drafts plus a curated `wiki/` of topic hubs (whiskey/spirits reviews, philosophy, dharma, web development, AI culture, design).
- `src/content/Writings/INDEX.md` and `CONNECTIONS.ts` drive the topic index and cross-linking graph.
- The repo-wide `assets/` folder is symlinked in for shared images.

## Tooling

- `pnpm sync-banks` → `node scripts/sync-banks.mjs` — refresh script for bank content (graph/bank data pulls).
- Standard `dev` / `build` / `preview` / `check` / `lint` scripts via SvelteKit.

## Related

- The shared graph data used by sibling sites lives under `static/graphs/` (e.g. `comparative-civilization/graph.json`.
