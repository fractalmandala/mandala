---
title: Fractal Docs — SVOCS Static Documentation Site — Architecture Design
description: Built on the SVOCS (Svelte + Vite + mdsvex) template, this is a fully static SvelteKit site deployed via @sveltejs/adapter-static with a 404 fallback for SPA-style routing. Content lives under conten…
tags: [sites/fractaldocs]
type: card
module: sites/fractaldocs
path: sites/fractaldocs
created: 2026-08-05
updated: 2026-08-06
---

Built on the SVOCS (Svelte + Vite + mdsvex) template, this is a fully static SvelteKit site deployed via `@sveltejs/adapter-static` with a 404 fallback for SPA-style routing. Content lives under `content/` as `.md` files paired with per-page `.meta.json` frontmatter and a top-level `_meta.json` that defines navigation ordering and separators. The build pipeline is driven by `vite.config.ts`, which wires mdsvex with remark-math, rehype-slug, rehype-autolink-headings, and rehype-katex-svelte for `$math$` support, plus a custom `highlightWithFilename` code highlighter. A virtual module `virtual:svocs-content-dates` walks git history to attach last-updated dates to each content file. Routing follows SvelteKit conventions: `src/routes/docs/[...slug]/+page.svelte` renders doc pages, while several `+server.ts` endpoints expose search indexes (`search-index.json`, `search-index.flexsearch.json`, sitemaps, and LLM-friendly text feeds (`llms.txt`, `llms-full.txt`. Search is pluggable via the `PUBLIC_SVOCS_SEARCH_PROVIDER` env var, defaulting to flexsearch but supporting pagefind, orama, typesense, and chroma through implementations in `src/lib/search/providers/`. Post-build scripts in `scripts/` handle index generation (`postbuild.mjs` and Open Graph image rendering (`og/generate.mjs` using `@takumi-rs/core`. Theme and site metadata are centralized in `src/lib/site.ts` and `src/lib/themes/docs/`, with components split across `src/lib/components/`, `src/lib/core/`, `src/lib/icons/`, and `src/lib/search/`.
