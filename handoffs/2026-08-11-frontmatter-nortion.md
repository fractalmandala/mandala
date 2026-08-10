---
task: frontmatter-nortion
status: done
host: codex
branch: main
boss: meta
updated: 2026-08-11
---

# Handoff — Markdown frontmatter for Notion export

## Where we are
Standardized all 182 Markdown files under `sites/mandalarepo/docs/nortion/` with YAML
frontmatter containing `title` and `description`. Existing frontmatter and metadata were
preserved, titles were derived from opening H1s or filenames, and opening H1 headings were
removed from document bodies. Validation passed for frontmatter fields and H1 removal.

## Decisions
- Used filename stems for records that had no opening H1.
- Preserved existing Notion-export metadata fields such as `kind`, `name`, `category`, and `scope`.
- Kept all non-opening headings and body content unchanged.

## Remaining
- [ ] Stage and commit the updates when the user is ready.

## Gotchas
- This is a large static Notion export; filenames, CSVs, and internal links were not changed.
- The repository's fsmonitor reports an IPC warning during `git status`; it does not affect these files.

## Key files
- `sites/mandalarepo/docs/nortion/**/*.md` — updated Markdown export files.
- `handoffs/2026-08-11-frontmatter-nortion.md` — task handoff state.
