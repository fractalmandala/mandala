# Wiki Schema (Fractal Agentic LLM Wiki)

Canonical rules for the continuous LLM wiki. Vault agent configs (`AGENTS.md`, etc.)
embed this document. Single source of truth for structure and frontmatter.

## Architecture

Three directories, three roles:

- **raw/** — immutable source documents and fractal episodes. The LLM reads from here
  but NEVER modifies external sources. It may only **append** new files under
  `raw/fractal/` for orchestrate/boss capture.
- **wiki/** — the LLM's workspace. Create, update, and maintain all files here.
- **output/** — reports, query results, and generated artifacts.

Wiki subdirectories:

- `wiki/sources/` — one summary page per ingested source
- `wiki/entities/` — people, organizations, products, tools, packages, components
- `wiki/concepts/` — ideas, frameworks, theories, patterns, decisions
- `wiki/synthesis/` — comparisons, analyses, cross-cutting themes (query outputs filed back)

Special files:

- `wiki/index.md` — master catalog; update on every page create/delete
- `wiki/log.md` — append-only chronological record; never edit past entries

## Frontmatter (required on every wiki page)

```yaml
---
title: Page Title Here
description: One-line summary for indexes and retrieval (max 120 characters).
tags: [tag1, tag2]
sources: [source-or-episode-filename.md]
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: source | entity | concept | synthesis
# Optional Fractal fields:
boss: design | code | agent | svelte | creator | workflow | meta
project: repo-or-product-slug
---
```

### Field rules

| Field | Required | Rules |
|---|---|---|
| `title` | Yes | Title Case; matches `#` heading intent |
| **`description`** | **Yes** | One sentence, ≤120 chars; used in `wiki/index.md` |
| `tags` | Yes | Array of lowercase kebab or single words |
| `sources` | Yes on wiki pages | Filenames under `raw/` (or episode basenames) that support claims |
| `created` | Yes | `YYYY-MM-DD` |
| `updated` | Yes | `YYYY-MM-DD` on every edit |
| `type` | Recommended | `source` \| `entity` \| `concept` \| `synthesis` |
| `boss` | Optional | Active domain boss when page came from Fractal work |
| `project` | Optional | Product / repo slug |

**Index line format** (must reflect `description`):

```markdown
- [[Page Title]] — one-line summary under 120 characters
```

Prefer copying the page's `description` field into the index line.

## Fractal episode frontmatter (`raw/fractal/*.md`)

Append-only capture files. Schema:

```yaml
---
title: Orchestrate — short goal title
description: One-line outcome summary (max 120 characters).
tags: [orchestrate, sidebar]
type: episode
boss: svelte
status: ship | fix-first | rethink | in-progress | cancelled
project: fractalsvelte
capability_mode: fallback | pinned | pinned_partial | plugin_missing
paths: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Goal

## Decisions

## Outcome / evidence

## Open questions
```

`description` is required so episodes can be listed and searched without reading the body.

## Page naming

- Filenames: **kebab-case** + `.md`
- In-file titles: **Title Case**
- Wikilinks use **title**, not filename: `[[Entity Name]]` not `[[entity-name]]`

| Kind | Path example |
|---|---|
| Source | `wiki/sources/article-title.md` |
| Entity | `wiki/entities/entity-name.md` |
| Concept | `wiki/concepts/concept-name.md` |
| Synthesis | `wiki/synthesis/comparison-topic.md` |
| Episode | `raw/fractal/2026-08-02-orchestrate-sidebar.md` |

## Operations

### Ingest (new material in raw/)

1. Read the source completely (never edit it).
2. Prefer discussing key takeaways with the user before large multi-page updates.
3. Create `wiki/sources/<slug>.md` with full required frontmatter including **description**.
4. Update or create entity/concept pages; set `description` on each; update `sources` + `updated`.
5. Add `[[wikilinks]]` between related pages.
6. Update `wiki/index.md` (description-backed one-liners).
7. Append `wiki/log.md`: `## [YYYY-MM-DD] ingest | Title`

A single source may touch 10–15 wiki pages — normal.

### Capture (Fractal episode)

1. Resolve vault root; if missing, skip quietly (or one warning).
2. Write **only** `raw/fractal/<timestamp>-<slug>.md` with required episode frontmatter.
3. Append log: `## [YYYY-MM-DD] capture | Title`
4. Do **not** auto-touch 15 wiki pages unless the user runs ingest/crystallize.

### Query

1. Read `wiki/index.md` (and `description` lines) first.
2. Optionally `qmd search` if installed and wiki is large.
3. Read relevant wiki pages; follow `[[wikilinks]]`.
4. Answer with citations; offer to save valuable answers under `wiki/synthesis/`.
5. Prefer wiki over raw; raw only as last resort.

### Lint

1. Broken `[[wikilinks]]`, orphans, contradictions, stale claims, missing pages, index drift.
2. Frontmatter audit: missing `description` / `title` / dates is an **error**.
3. Report by severity; offer fixes; log lint pass.

## Log format

```markdown
## [YYYY-MM-DD] operation | Title
Brief description of what was done.
```

Operations: `setup`, `ingest`, `capture`, `query`, `lint`, `crystallize`.

## Image handling

1. Store attachments under `raw/assets/`.
2. From wiki pages: `![alt](../raw/assets/name.png)` — never copy binaries into `wiki/`.
3. During ingest, describe important figures in text so knowledge is not image-only.

## Lint frequency

- After every ~10 ingests
- Monthly at minimum
- Before major synthesis queries

## Hard rules

1. Never modify files in `raw/` except **append-only** new files under `raw/fractal/`.
2. Always update `wiki/index.md` when creating or deleting a wiki page.
3. Always append to `wiki/log.md` for operations.
4. Use `[[wikilinks]]` for internal references — not raw paths in prose.
5. Every wiki page and fractal episode must have **`description`**.
6. Note contradictions with both sources cited; prefer update over duplicate pages.
7. Keep source summaries factual; interpretation belongs in concepts/synthesis.
8. Query: wiki first, then raw.
9. Prefer updating existing pages over creating near-duplicates.
10. Index entries ≤120 characters (aligned with `description`).
11. Vault missing or write failure: **warn; never block product delivery**.
