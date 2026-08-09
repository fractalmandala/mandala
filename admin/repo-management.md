# Repo Management — Branch & Worktree Strategy

Guidelines for managing branches and worktrees in the **mandala** monorepo.

---

## 1. Core Principles

- **Trunk-Based Development**: `main` is always the stable, releasable baseline. All work happens on short-lived scoped branches merged back into `main`.
- **Branch by Work Scope, Not Folder**: Name branches after the task (`feat/fracta-export`, `fix/shared-anim`), never after project folders (`apps/fracta`).
- **Throwaway Worktrees**: Use Git worktrees for task isolation. Keep one persistent `main` worktree and spawn temporary worktrees for side tasks/experiments.
- **Folder Promotions are Commits**: Moving `experiments/x` to `apps/x` is a `git mv` commit on `main`, not a branch migration.

---

## 2. Branch Naming & Commits

### Branch Patterns

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<scope>-<thing>` | `feat/fracta-export` |
| Fix | `fix/<scope>-<thing>` | `fix/shared-anim` |
| Refactor | `refactor/<scope>-<thing>` | `refactor/agentic-progress` |
| Experiment | `experiment/<tag>-<idea>` | `experiment/gguf-hook` |
| Chore / Docs | `chore/<scope>-<thing>`, `docs/<topic>` | `chore/ci-matrix`, `docs/repo-management` |

### Commit Format

Follow Conventional Commits: `<type>(<scope>): <subject>`

```
feat(fracta): add markdown export to clipboard
fix(agentic): resolve race in worktree spawn
```

Allowed types: `feat fix refactor chore docs experiment test perf ci`.

- Imperative, present tense, ≤72 chars.
- No bare "WIP" or "updates" commits on `main`-bound branches.

---

## 3. Worktree Commands

The persistent `main` worktree is the repo checkout at `/Users/amrit/mandala`. Throwaway
task worktrees live under `~/src/mandala` (override with `MANDALA_WT_ROOT`), one folder
per branch, grouped by branch type: `~/src/mandala/<type>/<name>`.

Prefer the helper — it validates §2 naming, places the worktree, and cleans up atomically:

```bash
scripts/wt.sh add feat/my-feature     # worktree + branch off main → ~/src/mandala/feat/my-feature
scripts/wt.sh list                    # all worktrees
scripts/wt.sh rm feat/my-feature      # remove worktree + branch, prune (refuses dirty/unmerged)
scripts/wt.sh rm --force <branch>     # abandoned prototype path
```

Raw git equivalents:

```bash
# 1. Create a worktree with a new branch
git worktree add -b feat/my-feature ~/src/mandala/feat/my-feature main

# 2. Work in the new worktree
cd ~/src/mandala/feat/my-feature
pnpm install

# 3. Merge into main (from the persistent main worktree)
cd /Users/amrit/mandala
git merge --no-ff feat/my-feature

# 4. Clean up worktree and branch
git worktree remove ~/src/mandala/feat/my-feature
git branch -d feat/my-feature
git worktree prune
```

*For abandoned prototypes: use `git worktree remove --force` and `git branch -D`.*

---

## 4. Enforcement

The repo-local hook surface in `.githooks/` (wired via `core.hooksPath`) is the
provider-neutral enforcement point — it runs for every commit regardless of
which agent host or terminal performed it. Host-specific rules (e.g. the
Claude hookify rules in `.claude/`) add extra guards but must name the same
rules as this document.

| Hook | Rule | Behavior |
|------|------|----------|
| `.githooks/commit-msg` | Direct commit on `main` / `master` (§1) | Warns with the branch-first remediation; commit proceeds. |
| `.githooks/commit-msg` | Non-Conventional message (§2) | Warns with the expected format and offending subject; commit proceeds. |
| `.githooks/pre-commit` | Workspace `check` on staged projects | Blocks the commit on failure. |
| `.githooks/pre-push` | Workspace `check` + `test` on branch changes | Blocks the push on failure. |

**Branch-first is advisory at commit time.** The `commit-msg` gate only warns;
it never blocks or rewrites history. The hard boundary is the push: direct
pushes to `main` are blocked by host-level guards where available, and §1
still forbids them as policy. Merge commits, reverts, and `fixup!`/`squash!`
messages pass through the gate unflagged.

---

## 5. Summary Checklist

1. **One task per worktree**: Create a throwaway worktree per branch; don't stack unrelated changes.
2. **Prune immediately**: Delete worktree and branch as soon as merged or abandoned.
3. **Trunk protection**: No direct pushes or long-lived side branches; merge via short-lived feature branches (`--no-ff` for feature units, squash for 1-liner fixes).
4. **Agent workflow**: Agents must operate in isolated task worktrees, write conventional commits, and clean up worktrees upon task completion.
