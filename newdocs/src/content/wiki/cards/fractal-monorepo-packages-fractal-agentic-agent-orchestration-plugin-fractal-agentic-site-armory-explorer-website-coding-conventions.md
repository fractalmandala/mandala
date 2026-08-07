---
title: Fractal Agentic Site — Armory Explorer Website — Coding Conventions
description: - Each armory item type (agent, skill, command, doc) follows the same pattern: an entries generator enumerates slugs from the catalog, prerender = true enables static generation, and a load function…
tags: [packages/fractal_agentic/site]
type: card
module: packages/fractal_agentic/site
path: packages/fractal_agentic/site
created: 2026-08-05
updated: 2026-08-06
---

- Each armory item type (agent, skill, command, doc) follows the same pattern: an `entries` generator enumerates slugs from the catalog, `prerender = true` enables static generation, and a `load` function fetches the entry by slug and returns `{ entry, html, credit?, pager? }`.
- Content is never duplicated in the site — all agent/boss/skill/command/doc markdown is read from the sibling `plugin/` package via `import.meta.glob(..., { query: '?raw', import: 'default', eager: true })` and parsed through shared `parseFrontmatter`/`renderMarkdown` helpers.
- Catalog entries are memoized at module scope (`_skills`, `_agents`, `_commands`, `_docs` so repeated calls to `list*()` return the same sorted array without re-parsing markdown.
- UI components are colocated under `src/lib/comps/` and re-exported through a single barrel `src/lib/index.ts`, keeping route pages importing only from `$lib` rather than relative paths.
- Route parameters map one-to-one with filesystem slugs derived from file names (e.g. `plugin/agents/<slug>.md` → `/agents/[slug]`, with `pathSlug` extracting the identifier from the glob path.
