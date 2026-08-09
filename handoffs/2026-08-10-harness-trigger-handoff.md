---
task: harness-trigger-handoff
status: done
host: qoder
branch: feat/harness-trigger-handoff
boss: agent
updated: 2026-08-10
---

# Handoff — universal harness trigger + closing handoff protocol

## Where we are

Goal: any agent in any mandala workspace triggers into the fractal-agentic
harness, and every agent closes non-trivial work with a repo handoff note.

Implemented in worktree `feat/harness-trigger-handoff`:

- `check-progressive-discovery.sh` rewritten for the real monorepo layout
  (repo root via `.git` walk-up, layout-relative trampoline links, no
  hardcoded `plugin/` path). Check now passes fully.
- Root `AGENTS.md`: progressive-discovery entrypoints + mandate item 6
  (closing handoff required).
- Trampolines added: `sites/fractalagentic/AGENTS.md`, `newdocs/AGENTS.md`.
- `handoffs/` dir + `docs/handoffs.md` spec (two-layer: repo note canonical,
  host pack optional).
- `/handoff` + `/continue` commands rewired to repo note first.
- `AGENTS-SNIPPET.md` gains the closing-handoff section; `check-armory.sh`
  requires `docs/handoffs.md`. Plugin bumped to 2.6.4.

## Decisions

- Repo note is canonical; `~/.fractal/sessions/` host pack stays optional —
  only git-tracked notes cross hosts.
- Handoff mandate is non-blocking: forgetting a note is corrected by writing
  it late, never by freezing work.
- `sites/fractaldharma` row kept in workspace map but unlinked — directory
  is local-only (untracked in git).
- Host-level skills (database-migrations, postgres-patterns, redis-patterns)
  un-vendored from code boss INDEX — they live in the agent host, not armory.

## Remaining

All done. Merged as 58f410f77; all four hosts at v2.6.4; doctor healthy;
`~/.zshrc:76` now points at `.../packages/fractal-agentic` (open a new shell
for the env change).

## Gotchas

- Env `FRACTAL_AGENTIC_ROOT=/Users/amrit/mandala/packages/fractal-agentic/plugin`
  in `~/.zshrc:76` is stale and makes check-progressive-discovery fail; run
  checks with `env -u FRACTAL_AGENTIC_ROOT` until fixed.
- SearchReplace/Write tools refuse paths outside /Users/amrit/mandala — use
  python heredocs via Bash for worktree edits.
- Worktree git ops need `required_permissions='all'`.

## Key files

- `packages/fractal-agentic/scripts/check-progressive-discovery.sh` — the guard
- `packages/fractal-agentic/docs/handoffs.md` — handoff spec
- `handoffs/` — repo-side notes directory
- `AGENTS.md` — root mandate (items: entrypoints + closing handoff)
