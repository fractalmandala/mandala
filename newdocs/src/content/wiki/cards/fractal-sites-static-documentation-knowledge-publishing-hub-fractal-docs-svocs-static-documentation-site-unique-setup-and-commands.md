---
title: Fractal Docs — SVOCS Static Documentation Site — Unique Setup and Commands
description: dev runs vite dev; build runs vite build then executes both scripts/search/postbuild.mjs and scripts/og/generate.mjs to produce search indexes and OG images. Deno equivalents exist via deno task dev…
tags: [sites/fractaldocs]
type: card
module: sites/fractaldocs
path: sites/fractaldocs
created: 2026-08-05
updated: 2026-08-06
---

`dev` runs `vite dev`; `build` runs `vite build` then executes both `scripts/search/postbuild.mjs` and `scripts/og/generate.mjs` to produce search indexes and OG images. Deno equivalents exist via `deno task dev` / `deno task build`. `pagefind --site build` is invoked separately for the pagefind backend. `BASE_PATH` env var controls sub-path deployment (e.g. GitHub Pages projects). Shallow git clones will cause missing 'last updated' dates because git history is truncated.
