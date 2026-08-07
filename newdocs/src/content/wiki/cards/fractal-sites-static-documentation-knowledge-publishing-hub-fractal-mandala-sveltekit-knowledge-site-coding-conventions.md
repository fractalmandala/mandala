---
title: Fractal Mandala — SvelteKit Knowledge Site — Coding Conventions
description: - Each content bank mirrors a SvelteKit route folder structure with an INDEX.md frontmatter file (title, description, tags, sources, related) plus a CONNECTIONS.ts exporting topicMap, crossBanks, and…
tags: [sites/fractalmandala]
type: card
module: sites/fractalmandala
path: sites/fractalmandala
created: 2026-08-05
updated: 2026-08-06
---

- Each content bank mirrors a SvelteKit route folder structure with an `INDEX.md` frontmatter file (title, description, tags, sources, related) plus a `CONNECTIONS.ts` exporting `topicMap`, `crossBanks`, and `allTags` arrays sorted alphabetically.
- Post pages follow a uniform pattern: a list page at `<bank>/+page.svelte` rendering a grid of cards from `data.posts`, and a detail page at `<bank>/[post]/+page.svelte` wrapping content in a shared `Shell` component with breadcrumb navigation, tag pills, and a generated table-of-contents sidebar.
- New banks are added by creating a `src/content/<Bank>/` directory with `INDEX.md` and `CONNECTIONS.ts`, adding a matching route folder under `src/routes/`, and registering the bank in `src/lib/data/routes-config.json` so the layout loader can discover it automatically.
- Markdown content is authored in the external vault and copied into the site via the `sync-banks` script rather than edited directly in `src/content`, keeping the site as a published artifact of the vault.
- Global state (TOC visibility, window size) is accessed through Svelte stores imported from `$lib/utils/globalstores`, and UI transitions use `svelte/transition` together with `svelte-animated-icon` for consistent micro-interactions.
