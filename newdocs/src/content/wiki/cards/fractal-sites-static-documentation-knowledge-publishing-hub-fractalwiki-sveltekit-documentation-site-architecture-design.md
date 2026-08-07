---
title: Fractalwiki SvelteKit Documentation Site — Architecture Design
description: Built as a SvelteKit application deployed via the Vercel adapter (@sveltejs/adapter-vercel with Node.js 22 runtime). The app follows SvelteKit's file-based routing: src/routes/+layout.svelte provides…
tags: [sites/fractalwiki]
type: card
module: sites/fractalwiki
path: sites/fractalwiki
created: 2026-08-05
updated: 2026-08-06
---

Built as a SvelteKit application deployed via the Vercel adapter (`@sveltejs/adapter-vercel` with Node.js 22 runtime). The app follows SvelteKit's file-based routing: `src/routes/+layout.svelte` provides the shell (Sidebar, Header, SearchModal, theme state), `+layout.server.ts` loads shared site config and navigation data at build time, `+page.svelte` is the home dashboard, and `[...slug]/+page.server.ts` + `+page.svelte` render individual documents. Server-side logic lives under `src/lib/server/`: `config.ts` reads `site-config.json` into typed interfaces (`SiteConfig`, `GroupConfig`, `SectionConfig` with in-memory caching; `vault.ts` scans the external vault root (`vaultRootPath` from config) for `.md` files, parses YAML frontmatter, extracts headings, builds a slug-to-doc Map, and resolves both `[text](target)` markdown links and `[[wiki]]` links to canonical routes; `markdown.ts` implements a lightweight regex-based Markdown-to-HTML renderer. Client components under `src/lib/components/` (FrontmatterInspector, Header, SearchModal, Sidebar, TableOfContents) consume the server-provided data. Styling uses SASS without braces/semicolons driven by the `fractals-styler` Vite plugin, which generates utility classes and CSS custom properties from `src/lib/styles/`. Content is sourced from an external filesystem path (`/Users/amrit/100cabinet/10wiki` defined in `site-config.json`, making the site a read-only renderer over that vault.
