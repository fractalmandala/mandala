---
description: Activate Workflow Boss by loading the startup router and Workflow's authoritative nested playbook.
---

# Activate Boss — Workflow

```text
/activate-boss-workflow
```

1. Read the [startup router](../AGENTS.md) for authority, stop-reading rules,
   stack/surface detection, handoffs, and non-blocking policy.
2. Read the [Workflow Boss playbook](../docs/bosses/workflow/) —
   `docs/bosses/workflow/INDEX.md` — in full.
3. Make Workflow the active boss and do **not** load another boss playbook until a
   documented handoff requires it.
4. For non-trivial delivery work, run [`/orchestrate`](../commands/orchestrate.md) and load the
   [runtime](../skills/boss-orchestration/SKILL.md) it names.

Workflow owns personal habits and automation, not in-product agents. Handoff product
agent work to Agent and portfolio work to Meta.
