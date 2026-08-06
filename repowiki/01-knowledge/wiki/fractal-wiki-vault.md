---
title: Fractal Wiki Vault
description: External LLM wiki vault at 100cabinet with raw→wiki→output three-layer architecture and ingest/capture/query/lint operations.
tags: [wiki, llm-wiki, knowledge, fractal-wiki, external, vault]
type: concept
created: 2026-08-04
updated: 2026-08-04
---

# Fractal Wiki Vault (external)

**Path:** `/Users/amrit/100cabinet/10wiki/fractal-wiki` — **outside** the mandala project root, included in this knowledge base via `wiki_plan.yaml` strong priors.

A continuous second brain for capturing, organizing, and synthesizing knowledge. The librarian/wiki-maintainer agent reads raw sources, compiles structured wiki pages, and maintains the vault over time.

## Three-layer architecture
- **`raw/`** — immutable source documents and fractal episodes. The LLM reads but **never modifies** external sources; it may only **append** new files under `raw/fractal/` for orchestrate/boss capture. Image attachments live under `raw/assets/`.
- **`wiki/`** — the LLM's workspace; create/update/maintain all files here.
- **`output/`** — reports, query results, generated artifacts.

## Wiki subdirectories
- `wiki/sources/` — one summary page per ingested source.
- `wiki/entities/` — people, organizations, products, tools, packages, components.
- `wiki/concepts/` — ideas, frameworks, theories, patterns, decisions.
- `wiki/synthesis/` — comparisons, analyses, cross-cutting themes (query outputs filed back).

## Special files
- `wiki/index.md` — master catalog; update on every page create/delete. Index lines ≤120 chars, aligned with each page's `description`.
- `wiki/log.md` — append-only chronological record; never edit past entries.

## Frontmatter (required on every wiki page)
```yaml
title: Page Title Here
description: One-line summary for indexes and retrieval (max 120 characters).
tags: [tag1, tag2]
sources: [source-or-episode-filename.md]
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: source | entity | concept | synthesis
boss: design | code | agent | svelte | creator | workflow | meta   # optional
project: repo-or-product-slug                                       # optional
```

## Fractal episode frontmatter (`raw/fractal/*.md`)
Append-only capture files:
```yaml
title: Orchestrate — short goal title
description: One-line outcome summary (max 120 characters).
tags: [orchestrate, sidebar]
type: episode
boss: svelte
status: ship | fix-first | rethink | in-progress | cancelled
project: fractalsvelte
capability_mode: degraded | pinned | pinned_partial | plugin_missing
paths: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
```

## Operations
- **Ingest** (new material in `raw/`): read source fully → discuss takeaways → create `wiki/sources/<slug>.md` → update/create entity/concept pages → add `[[wikilinks]]` → update index → append log `## [YYYY-MM-DD] ingest | Title`. One source may touch 10–15 wiki pages.
- **Capture** (Fractal episode): resolve vault root → write **only** `raw/fractal/<timestamp>-<slug>.md` → append log → do **not** auto-touch 15 wiki pages unless user runs ingest/crystallize.
- **Query:** read `wiki/index.md` (and description lines) first → optionally `qmd search` → read relevant pages → answer with citations → offer to save under `wiki/synthesis/`. Prefer wiki over raw.
- **Lint:** broken wikilinks, orphans, contradictions, stale claims, missing pages, index drift; frontmatter audit (missing description/title/dates is an error); report by severity; log lint pass. Cadence: after every ~10 ingests, monthly, before major synthesis queries.

## Page naming & links
- Filenames: **kebab-case** + `.md`; in-file titles **Title Case**.
- Wikilinks use **title**, not filename: `[[Entity Name]]` not `[[entity-name]]`.
- Images: `![alt](../raw/assets/name.png)` — never copy binaries into `wiki/`.

## Hard rules (selected)
1. Never modify files in `raw/` except append-only new files under `raw/fractal/`.
2. Always update `wiki/index.md` when creating/deleting a wiki page.
3. Always append `wiki/log.md` for operations.
4. Every wiki page and fractal episode must have **`description`**.
5. Vault missing or write failure → **warn; never block product delivery**.

See [[Cabinet 90AI]] (sibling external folder) and [[Fractal Agentic System]] (the orchestrator that captures episodes here).
