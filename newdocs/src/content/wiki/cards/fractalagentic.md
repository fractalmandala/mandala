---
title: fractalagentic
description: SVOCS-based documentation site for the Fractal Agentic plugin — markdown content routes, live-component .svx support, and Pagefind search.
tags: [site, docs, svocs, fractal-agentic]
type: card
module: sites/fractalagentic
path: sites/fractalagentic
created: 2026-08-06
updated: 2026-08-06
---

`sites/fractalagentic` is the documentation site for the Fractal Agentic plugin, built with [SVOCS](https://github.com/juddisjudd/svocs). It is a static, content-driven site: every `.md` (or `.svx` for live components) file under `content/` becomes a route automatically.

## Workflow

```sh
bun install
bun run dev      # http://localhost:5173
bun run build    # prerenders every page + Pagefind search index
bun run preview
```

## Authoring

- Drop a `.md` / `.svx` file under `content/` — it becomes a route.
- Sidebar and navigation follow the SVOCS authoring schema (see the [Writing Content](https://svocs.dev/docs/writing-content) and [Navigation](https://svocs.dev/docs/navigation) guides).
- `.svx` files can embed live Svelte components in docs.

## Notes

- Site tooling is `bun`-first; the package uses `deno.json`, `vite.config.ts`, and a `scripts/` folder for auxiliary tooling.
- Debug notes live at the site root (`debug-contextual-sidebar-empty.md`, `debug-css-gap-flash.md` — working notes, not docs.
- Related knowledge: see the fractal-agentic card for the plugin's boss-orchestration runtime that this site documents.
