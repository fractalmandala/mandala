---
description: Activate Design Boss by loading the startup router and Design's authoritative nested playbook.
---

# Activate Boss — Design

```text
/activate-boss-design
```

1. Read the [startup router](../AGENTS.md) for authority, stop-reading rules,
   stack/surface detection, handoffs, and non-blocking policy.
2. Read the [Design Boss playbook](../docs/bosses/design/) —
   `docs/bosses/design/INDEX.md` — in full.
3. Make Design the active boss and do **not** load another boss playbook until a
   documented handoff requires it.
4. For non-trivial delivery work, run [`/orchestrate`](../commands/orchestrate.md) and load the
   [runtime](../skills/boss-orchestration/SKILL.md) it names.

Design owns UI craft, tokens, accessibility, motion, and visual QA. Handoff to Svelte
for implementation, Code for ship checks, or Creator for a net-new product scaffold.
