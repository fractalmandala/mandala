---
description: Write the repo handoff note (canonical) + optional host session pack so another agent can /continue.
---

# /handoff

Writes the repo task note any agent on any host can pick up, plus an optional
host-local session pack. Pairs with /continue. Heavy-weight saves stay with
gstack /context-save. Format spec: docs/handoffs.md.

## Usage

```
/handoff [title]
/handoff --no-diff
```

## Flow

### 0. Write or update the repo note (canonical)
Path: handoffs/<YYYY-MM-DD>-<slug>.md at repo root (git-tracked). If a note for
this task slug already exists, update it instead of creating a second one.
Frontmatter: task, status (active|blocked|done), host, branch, boss, updated.
Sections: Where we are / Decisions / Remaining / Gotchas / Key files.

### 1. Gather git state
Run: git branch, git status --short, git diff --stat

### 2. Detect boss + capability_mode
From FRACTAL_ACTIVE_BOSS and FRACTAL_CAPABILITY_MODE env vars, or infer.

### 3. Detect active plan
Check .empryo/plans/plan.md or .fractal/plans/ for step checklist. Parse into plan-state.json.

### 4. Write host session pack handoff.md (optional convenience layer)
Path: ~/.fractal/sessions/active/handoff.md
Frontmatter: host, timestamp, boss, capability_mode, title
Sections: Working on, Decisions, Remaining, Notes

### 5. Write plan-state.json
Path: ~/.fractal/sessions/active/plan-state.json
Array of {id, label, status} steps.

### 6. Write diff.patch (optional)
Unless --no-diff: git diff + git diff --cached

### 7. Confirm
Print: repo note path, title, host, boss, branch, modified files, plan progress.

## Arguments
- <title> optional
- --no-diff optional
