---
description: Update the repository wiki (engine-agnostic — works with any agent)
---

The wiki contract lives in repowiki/AGENTS.md — READ IT FIRST and follow it exactly.

The wiki root is repowiki/ (layout: wiki/cards flat, wiki/concepts, repo/, projects/{apps,packages,sites,other}, INDEX.md per folder, wiki/TAGINDEX.md).

## Instructions

1. Read repowiki/AGENTS.md and repowiki/README.md for the contract
2. Identify the files changed since the last wiki update: `git diff --name-only HEAD~5 HEAD`
3. For each changed path, run `python3 repowiki/scripts/affected.py <path>` to find the wiki pages that reference it
4. Update ONLY those pages (plus related INDEX.md / TAGINDEX.md if names or tags change)
5. If new modules/features are added without coverage, create a new flat card under repowiki/wiki/cards/ or a page under repo/ / projects/ as appropriate
6. Re-run `python3 repowiki/scripts/generate-index.py` to refresh INDEX.md + TAGINDEX.md
7. Run `python3 repowiki/scripts/validate.py` to confirm the contract

## Formatting Rules

- Frontmatter per the layer schema in AGENTS.md; title lives ONLY in frontmatter — never add a top-level # H1
- Kebab-case filenames
- File-relative markdown links only: [label](target.md), no file://, no [[wikilinks]]
- <cite> blocks use file-relative links

## Constraints

- Do NOT modify any source code files
- Only create/modify files within `repowiki/`
