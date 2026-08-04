---
description: Save cross-host handoff pack to ~/.fractal/sessions/active/ so another host can /continue.
---

# /handoff

Writes a light-weight handoff pack that any host can read.
Pairs with /continue. Heavy-weight saves stay with gstack /context-save.

## Usage

```
/handoff [title]
/handoff --no-diff
```

## Flow

### 1. Gather git state
Run: git branch, git status --short, git diff --stat

### 2. Detect boss + capability_mode
From FRACTAL_ACTIVE_BOSS and FRACTAL_CAPABILITY_MODE env vars, or infer.

### 3. Detect active plan
Check .empryo/plans/plan.md or .fractal/plans/ for step checklist. Parse into plan-state.json.

### 4. Write handoff.md
Path: ~/.fractal/sessions/active/handoff.md
Frontmatter: host, timestamp, boss, capability_mode, title
Sections: Working on, Decisions, Remaining, Notes

### 5. Write plan-state.json
Path: ~/.fractal/sessions/active/plan-state.json
Array of {id, label, status} steps.

### 6. Write diff.patch (optional)
Unless --no-diff: git diff + git diff --cached

### 7. Confirm
Print: title, host, boss, branch, modified files, plan progress.

## Arguments
- <title> optional
- --no-diff optional
