---
title: Fractal Sites — Static Documentation & Knowledge Publishing Hub — Architecture Design
description: Each subdirectory under sites/ is a self-contained static site with its own package.json, vite.config.ts (or blume.config.ts for fractalhome), and SvelteKit/Astro app structure (src/routes, src/lib,…
tags: [sites]
type: card
module: sites
path: sites
created: 2026-08-05
updated: 2026-08-06
---

Each subdirectory under `sites/` is a self-contained static site with its own `package.json`, `vite.config.ts` (or `blume.config.ts` for fractalhome), and SvelteKit/Astro app structure (`src/routes`, `src/lib`, `static`, `content`. There is no shared runtime code between them; they are orchestrated only at the repository level as sibling projects. Most sites follow the same SvelteKit + mdsvex + Vite pattern with `@sveltejs/adapter-static` or `@sveltejs/adapter-vercel`, while fractalhome uses Blume on top of Astro. Content is authored as Markdown/MDSVX in each site's `content/` directory and rendered into routes via SvelteKit's file-based routing. Cross-site cohesion comes from shared tooling conventions rather than shared code: all sites use TypeScript, ESLint + Prettier, and many depend on `fractals-styler` for consistent styling.
