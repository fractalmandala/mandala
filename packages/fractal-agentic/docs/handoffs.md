# Handoffs — context engineering between agents

**Audience: every agent working in this repo (and any project carrying the mandate).**

**One-line rule:** *No agent ends non-trivial work silently. The last act of a task is a
handoff note the next agent can pick up cold.*

## Why

Agents run on many hosts (Qoder, Claude Code, Gemini/Antigravity, Codex, …) and sessions
end mid-task: context limits, timeouts, host switches. A tracked, repo-side note is the
only context channel that reliably crosses hosts and sessions.

## Two layers

| Layer | Location | Purpose |
|---|---|---|
| **Repo task note** (canonical) | `handoffs/<slug>.md` at repo root, git-tracked | Durable task state any agent on any host can read. |
| **Host session pack** (optional) | `~/.fractal/sessions/active/` via `/handoff` + `/continue` | Same-host quick resume with diff patch + plan state. |

When both exist, the repo note is the source of truth; the session pack is a convenience.

## Repo note format

Filename: `handoffs/<YYYY-MM-DD>-<slug>.md` (slug = task in kebab-case).

```markdown
---
task: <slug>
status: active | blocked | done
host: <host that wrote the last update>
branch: <branch or worktree, if any>
boss: <design|code|agent|svelte|creator|workflow|meta, if selected>
updated: <ISO date>
---

# Handoff — <title>

## Where we are
One paragraph: current state, what already works, verification evidence.

## Decisions
- Bullet list of decisions with one-line rationale (so nobody re-litigates them).

## Remaining
- [ ] Ordered next steps, concrete enough to execute cold.

## Gotchas
- Traps the next agent would otherwise rediscover (versions, quirks, paths).

## Key files
- `path/to/file` — why it matters.
```

## Lifecycle

1. **Create** the note when a non-trivial task is interrupted, handed off, or completes.
2. **Update** it instead of creating duplicates — one note per task slug.
3. **Next agent**: read the newest matching note first; execute from `Remaining`.
4. **Close**: set `status: done` once the work merges. Notes are history — do not delete.

## Non-blocking

A missing note never blocks product work; a present note must be read before resuming
its task. Writing the closing note is mandatory for agents, but forgetting it must be
corrected by writing it late — never by freezing the task.
