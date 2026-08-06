---
title: Fractal Wiki Vault (external)
description: External LLM wiki vault at 100cabinet — raw/wiki/output three layers, required frontmatter with description, ingest/capture/query/lint ops.
tags: [external, wiki, llm-wiki, vault, fractal-wiki]
type: card
module: external/fractal-wiki
path: /Users/amrit/100cabinet/10wiki/fractal-wiki
created: 2026-08-04
updated: 2026-08-04
relates_to: [mandala-root, fractal-agentic, cabinet-90ai]
---

# Fractal Wiki Vault (external)

- **Path:** `/Users/amrit/100cabinet/10wiki/fractal-wiki` (outside project root; included via `wiki_plan.yaml` strong priors)
- **What:** A continuous second-brain LLM wiki. Librarian agent reads raw sources, compiles wiki pages, maintains the vault.
- **Three layers:** `raw/` (immutable sources + append-only `raw/fractal/` episodes; `raw/assets/` images) · `wiki/` (LLM workspace) · `output/` (reports/query results).
- **Wiki subdirs:** `sources/` (one page per ingested source), `entities/` (people/orgs/products/tools), `concepts/` (ideas/frameworks/patterns), `synthesis/` (comparisons/analyses).
- **Special files:** `wiki/index.md` (master catalog, ≤120-char lines aligned with each page's `description`), `wiki/log.md` (append-only chronological).
- **Required frontmatter (every page):** `title`, `description` (≤120 chars), `tags`, `sources`, `created`, `updated`, `type` (source|entity|concept|synthesis); optional `boss`, `project`.
- **Episode frontmatter (`raw/fractal/*.md`):** + `type: episode`, `status` (ship|fix-first|rethink|in-progress|cancelled), `capability_mode`, `paths`.
- **Operations:** ingest · capture · query · lint · crystallize.
- **Naming:** kebab-case `.md` filenames; Title Case in-file titles; wikilinks use title `[[Entity Name]]`; images `../raw/assets/name.png`.
- **Hard rules:** never modify `raw/` except append-only `raw/fractal/`; always update index on create/delete; always append log; every page+episode needs `description`; vault missing/write failure → warn, never block delivery.
