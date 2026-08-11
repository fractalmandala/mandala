---
task: prune-mandalarepo-branch
status: complete
host: codex
updated: 2026-08-11T18:45:00+05:30
---

# Branch-prune handoff

Mandala now has one local branch: `main`. The merged local branch
`feat/mandalarepo-acrolls-docs-route` and its registered worktree at
`/Users/amrit/src/mandala/feat/mandalarepo-acrolls-docs-route` were removed. The remote has only
`origin/main`; nothing was pushed.

The worktree contained untracked Mandalarepo files, so they were preserved at
`/Users/amrit/mandala/.local-worktree-archive/mandalarepo-acrolls-docs-route/` and excluded via
the local `.git/info/exclude`. `sites/mandalarepo` remains ignored and untracked in the main
checkout. The Acrolls repository already had only `main` and was unchanged by this prune.
