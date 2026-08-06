---
title: "Orchestration"
description: "The delivery runtime turns a selected domain into an implemented, verified, and reviewed result."
type: guide
---

# Orchestration

Orchestration is the delivery runtime behind `/orchestrate`. Start with the
[startup router](../../AGENTS.md), select one authoritative boss playbook, and only
then load this runtime material for non-trivial delivery. It answers two separate questions:

1. **Domain:** which boss owns the work and its constraints?
2. **Capability:** who should implement and review the work in this session?

Keeping those questions separate lets a task use the right engineering judgment without making optional infrastructure a prerequisite for delivery.

## Progressive reading path

1. The router chooses one boss and tells the agent to stop reading other boss playbooks.
2. The selected boss `INDEX.md` supplies its constraints, phases, and verification defaults.
3. `/orchestrate` loads the executable runtime and only the references needed for the
   current capability or review decision.

Narrative pages are navigation aids. The executable policy remains in
[`skills/boss-orchestration/`](../../skills/boss-orchestration/SKILL.md) and its
references.

## The delivery path

```text
Choose a boss
    │
    ▼
Set capability mode
    │
    ▼
Write the delivery contract
    │
    ▼
Implement → verify → review
                    │
                    ├── ship
                    ├── fix-first → fix → verify → review again
                    └── rethink → return to scope or architecture
```

The primary session remains responsible for the requirements, the real diff, verification commands, and the final review decision. Other agents can help, but their reports are claims until the primary session checks the evidence.

## Read this section in order

| Page | Use it when |
| --- | --- |
| [Runtime loop](./runtime.md) | You need the complete `/orchestrate` sequence and review contract |
| [Capability lanes](./capability-lanes.md) | You want to understand optional implementer and reviewer pins |
| [Non-blocking policy](../progression.md) | A plugin, pin, hook, or wiki capability is missing |

## Runtime assets

| Asset | Purpose |
| --- | --- |
| [`/orchestrate`](../../commands/orchestrate.md) | User-facing delivery entry point |
| [`boss-orchestration`](../../skills/boss-orchestration/SKILL.md) | Runtime kernel and routing rules |
| `plugin/skills/boss-orchestration/references/role-contracts.md` | Implementer and reviewer contract |
| `plugin/skills/boss-orchestration/references/routing-matrix.md` | Task-shape routing |
| `plugin/skills/boss-orchestration/references/handoffs.md` | Domain handoff rules |
| `plugin/skills/boss-orchestration/references/capability-mode.md` | Session capability algorithm |
| `plugin/skills/boss-orchestration/references/graph-topologies.md` | Parallel and review graph patterns |

The runtime policy lives in the plugin skills and commands. The reference files ship with the plugin and are available to agents; this section explains their purpose without turning every internal reference into a separate website route.
