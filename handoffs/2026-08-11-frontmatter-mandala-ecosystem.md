---
task: frontmatter-mandala-ecosystem
status: done
host: codex
branch: main
boss: meta
updated: 2026-08-11
---

# Handoff — Markdown frontmatter for Mandala ecosystem

## Where we are
Added a quoted `title` field to all 34 Markdown files under
`mandala-monorepo-fractal-ecosystem/`, preserving each existing `description`,
`module_id`, and `updated_at` field. Removed the first body-level H1 from every file.
Validation passed for required fields and opening-H1 removal.

## Decisions
- Derived each title from the original opening H1.
- Preserved existing metadata rather than replacing it.
- Removed only the initial H1; all later headings and body content remain intact.

## Remaining
- [ ] Stage and commit the metadata updates when the user is ready.

## Gotchas
- The target tree is untracked in Git, so Git status reports files as new rather than showing a rename/edit diff.
- The repository's fsmonitor reports an IPC warning during `git status`; it does not affect the Markdown changes.

## Key files
- `mandala-monorepo-fractal-ecosystem/**/*.md` — updated Markdown documents.
- `handoffs/2026-08-11-frontmatter-mandala-ecosystem.md` — task handoff state.
