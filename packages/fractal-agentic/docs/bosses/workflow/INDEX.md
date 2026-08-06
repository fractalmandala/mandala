---
title: "Workflow Boss"
description: "Authoritative Workflow Boss playbook for personal habits, automation, context, cost, and loops."
type: guide
---

# Workflow Boss

**Activate:** [`/activate-boss-workflow`](../../../commands/activate-boss-workflow.md)

Use this authoritative playbook for the **personal OS**: session habits, multi-channel
triage, cost awareness, instinct hygiene, tool pruning, and personal loops. It does
not own product agent frameworks. Read no other boss playbook unless a handoff below
requires it. For a non-trivial delivery, then load the
[orchestration runtime](../../../skills/boss-orchestration/SKILL.md).

## Mission and boundaries

Workflow owns personal session habits, automation, cost awareness, instinct hygiene,
tool pruning, and personal loops. It is not a home for building LangChain or product
agent frameworks; those belong to [Agent](../agent/INDEX.md).

**Out of scope:** product agent harnesses (Agent) and ECC portfolio compliance (Meta;
Workflow dual-owns `/skill-health` as an operational consumer).

## Stack and surface gate

Workflow is usually stack-neutral. If an automation edits a monorepo, it still does
not take over the product harness or release role: hand the feature to Agent and the
ship gate to Svelte or Code as appropriate.

## Primary and secondary agents

- [Chief of Staff](../../../agents/chief-of-staff.md) — primary personal triage.
- [Conversation Analyzer](../../../agents/conversation-analyzer.md).
- [Loop Operator](../../../agents/loop-operator.md).
- [Agent Evaluator](../../../agents/agent-evaluator.md) — secondary, only for
  personal-automation quality.

## Mapped skills

- [Automation Audit Ops](../../../skills/automation-audit-ops/SKILL.md) and
  [Hookify Rules](../../../skills/hookify-rules/SKILL.md).
- [Continuous Agent Loop](../../../skills/continuous-agent-loop/SKILL.md) — preferred
  selection matrix; [Autonomous Loops](../../../skills/autonomous-loops/SKILL.md) is
  implementation detail.
- [Continuous Learning V2](../../../skills/continuous-learning-v2/SKILL.md) and
  [Continuous Learning](../../../skills/continuous-learning/SKILL.md).
- [Recursive Decision Ledger](../../../skills/recursive-decision-ledger/SKILL.md).
- [Context Budget](../../../skills/context-budget/SKILL.md) and
  [Token Budget Advisor](../../../skills/token-budget-advisor/SKILL.md).
- [Context Save](../../../skills/context-save/SKILL.md) and
  [Context Restore](../../../skills/context-restore/SKILL.md) — session handoff.
- [LLM Wiki](../../../skills/llm-wiki/SKILL.md) — personal continuous knowledge base.
- [File Organizer](../../../skills/file-organizer/SKILL.md),
  [Human Writing](../../../skills/human-writing/SKILL.md), and
  [Docs Writer](../../../skills/docs-writer/SKILL.md) — optional general-utility pulls.
- [Agent Sort](../../../skills/agent-sort/SKILL.md) and
  [Using Superpowers](../../../skills/using-superpowers/SKILL.md).

## Mapped commands

- [`/hookify`](../../../commands/hookify.md),
  [`/hookify-configure`](../../../commands/hookify-configure.md), and
  [`/hookify-list`](../../../commands/hookify-list.md)
- [`/learn`](../../../commands/learn.md) and [`/learn-eval`](../../../commands/learn-eval.md)
- [`/instinct-status`](../../../commands/instinct-status.md),
  [`/instinct-export`](../../../commands/instinct-export.md), and
  [`/instinct-import`](../../../commands/instinct-import.md)
- [`/loop-start`](../../../commands/loop-start.md) and
  [`/loop-status`](../../../commands/loop-status.md)
- [`/wiki-init`](../../../commands/wiki-init.md),
  [`/wiki-query`](../../../commands/wiki-query.md), and
  [`/wiki-lint`](../../../commands/wiki-lint.md)
- [`/hooks-init`](../../../commands/hooks-init.md) and
  [`/hooks-status`](../../../commands/hooks-status.md) — optional machine setup, never
  a delivery gate.
- [`/improve-init`](../../../commands/improve-init.md) and
  [`/improve-status`](../../../commands/improve-status.md) — optional local learning.
- [`/prune`](../../../commands/prune.md),
  [`/auto-update`](../../../commands/auto-update.md),
  [`/skill-health`](../../../commands/skill-health.md),
  [`/cost-report`](../../../commands/cost-report.md), and
  [`/santa-loop`](../../../commands/santa-loop.md) for critical personal automations.

## Playbook

### Phase 1 — observe friction

1. Use Chief of Staff and Conversation Analyzer for multi-channel/session patterns.
2. Inventory automation with Automation Audit Ops.

### Phase 2 — engineer personal loops

1. Use Hookify for recurring mistakes.
2. Use Learn and instincts for conventions.
3. Use Continuous Agent Loop and `/loop-start` to choose and operate loops.
4. Use Context Save / Context Restore for session handoff.

### Phase 3 — prune and budget

1. Sort with Agent Sort into DAILY vs LIBRARY.
2. Use `/prune`; use `/skill-health` with Meta when the portfolio is bloated.
3. Use Context Budget and `/cost-report`.
4. Optionally use Using Superpowers at session start for skill discipline.

## Verification defaults

- Product quality gates are normally unnecessary for personal automation.
- If an automation edits a repository, hand the change to Code or Svelte for the
  relevant ship checks.
- Hooks, wiki, pins, and local learning remain optional and non-blocking.

## Handoffs

- **→ [Agent](../agent/INDEX.md):** a personal automation becomes a product feature.
- **→ [Meta](../meta/INDEX.md):** ECC-wide compliance, promotion, or portfolio work.
- **→ [Creator](../creator/INDEX.md):** an automation grows into a new app or package.
