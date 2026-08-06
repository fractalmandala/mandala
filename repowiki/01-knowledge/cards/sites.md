---
title: Sites Module
description: SvelteKit websites under sites/ — blog, wiki, docs, home, agent-memory, agentic site; per-site .gitignore noise patterns.
tags: [sites, sveltekit, web, module]
type: card
module: sites
path: /Users/amrit/mandala/sites
created: 2026-08-04
updated: 2026-08-04
relates_to: [mandala-root, apps, packages]
---

# Sites Module

- **Path:** `/Users/amrit/mandala/sites`
- **What:** SvelteKit websites. Each is standalone (own `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`); several deployed to own domains.
- **In-scope sites:**
  - `fractaldesign` → fractaldesign.in (design/web-dev blog + curation)
  - `fractalmandala` → fractalmandala.in (author blog + knowledge wiki)
  - `fractalmem` — experimental site + package for Sanskrit-based agent memory
  - `fractaldocs` — documentation site
  - `fractalhome` — home/landing site
  - `fractalagentic` — site for the fractal-agentic package
  - `fractalwiki` — wiki site; AGENTS.md wires continuous LLM wiki (`FRACTAL_WIKI_ROOT` → `/wiki-query`; after `/orchestrate` capture episode under `raw/fractal/`)
- **Excluded:** `fractaldharma` (fractaldharma.in, Sanskrit text corpus) — separately-tracked, root `.gitignore`.
- **Stack:** SvelteKit + Svelte 5 runes + indented SASS + TypeScript.
- **Vendoring:** several sites carry `vendor/appshell-svelte/` (each vendor copy ignores `node_modules/`, `dist/`, `.svelte-kit/`).
- **Per-site .gitignore:** `node_modules`, `.output`, `.vercel`, `.netlify`, `.wrangler`, `/.svelte-kit`, `/build`, OS junk, env, vite timestamps, logs.
