---
description: Natural-language entry point — one sentence, auto-routed to the right boss, orchestrator, and implementation lane. Zero ceremony.
---

# /do

The fastest path from thought to working code. Type what you want in
plain English and it routes to the right pipeline. No boss selection,
no lane choice, no orchestration ceremony.

## Usage

```
/do add dark mode toggle to fracta settings
/do fix the login redirect loop
/do refactor auth to use Lucia v3
/do build a new blog site
/do port the shadcn accordion
/do review the last 3 PRs
/do upgrade SvelteKit to latest
```

## Routing

1. Classify intent from the request:
   - **new feature** → orch-add-feature + Svelte boss
   - **bug fix** → orch-fix-defect + Svelte boss (or Code if security)
   - **refactor** → orch-refine-code + Svelte boss
   - **new app/site/package** → orch-build-mvp + Creator boss
   - **port component** → port-component skill + Svelte boss
   - **review/audit** → Code boss
   - **UI/polish** → Design boss
   - **AI/agent feature** → Agent boss
   - **workflow/automation** → Workflow boss
   - **plugin/meta** → Meta boss

2. Auto-select capability mode from session (pins or degraded)

3. Delegate to /orchestrate with the selected boss + orch skill

4. Report: what was detected, which boss, which pipeline, what happened

## The contract

- The user types ONE sentence. No "activate boss" or "start loop".
- /do handles routing, boss activation, lane selection, verification.
- If intent is ambiguous, ask ONE clarifying question (not "let's explore").
- If the task is trivial (single-line fix), skip orchestration — just do it.

## Detection hints

| User says | Route to |
|---|---|
| "add", "build", "create", "new" | orch-add-feature |
| "fix", "bug", "broken", "error" | orch-fix-defect |
| "refactor", "clean up", "improve" | orch-refine-code |
| "app", "site", "package", "scaffold" | orch-build-mvp |
| "review", "audit", "check" | Code boss |
| "design", "style", "look", "polish" | Design boss |
| "agent", "AI", "memory", "harness" | Agent boss |
| "workflow", "automate", "cron" | Workflow boss |

## Arguments

$ARGUMENTS — the entire string after /do is the intent
