---
title: Boss Orchestration Runtime
description: "Delivery kernel: domain routing, capability lanes, claim verify, and ship|fix-first|rethink review."
tags: [orchestrate, bosses, capability-lanes, delivery]
sources:
  - 2026-08-02-170717-hqflow-boss-orchestrator-armory.md
  - agentic-full-framework.md
  - harness-design-long-running.md
  - 2026-08-02-090000-shradhapp-studio-media-workspace.md
created: 2026-08-02
updated: 2026-08-02
type: concept
boss: agent
project: fractal-agentic
---

The **runtime kernel** for Fractal Agentic is skill `boss-orchestration` entered via `/orchestrate`. Domain knowledge stays in [[Domain Bosses Armory]] (`plugin/AGENTS.md`); the skill executes the loop.

## Primary responsibilities

- Hold user intent, architecture, and acceptance in the **primary** session
- Select **active boss** from the decision tree (Axis A)
- Choose **capability lanes** when session-exposed (Axis B): routine implementer, complex implementer, fresh reviewer
- Treat worker “done” as a **claim**; re-verify diffs and commands
- Require a completion review with verdict **ship | fix-first | rethink**

## Non-blocking policy

Missing TOML pins, install gaps, or hosts that cannot pin models **degrade** (`capability_mode`: `degraded` / `pinned_partial`) and still allow product work. Never refuse delivery for harness purity. Related: [[Agent Harness Design]], [[Agentic Systems]].

## Shared armory

Always available: `/quality-gate`, `/security-scan` + security-reviewer, code-reviewer + `/code-review`, `/santa-loop`, optional [[LLM-Maintained Wiki]] capture.

## Visualization

[[Code HQFlow]] maps this hierarchy as workflow `boss-orchestrator-armory` with conditional domain edges and handoffs.

**Field lesson:** missing capability pins must not freeze product work—operators may proceed in primary when install/session exposure lags (shradhapp session). Aligns with non-blocking [[Optional Hooks Plane]] and degradation policy.
