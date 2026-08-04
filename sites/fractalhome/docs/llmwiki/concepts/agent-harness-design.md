---
title: Agent Harness Design
description: Designing external structure around agents for planning, execution, handoffs, and skeptical evaluation.
tags: [agent-harness, evaluation, orchestration]
sources:
  - harness-design-long-running.md
  - building-effective-agents.md
  - 2026-08-02-170717-hqflow-boss-orchestrator-armory.md
  - Avid-on-X-How-to-Build-Your-First.md
  - Hanako on X Eval Engineering build the gate that lets your agents merge without you (full 6-step course) X.md
  - Granite on X A Graph of Loops Build a Full Claude Code Agent System From GitHub - One Repo Per Step X.md
created: 2026-08-02
updated: 2026-08-03
type: concept
---

A planner-generator-evaluator split can make requirements explicit, test the real product, and avoid self-approval bias. Reassess each component as base-model ability evolves. Related: [[Context Engineering]] and [[Agentic Systems]].

In Fractal Agentic, the production delivery harness is [[Boss Orchestration Runtime]]: domain bosses (Axis A), optional capability pins (Axis B), primary verification of worker claims, and mandatory **ship | fix-first | rethink** review. Pins are best-effort; missing install never blocks product work. Domain inventory: [[Domain Bosses Armory]]. Canvas: [[Code HQFlow]].

External evidence should control handoffs and release readiness, rather than merely appear in dashboards. Useful controls include deterministic checks, scoped tool permissions, trajectory review, independent evaluators, certificate invalidation after material changes, and escalation for high-blast-radius work. Related: [[Evaluation Gates and Evidence-Based Autonomy]] and [[Graph Engineering]].
