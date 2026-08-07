---
title: Fractal Agentic Documentation Site (SVOCS) — Unique Setup and Commands
description: Build runs vite build && node scripts/search/postbuild.mjs && node/scripts/og/generate.mjs; search indexing is selected via PUBLICSVOCSSEARCHPROVIDER (default flexsearch, also supports pagefind, oram…
tags: [sites/fractalagentic]
type: card
module: sites/fractalagentic
path: sites/fractalagentic
created: 2026-08-05
updated: 2026-08-06
---

Build runs `vite build && node scripts/search/postbuild.mjs && node/scripts/og/generate.mjs`; search indexing is selected via `PUBLIC_SVOCS_SEARCH_PROVIDER` (default `flexsearch`, also supports `pagefind`, `orama`, `typesense`, `chroma`. Open Graph card generation can be skipped with `SVOCS_OG=0`. Deno users run equivalent tasks via `deno task dev|build|search:index|preview|check|lint|format`. Deploying under a sub-path requires setting `BASE_PATH` (e.g. GitHub Pages).
