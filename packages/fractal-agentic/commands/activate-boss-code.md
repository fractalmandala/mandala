---
description: Activate Code Boss by loading the startup router and Code's authoritative nested playbook.
---

# Activate Boss — Code

```text
/activate-boss-code
```

1. Read the [startup router](../AGENTS.md) for authority, stop-reading rules,
   stack/surface detection, handoffs, and non-blocking policy.
2. Read the [Code Boss playbook](../docs/bosses/code/) —
   `docs/bosses/code/INDEX.md` — in full.
3. Make Code the active boss and do **not** load another boss playbook until a
   documented handoff requires it.
4. For non-trivial delivery work, run [`/orchestrate`](../commands/orchestrate.md) and load the
   [runtime](../skills/boss-orchestration/SKILL.md) it names.

Code owns audits, security, tests, performance, release gates, and docs from code.
Handoff visual craft to Design and product-agent safety to Agent before Code ships it.
