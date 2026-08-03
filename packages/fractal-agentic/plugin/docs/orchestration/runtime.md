---
title: "Runtime loop"
description: "Follow this sequence for work that changes the repository or claims completion: select, contract, implement, verify, and review."
type: guide
---

# Runtime loop

Run `/orchestrate` for any deliverable that changes the repository or claims completion: features, fixes, ports, refactors, and multi-step audits with a change set. A one-line answer or pure explanation can use the trivial exemption in the project mandate.

## The sequence

1. **Select the active boss** with the [decision tree](../bosses/INDEX.md), or let `/orchestrate` choose.
2. **Set `capability_mode` once** with [Capability lanes](./capability-lanes.md).
3. **Write the contract** when delegating: objective, ownership, interfaces, constraints, and verification.
4. **Implement** with an exposed routine or complex lane when appropriate; otherwise use the primary session, a domain specialist, or a general agent.
5. **Verify in the primary session** using the real diff and real commands. Worker reports are claims until checked.
6. **Review** with exactly one verdict: `ship`, `fix-first`, or `rethink`.
7. If the verdict is `fix-first`, fix the bounded issues, verify again, and request a new review.
8. For release-critical work, run `/santa-loop` after the normal review when Code or Creator release checks apply.
9. Capture an optional wiki episode under `raw/fractal/` when the vault is configured.

## Five-part implementer contract (summary)

```text
OBJECTIVE
ACTIVE BOSS + STACK DEFAULTS
FILES AND OWNERSHIP
INTERFACES
CONSTRAINTS  (+ boss-prompts bullets)
VERIFICATION (exact commands + success criteria)
RETURN → IMPLEMENTATION REPORT
```

Full text: [role-contracts.md](../../skills/boss-orchestration/references/role-contracts.md).

## Verdict meanings

| Verdict | Meaning | Next |
|---|---|---|
| **ship** | Goal met; evidence holds | Report done |
| **fix-first** | Bounded corrections required | Fix → re-verify → re-review |
| **rethink** | Architecture/scope wrong | Back to design; no completion claim |

## Primary session keeps

- Requirements and ambiguity  
- Boss selection and architecture  
- Lane selection and acceptance  
- Diff inspection and re-verification  

Primary implements volume **when lanes are unavailable** — delivery outranks pin purity.
