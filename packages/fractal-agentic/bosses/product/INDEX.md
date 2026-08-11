---
title: "Product Boss"
description: "Authoritative Product Boss playbook for product spec to development to delivery."
type: guide
---

# Meta Boss

**Activate:** [`/activate-boss-meta`](../../../commands/activate-boss-meta.md)

Use this authoritative playbook to maintain **ECC itself**: installation, inventory,
compliance, skill quality, promotion, and pruning. Read no other boss playbook unless
a handoff below requires it. For a non-trivial delivery, then load the
[orchestration runtime](../../../skills/boss-orchestration/SKILL.md).

## Mission and boundaries

Meta owns the plugin portfolio and intentionally keeps ECC maintenance separate from
Agent’s product-agent work.

**Out of scope:** product features (Creator/Svelte/Code) and personal daily OS
(Workflow, which consumes a healthy portfolio).

## Inventory and stack gate

Always use the live indexes, never hardcoded counts:

- [Skills index](../../../skills/INDEX.md)
- [Commands index](../../../commands/INDEX.md)
- [Agents index](../../../agents/INDEX.md)

Meta work is normally stack-neutral. When a capability is stack-specific, retain its
real stack classification rather than recasting the whole plugin around it.

## Primary agents

- [Agent Evaluator](../../../agents/agent-evaluator.md) — skill and agent quality
  scorecards.
- [Harness Optimizer](../../../agents/harness-optimizer.md) — harness install tuning.

## Mapped skills

- [Configure ECC](../../../skills/configure-ecc/SKILL.md)
- [ECC Guide](../../../skills/ecc-guide/SKILL.md)
- [Skill Scout](../../../skills/skill-scout/SKILL.md)
- [Skill Stocktake](../../../skills/skill-stocktake/SKILL.md)
- [Skill Comply](../../../skills/skill-comply/SKILL.md)
- [Skill Creator](../../../skills/skill-creator/SKILL.md)
- [Agent Sort](../../../skills/agent-sort/SKILL.md)
- [Rules Distill](../../../skills/rules-distill/SKILL.md)

## Mapped commands

- [`/ecc-guide`](../../../commands/ecc-guide.md)
- [`/skill-create`](../../../commands/skill-create.md)
- [`/skill-health`](../../../commands/skill-health.md)
- [`/auto-update`](../../../commands/auto-update.md)
- [`/promote`](../../../commands/promote.md)
- [`/prune`](../../../commands/prune.md)

## Playbook

### Phase 1 — orient

1. Use `/ecc-guide` and ECC Guide from the live indexes.
2. Configure/install through Configure ECC; refresh with `/auto-update` when needed.

### Phase 2 — portfolio health

1. Work stocktake → scout → comply.
2. Inspect the dashboard with `/skill-health`.
3. Use Skill Creator and `/skill-create` to fill justified gaps.

### Phase 3 — promote and prune

1. Promote mature instincts or skills with `/promote`.
2. Prune dead weight with `/prune` and Agent Sort.
3. Distill rules when trajectories justify permanent guidance.

## Verification defaults

- Check live indexes through `/ecc-guide`.
- Use `/skill-health` and installer/check scripts when pins change.
- Run `scripts/verify.sh` after orchestration template changes.

## Handoffs

- **→ [Agent](../agent/INDEX.md):** product agent implementation.
- **→ [Workflow](../workflow/INDEX.md):** personal use of the healthy portfolio.
- **→ [Creator](../creator/INDEX.md):** a new monorepo product needs a scaffold.
- **← any boss:** installation, inventory, compliance, promotion, or pruning.
