---
description: Restore task context from the repo handoff note (and optional host pack).
---

# /continue

Resumes a task from its handoff. Reads the repo note first (canonical), then
the host session pack if present. Does NOT apply patches or switch branches.
Format spec: docs/handoffs.md.

## Usage

```
/continue
/continue --brief
```

## Flow

1. Look for the repo note: newest handoffs/*.md matching the task (or the only
   one with status: active). Read it; it is the source of truth.
2. Check ~/.fractal/sessions/active/handoff.md as an optional same-host pack
3. Warn if the host pack is stale (>2h); repo note freshness is by `updated:`
4. Parse frontmatter and body sections from both layers
5. Read plan-state.json and diff.patch stats (host pack only)
6. Print: title, host, age, boss, plan progress, diff lines, sections

## Arguments
- --brief optional (5-line summary via context-broker agent)
