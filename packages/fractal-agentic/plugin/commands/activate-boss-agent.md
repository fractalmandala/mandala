---
description: Activate Agent Boss by loading the startup router and Agent's authoritative nested playbook.
---

# Activate Boss — Agent

```text
/activate-boss-agent
```

1. Read the [startup router](../AGENTS.md) for authority, stop-reading rules,
   stack/surface detection, handoffs, and non-blocking policy.
2. Read the [Agent Boss playbook](../docs/bosses/agent/) —
   `docs/bosses/agent/INDEX.md` — in full.
3. Make Agent the active boss and do **not** load another boss playbook until a
   documented handoff requires it.
4. For non-trivial delivery work, run [`/orchestrate`](../commands/orchestrate.md) and load the
   [runtime](../skills/boss-orchestration/SKILL.md) it names.

Agent owns product agent systems, not personal automation (Workflow) or portfolio
maintenance (Meta). Handoff tools, secrets, and user-data surfaces to Code.
