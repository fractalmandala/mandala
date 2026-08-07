---
title: Fractal Agentic Documentation Site (SVOCS) — Coding Conventions
description: - Content pages are paired .meta.json files next to their .md/.svx source, with directory-level meta.json controlling sidebar section order and separator headings.
tags: [sites/fractalagentic]
type: card
module: sites/fractalagentic
path: sites/fractalagentic
created: 2026-08-05
updated: 2026-08-06
---

- Content pages are paired `.meta.json` files next to their `.md`/`.svx` source, with directory-level `_meta.json` controlling sidebar section order and separator headings.
- Route load functions use `export const prerender = true` and throw SvelteKit `error(404, ...)` when content lookups fail, keeping pages fully static.
- Site-wide configuration (name, description, URL, repo link) is centralized in `src/lib/site.ts` and consumed by layouts, OG card generator, and edit-on-GitHub links.
- Build-time side effects are isolated in `scripts/*.mjs` invoked from npm/Deno tasks rather than inside Vite plugins, keeping the build pipeline explicit and testable.
- Theme and UI components live under `$lib/themes/docs/` and are imported via the `$lib/` alias, separating presentation logic from route handlers and content parsing.
