---
description: Activate Creator Boss by loading the startup router and Creator's authoritative nested playbook.
---

# Activate Boss — Creator

```text
/activate-boss-creator
```

1. Read the [startup router](../AGENTS.md) for authority, stop-reading rules,
   stack/surface detection, handoffs, and non-blocking policy.
2. Read the [Creator Boss playbook](../docs/bosses/creator/) —
   `docs/bosses/creator/INDEX.md` — in full.
3. Make Creator the active boss and do **not** load another boss playbook until a
   concrete build phase needs one.
4. For non-trivial delivery work, run [`/orchestrate`](../commands/orchestrate.md) and load the
   [runtime](../skills/boss-orchestration/SKILL.md) it names.

Creator owns scaffold-to-ship work and may pull another boss armory mid-build. Return
release work to Code or the relevant implementation boss for verification.
