---
task: kebab-case-nortion
status: done
host: codex
branch: main
boss: meta
updated: 2026-08-11
---

# Handoff — Kebab-case Notion export names

## Where we are
Renamed every file and directory under `sites/mandalarepo/docs/nortion/` to lowercase
kebab-case. The final tree contains 210 files and 43 nested directories, with no
collisions or temporary rename files. Unicode letters in Sanskrit names were preserved;
separators and punctuation were normalized. File contents and internal link text were
not rewritten.

## Decisions
- Converted spaces, underscores, punctuation, ampersands, and Unicode dashes to hyphens.
- Converted `&` to `and` and `@` to `at`.
- Preserved Unicode letters/diacritics and stable Notion ID suffixes.
- Renamed hidden metadata such as `.DS_Store` to `.ds-store` and `_index.yaml` to `index.yaml`.

## Remaining
- [ ] Update internal links or CSV references if link integrity is required.
- [ ] Stage and commit the rename when the user is ready.

## Gotchas
- Because paths changed, Markdown/CSV references containing old path names may now need link updates.
- The repository's fsmonitor reports an IPC warning during `git status`; it does not affect the rename.

## Key files
- `sites/mandalarepo/docs/nortion/` — fully normalized tree.
- `handoffs/2026-08-11-kebab-case-nortion.md` — task handoff state.
