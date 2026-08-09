---
title: "Wiki schema & frontmatter"
description: "Canonical rules: skills/llm-wiki/references/wiki-schema.md"
type: guide
---

# Wiki schema & frontmatter

**Canonical rules:** [`skills/llm-wiki/references/wiki-schema.md`](../../skills/llm-wiki/references/wiki-schema.md)

## Directories

| Path | Role |
|---|---|
| `raw/` | Immutable sources (LLM does not edit) |
| `raw/fractal/` | Append-only orchestrate/boss episodes |
| `raw/assets/` | Images / attachments |
| `wiki/sources/` | One summary page per ingested source |
| `wiki/entities/` | People, orgs, products, tools, packages |
| `wiki/concepts/` | Ideas, frameworks, patterns, decisions |
| `wiki/synthesis/` | Comparisons, analyses, filed query outputs |
| `wiki/index.md` | Catalog — one line per page from **description** |
| `wiki/log.md` | Append-only operations log |
| `output/` | Generated reports / decks |

## Required frontmatter (every wiki page)

```yaml
---
title: Alert Dialog Focus Trap
description: How FractalSvelte alert dialog returns focus and handles Escape.
tags: [a11y, dialog, fractalsvelte]
sources: [2026-08-02-orchestrate-sidebar.md]
created: 2026-08-02
updated: 2026-08-02
type: concept
boss: svelte          # optional
project: fractalsvelte  # optional
---
```

### `description` (required)

- One line, **≤ 120 characters**  
- Used in `wiki/index.md` and search snippets  
- Every wiki page **and** every `raw/fractal/` episode must have it  
- `/wiki-lint` treats missing `description` as an **error**

## Fractal episode (`raw/fractal/`)

```yaml
---
title: Orchestrate — sidebar channel fixes
description: Ship verdict for sidebar/header layout and focus under Svelte Boss.
tags: [orchestrate, sidebar]
type: episode
boss: svelte
status: ship
project: fractalsvelte
capability_mode: fallback
created: 2026-08-02
updated: 2026-08-02
---
```

## Wikilinks

- Use `[[Page Title]]` (Title Case), not filenames  
- Filenames are kebab-case `.md`  

## Index line

```markdown
- [[Alert Dialog Focus Trap]] — How FractalSvelte alert dialog returns focus and handles Escape.
```
