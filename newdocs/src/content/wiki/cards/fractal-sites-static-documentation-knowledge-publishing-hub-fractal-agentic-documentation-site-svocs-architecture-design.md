---
title: Fractal Agentic Documentation Site (SVOCS) — Architecture Design
description: The site follows the standard SvelteKit layout: src/routes/ defines all pages via file-based routing, with catch-all routes like docs/[...slug]/, agents/[slug]/, bosses/[slug]/, skills/[slug]/, and c…
tags: [sites/fractalagentic]
type: card
module: sites/fractalagentic
path: sites/fractalagentic
created: 2026-08-05
updated: 2026-08-06
---

The site follows the standard SvelteKit layout: `src/routes/` defines all pages via file-based routing, with catch-all routes like `docs/[...slug]/`, `agents/[slug]/`, `bosses/[slug]/`, `skills/[slug]/`, and `commands/[slug]/` driven by content under `content/`. Content is authored as `.md`/`.svx` files alongside per-page `.meta.json` files and directory-level `_meta.json` for sidebar ordering; `src/lib/core/content.ts` eagerly globs these modules to build slugs, TOC entries, word counts, and last-modified dates. A custom Vite plugin (`virtual:svocs-content-dates` computes git commit dates at build time. The app shell lives in `src/routes/+layout.svelte` and composes shared UI from `$lib/themes/docs/` (sidebar, search dialog, theme toggle, TOC). Static assets (fonts, KaTeX, images) sit under `static/`. Build-time post-processing scripts in `scripts/` generate the Pagefind/FlexSearch index (`postbuild.mjs` and Open Graph PNG cards per route (`og/generate.mjs`. The site is deployed as a static SPA via `@sveltejs/adapter-static` with a `200.html` fallback, and supports both Node and Deno toolchains through parallel `package.json` and `deno.json` task definitions.
