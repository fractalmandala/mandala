---
description: Enter Fractal Agentic's executable delivery runtime: select one boss, choose available lanes, verify evidence, and review ship|fix-first|rethink.
---

# Orchestrate

```text
/orchestrate
```

## Required reading order

1. Read the [startup router](../AGENTS.md).
2. If no boss is active, select exactly one from the router and read only its nested
   playbook under [`docs/bosses/`](../docs/bosses/INDEX.md). If a boss is already
   active, do not reread unrelated boss playbooks.
3. Load and execute the [runtime skill](../skills/boss-orchestration/SKILL.md).
4. Load the runtime references named by the skill when their decision is needed:
   [capability mode](../skills/boss-orchestration/references/capability-mode.md),
   [role contracts](../skills/boss-orchestration/references/role-contracts.md),
   [routing matrix](../skills/boss-orchestration/references/routing-matrix.md),
   [handoffs](../skills/boss-orchestration/references/handoffs.md), and
   [boss prompts](../skills/boss-orchestration/references/boss-prompts.md).

The runtime is authoritative for the delivery procedure. Do not replace it with this
command page or the human narrative docs.

## Runtime invariant

1. Set `capability_mode` once from the current session spawn catalog.
2. Select available routine, complex, and fresh-review lanes when useful; pins are
   optional quality, not a work gate.
3. Use the active boss's constraints in every delegated contract.
4. Require an implementation receipt for each worker handoff: owned and changed paths,
   command results, gaps, residual risk, and a proposed verdict. Keep the primary session
   responsible for the actual diff and verification evidence; worker receipts are claims.
5. Obtain the best available final review with exactly one verdict:
   **ship | fix-first | rethink**.
6. On `fix-first`, fix, re-verify, and review again. On `rethink`, return to scope or
   architecture before claiming completion.
7. For release-critical work, add `/santa-loop` after a ship verdict when the active
   boss calls for it.

## Non-blocking rule

**Project work always proceeds.** Missing plugin support, installer templates, pins,
hooks, or wiki access means choose the available primary/domain path, report
`capability_mode` and `pins: unverified` when appropriate, then continue. Read the
[canonical progression policy](../docs/progression.md) if a capability is unavailable.

## Relationship to activation

| Entry | Role |
| --- | --- |
| `/activate-boss-*` | Reads the router and one authoritative domain playbook |
| `/orchestrate` | Executes the runtime for that active domain |

Optional health check:

```sh
sh <plugin>/scripts/check-armory.sh
```
