---
name: continuous-agent-loop
description: Patterns for continuous autonomous agent loops with quality gates, evals, and recovery controls.
metadata:
  origin: ECC
---

# Continuous Agent Loop

This is the v1.8+ canonical loop skill name. It supersedes `autonomous-loops` while keeping compatibility for one release.

## Loop Selection Flow

```text
Start
  |
  +-- Need strict CI/PR control? -- yes --> continuous-pr
  |
  +-- Need RFC decomposition? -- yes --> rfc-dag
  |
  +-- Need exploratory parallel generation? -- yes --> infinite
  |
  +-- default --> sequential
```

## Combined Pattern

Recommended production stack:

1. RFC decomposition (`ralphinho-rfc-pipeline`)
2. quality gates (`plankton-code-quality` + `/quality-gate`)
3. eval loop (`eval-harness`)
4. session persistence (`nanoclaw-repl`)

## Converging Cycles & Graph Loop Safeguards

When running iterative/discovery loops (e.g. open-ended bug hunting, security audits):

1. **Loop-Until-Dry Exit Criteria**: Set a hard exit rule: terminate after $N$ (e.g. 2) consecutive rounds turn up zero new valid findings, rather than looping until token budgets blow out.
2. **Full History Deduplication**: Compare newly surfaced candidates against **all historical findings** (both accepted AND rejected/disproved). Deduplicating against accepted items only causes rejected items to resurface endlessly every round.
3. **Deterministic State Ledger**: Store historical findings in a lightweight JSON file or text ledger; filter candidates via code before calling downstream model verifiers.

## Failure Modes

- loop churn without measurable progress
- repeated retries with same root cause
- infinite rediscovery of rejected findings (missing full-history deduplication)
- merge queue stalls
- cost drift from unbounded escalation

## Recovery

- freeze loop
- run `/harness-audit`
- reduce scope to failing unit
- replay with explicit acceptance criteria

