---
task: normalize-mandalarepo-docs
status: done
host: openai/gpt-5.6-luna
branch: current worktree
boss: code
updated: 2026-08-11
---

# Handoff — Normalize Mandalarepo docs

## Where we are
Completed the requested cleanup in `sites/mandalarepo/docs`: all Markdown files have the required frontmatter shape, every remaining folder has an `INDEX.md`, non-Markdown files were removed, and empty folders were removed. Verification reports 683 Markdown files, 64 directories, 64 indexes, zero invalid frontmatter files, zero non-Markdown files, and zero empty directories.

## Decisions
- Treated the requested `@mandalarepo/docs` path as `sites/mandalarepo/docs` in this monorepo.
- Considered frontmatter valid when it has YAML delimiters plus `title` and `description` keys, including blank values as shown in the request.
- Each index lists direct Markdown files and child folders.
- Removed `docs-nav.ts`, generated JSON artifacts, and `.DS_Store` files because the request explicitly restricted the tree to Markdown files.

## Remaining
- [ ] Review and stage the generated docs tree when ready to commit.

## Gotchas
- The docs tree was previously untracked, so Git reports the directory as one untracked entry rather than showing individual file diffs until staged.

## Key files
- `sites/mandalarepo/docs/INDEX.md` — root documentation index.
- `sites/mandalarepo/docs/**/INDEX.md` — per-folder indexes.
