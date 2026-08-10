---
task: kebab-case-mandala-ecosystem
status: done
host: codex
branch: main
boss: meta
updated: 2026-08-11
---

# Handoff — Kebab-case Mandala ecosystem folder

## Where we are
Renamed the requested `Mandala Monorepo — Fractal Ecosystem` folder to
`mandala-monorepo-fractal-ecosystem`, including all nested directories and files.
The resulting tree contains 35 files and 6 directories; every name passes the
kebab-case validation check.

## Decisions
- Lowercased names and converted spaces, Unicode dashes, underscores, and punctuation to hyphens.
- Converted `&` to `and` and `@` to `at` for readable filesystem-safe names.
- Renamed `README.md` files to `readme.md` and `.DS_Store` to `.ds-store`.
- Contents were not modified.

## Remaining
- [ ] Stage and commit the rename when the user is ready.

## Gotchas
- The folder is currently untracked in Git, so Git status reports the renamed tree as new files rather than a rename diff.
- The repository's fsmonitor reports an IPC warning during `git status`; it does not affect the filesystem rename.

## Key files
- `mandala-monorepo-fractal-ecosystem/` — renamed target tree.
- `handoffs/2026-08-11-kebab-case-mandala-ecosystem.md` — task handoff state.
