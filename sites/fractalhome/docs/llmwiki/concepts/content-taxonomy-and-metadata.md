---
title: Content Taxonomy and Metadata
description: Standardized YAML frontmatter schemas, category assignments, and kebab-case file naming for plain markdown vaults.
tags: [taxonomy, metadata, frontmatter, markdown, vault]
sources: [2026-08-02-195500-claudereg-essay-frontmatter-and-renaming.md]
created: 2026-08-02
updated: 2026-08-02
type: concept
boss: workflow
project: claudereg
---

**Content Taxonomy and Metadata** defines the rules and structure for organizing plain Markdown vaults (such as Markd vaults and essay corpora) with standardized YAML frontmatter and consistent file naming conventions.

## Core Schema

Every essay or note document includes top-level YAML frontmatter bounded by `---`:

```yaml
---
title: The Title of the Essay
description: A concise summary of the core thesis or topic.
category: consciousness | ai | history | decolonization
---
```

## Naming & File Conventions

1. **Title Alignment**: The `title` field in frontmatter serves as the single source of truth for the document title. Starting `# H1` and `## H2` header blocks are removed from the body to eliminate redundancy.
2. **Kebab-case Filenames**: Files are named using lower-kebab-case derived from the `title` (e.g., `The Wrong Question` becomes `the-wrong-question.md`).
3. **Collision Disambiguation**: When two essays share an identical title, the primary subtitle or context is appended to maintain unique, descriptive filenames.
4. **Core Categories**: Essays in the vault are classified under one of four primary domain categories: `consciousness`, `ai`, `history`, or `decolonization`.

## Related

- [[LLM-Maintained Wiki]]
