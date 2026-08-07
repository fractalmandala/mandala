---
title: Fractal Sites — Static Documentation & Knowledge Publishing Hub — Unique Setup and Commands
description: Each site is developed independently via npm run dev (or blume dev for fractalhome) and built via npm run build. Sites using search or OG cards chain postbuild steps (e.g., scripts/search/postbuild.m…
tags: [sites]
type: card
module: sites
path: sites
created: 2026-08-05
updated: 2026-08-06
---

Each site is developed independently via `npm run dev` (or `blume dev` for fractalhome) and built via `npm run build`. Sites using search or OG cards chain postbuild steps (e.g., `scripts/search/postbuild.mjs` and `scripts/og/generate.mjs` in fractalagentic/fractaldocs). The `fractalmandala` site includes a `sync-banks` script to synchronize local Markdown vaults.
