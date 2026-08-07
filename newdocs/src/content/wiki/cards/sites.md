---
title: Sites Module
description: SvelteKit websites under sites/ — blog, knowledge wiki, Sanskrit corpus, docs, home, agent-memory, agentic site; per-site .gitignore noise patterns.
tags: [sites, sveltekit, web, fractaldesign, fractalmandala, fractalmem, fractalwiki]
type: card
module: sites
path: sites
created: 2026-08-04
updated: 2026-08-06
---

SvelteKit websites. Each is a standalone SvelteKit project (own `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`. Several are deployed to their own domains.

## In-scope sites

| Site | Path | Domain / role |
|---|---|---|
| fractaldesign | `sites/fractaldesign` | [fractaldesign.in](https://www.fractaldesign.in) — design & web-dev blog + curation. |
| fractalmandala | `sites/fractalmandala` | [fractalmandala.in](https://www.fractalmandala.in) — author's blog + knowledge wiki. |
| fractalmem | `sites/fractalmem` | Experimental site + package for Sanskrit-based agent memory. |
| fractaldocs | `sites/fractaldocs` | Documentation site. |
| fractalhome | `sites/fractalhome` | Home / landing site. |
| fractalagentic | `sites/fractalagentic` | Site for the fractal-agentic orchestration package. |
| fractalwiki | `sites/fractalwiki` | Wiki site; its AGENTS.md wires the **continuous LLM wiki** — if `FRACTAL_WIKI_ROOT` resolves, prefer `/wiki-query` for prior decisions; after `/orchestrate`, soft-capture an episode under `raw/fractal/` (description required). |

## Excluded site
`sites/fractaldharma` ([fractaldharma.in](https://www.fractaldharma.in), a Sanskrit text corpus site) is in the root `.gitignore` as a separately-tracked repo and is excluded from this build.

## Conventions
- Same stack as the rest of the monorepo: SvelteKit + Svelte 5 runes + indented SASS + TypeScript.
- Several sites vendor `appshell-svelte` under their own `vendor/` (e.g. fractaldesign, fractalagentic site) — each vendor copy ignores `node_modules/`, `dist/`, `.svelte-kit/`.
- Standard per-site `.gitignore` excludes `node_modules`, `.output`, `.vercel`, `.netlify`, `.wrangler`, `/.svelte-kit`, `/build`, OS junk, env, vite timestamps, logs.

See [Apps Module](../concepts/apps.md), [Packages Module](../concepts/packages.md).
