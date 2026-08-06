---
title: "Agent Boss"
description: "Authoritative Agent Boss playbook for product agent systems, harnesses, memory, MCP, and evals."
type: guide
---

# Agent Boss

**Activate:** [`/activate-boss-agent`](../../../commands/activate-boss-agent.md)

Use this authoritative playbook for agent systems **inside product code**: harnesses,
memory, evals, multi-agent orchestration, MCP tool servers, and action-space safety.
Read no other boss playbook unless a handoff below requires it. For a non-trivial
delivery, then load the [orchestration runtime](../../../skills/boss-orchestration/SKILL.md).

## Mission and boundaries

Agent owns the product agent OS: harness construction, memory architecture, eval
frameworks, multi-agent orchestration, MCP tool servers, and safety of agent action
spaces inside apps.

**Out of scope:** personal daily habits or instinct pruning (Workflow), and ECC
installation or skill portfolio maintenance (Meta). Shared tools such as hookify,
learn, and loops may be used when building product agents; they do not make Agent the
owner of personal automation.

## Stack and surface gate

For an AI surface in a Svelte monorepo, Agent owns the harness and action-space layer
while [Svelte](../svelte/INDEX.md) and [Design](../design/INDEX.md) own UI
implementation and visual craft. Escalate secrets, tools, or user-data surfaces to
[Code](../code/INDEX.md) before ship.

## Primary agents

- [Agent Evaluator](../../../agents/agent-evaluator.md)
- [Harness Optimizer](../../../agents/harness-optimizer.md)
- [Loop Operator](../../../agents/loop-operator.md)
- [GAN Planner](../../../agents/gan-planner.md) and
  [GAN Evaluator](../../../agents/gan-evaluator.md)
- [Conversation Analyzer](../../../agents/conversation-analyzer.md) — product
  transcript analysis.
- [Chief of Staff](../../../agents/chief-of-staff.md) — multi-agent coordination in
  product; personal triage remains Workflow.

## Mapped skills

- [Agentic OS](../../../skills/agentic-os/SKILL.md) and
  [Agentic Engineering](../../../skills/agentic-engineering/SKILL.md).
- [Autonomous Agent Harness](../../../skills/autonomous-agent-harness/SKILL.md),
  [Agent Harness Construction](../../../skills/agent-harness-construction/SKILL.md),
  and [Better Harness](../../../skills/better-harness/SKILL.md).
- [Continuous Agent Loop](../../../skills/continuous-agent-loop/SKILL.md) — canonical
  loop-selection matrix; [Autonomous Loops](../../../skills/autonomous-loops/SKILL.md)
  is implementation detail.
- [Continuous Learning V2](../../../skills/continuous-learning-v2/SKILL.md) and
  [Continuous Learning](../../../skills/continuous-learning/SKILL.md) — instincts tier.
- [Memclaw](../../../skills/memclaw/SKILL.md) — optional entity memory graph.
- [LLM Wiki](../../../skills/llm-wiki/SKILL.md) — local continuous wiki and
  orchestration-boundary capture.
- [Context Budget](../../../skills/context-budget/SKILL.md) and
  [Token Budget Advisor](../../../skills/token-budget-advisor/SKILL.md).
- [Agent Eval](../../../skills/agent-eval/SKILL.md),
  [Eval Harness](../../../skills/eval-harness/SKILL.md), and
  [Agent Self Evaluation](../../../skills/agent-self-evaluation/SKILL.md).
- [Recursive Decision Ledger](../../../skills/recursive-decision-ledger/SKILL.md),
  [Team Agent Orchestration](../../../skills/team-agent-orchestration/SKILL.md),
  [Dispatching Parallel Agents](../../../skills/dispatching-parallel-agents/SKILL.md),
  and [Subagent Driven Development](../../../skills/subagent-driven-development/SKILL.md).
- [MCP Builder](../../../skills/mcp-builder/SKILL.md),
  [Skill Creator](../../../skills/skill-creator/SKILL.md),
  [Hookify Rules](../../../skills/hookify-rules/SKILL.md),
  [Safety Guard](../../../skills/safety-guard/SKILL.md), and
  [Gateguard](../../../skills/gateguard/SKILL.md).
- [Cost Aware LLM Pipeline](../../../skills/cost-aware-llm-pipeline/SKILL.md),
  [Cost Tracking](../../../skills/cost-tracking/SKILL.md), and
  [Acontext Installer](../../../skills/acontext-installer/SKILL.md).

## Mapped commands

- [`/harness-audit`](../../../commands/harness-audit.md)
- [`/learn`](../../../commands/learn.md) and
  [`/learn-eval`](../../../commands/learn-eval.md)
- [`/instinct-status`](../../../commands/instinct-status.md),
  [`/instinct-export`](../../../commands/instinct-export.md), and
  [`/instinct-import`](../../../commands/instinct-import.md)
- [`/hookify`](../../../commands/hookify.md),
  [`/hookify-configure`](../../../commands/hookify-configure.md), and
  [`/hookify-list`](../../../commands/hookify-list.md)
- [`/loop-start`](../../../commands/loop-start.md) and
  [`/loop-status`](../../../commands/loop-status.md)
- [`/santa-loop`](../../../commands/santa-loop.md) — adversarial agent-output review.
- [`/model-route`](../../../commands/model-route.md) and
  [`/cost-report`](../../../commands/cost-report.md)
- [`/wiki-init`](../../../commands/wiki-init.md),
  [`/wiki-status`](../../../commands/wiki-status.md),
  [`/wiki-capture`](../../../commands/wiki-capture.md),
  [`/wiki-ingest`](../../../commands/wiki-ingest.md),
  [`/wiki-query`](../../../commands/wiki-query.md), and
  [`/wiki-lint`](../../../commands/wiki-lint.md)

## Playbook

### Phase 1 — framework identification and harness

1. Identify product agent frameworks with Agentic OS and `/harness-audit`.
2. Optimize the action space with Harness Optimizer, Agent Harness Construction, and
   Better Harness.

### Phase 2 — memory tiers

1. Use Continuous Learning V2 and `/learn` for instincts.
2. Use the local LLM Wiki for project knowledge when configured.
3. Use Memclaw only when a richer entity graph is needed.
4. Use the decision ledger and instincts export for archival patterns.
5. Apply Context Budget and model routing.

### Phase 3 — orchestration, safety, and eval

1. Choose loops through Continuous Agent Loop; Autonomous Loops is a detail.
2. Use team/parallel orchestration and SDD as needed.
3. Bound tools with Hookify and Safety Guard.
4. Run evidence-based evals; use `/santa-loop` when accepting agent-output quality
   claims.
5. Build product tool surfaces with MCP Builder.

### Phase 4 — portfolio handoff

Product skill authoring can use Skill Creator. Stocktake, scout, comply, promote, and
prune belong to [Meta](../meta/INDEX.md).

## Verification defaults

- Run `/harness-audit` when the harness changes.
- Use Better Harness for material action-space review.
- Use `/santa-loop` when accepting agent-output quality claims.
- Hand tools, secrets, and user data to Code for ship review.

## Handoffs

- **→ [Code](../code/INDEX.md):** product agents touch secrets, tools, or user data.
- **← [Creator](../creator/INDEX.md):** a new product needs AI features.
- **→ [Workflow](../workflow/INDEX.md):** the work is personal-only automation.
- **→ [Meta](../meta/INDEX.md):** portfolio, install, compliance, promotion, or prune
  work is requested.
