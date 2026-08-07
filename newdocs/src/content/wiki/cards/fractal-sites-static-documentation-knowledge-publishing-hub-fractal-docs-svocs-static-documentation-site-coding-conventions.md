---
title: Fractal Docs — SVOCS Static Documentation Site — Coding Conventions
description: - Each Markdown content file under content/ has a sibling .meta.json for frontmatter, with global navigation order defined centrally in content/meta.json.
tags: [sites/fractaldocs]
type: card
module: sites/fractaldocs
path: sites/fractaldocs
created: 2026-08-05
updated: 2026-08-06
---

- Each Markdown content file under `content/` has a sibling `.meta.json` for frontmatter, with global navigation order defined centrally in `content/_meta.json`.
- Search providers are selected at build time via the `PUBLIC_SVOCS_SEARCH_PROVIDER` environment variable, with implementations isolated under `src/lib/search/providers/` and resolved through a central resolver.
- Post-build side effects (search indexing, OG image generation) are implemented as separate Node scripts executed after `vite build`, keeping the Vite config focused on asset compilation.
- Site-wide constants (name, description, URL, repo link) are exported from `src/lib/site.ts` rather than scattered across components, and consumed by routes, OG generator, and theme components.
- Virtual modules prefixed with `\0` (e.g. `virtual:svocs-content-dates` are used to inject build-time computed data into the SvelteKit module graph without polluting the source tree.
