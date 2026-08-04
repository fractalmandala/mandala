---
description: Restore cross-host session context from handoff pack.
---

# /continue

Reads the active handoff pack written by /handoff.
Does NOT apply patches or switch branches.

## Usage

```
/continue
/continue --brief
```

## Flow

1. Check ~/.fractal/sessions/active/handoff.md exists
2. Warn if stale (>2h)
3. Parse frontmatter and body sections
4. Read plan-state.json and diff.patch stats
5. Print: title, host, age, boss, plan progress, diff lines, sections

## Arguments
- --brief optional (5-line summary via context-broker agent)
