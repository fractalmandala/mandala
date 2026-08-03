---
description: Activate Meta Boss by loading the startup router and Meta's authoritative nested playbook.
---

# Activate Boss — Meta

```text
/activate-boss-meta
```

1. Read the [startup router](../AGENTS.md) for authority, stop-reading rules,
   stack/surface detection, handoffs, and non-blocking policy.
2. Read the [Meta Boss playbook](../docs/bosses/meta/) —
   `docs/bosses/meta/INDEX.md` — in full.
3. Make Meta the active boss and do **not** load another boss playbook until a
   documented handoff requires it.
4. For non-trivial delivery work, run [`/orchestrate`](../commands/orchestrate.md) and load the
   [runtime](../skills/boss-orchestration/SKILL.md) it names.

Meta owns plugin installation, live inventories, compliance, promotion, and pruning.
Use the live indexes and hand product work back to the domain boss that owns it.
