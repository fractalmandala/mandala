---
title: Fractal Workflow Contracts (Review & Release) — Architecture Design
description: This module is a contract-only layer: it contains Markdown specifications (review-fanout.workflow.md, monorepo-release.workflow.md) plus a README that maps user-facing slash commands to these contrac…
tags: [packages/fractal_agentic/plugin_core/workflows]
type: card
module: packages/fractal_agentic/plugin_core/workflows
path: packages/fractal_agentic/plugin_core/workflows
created: 2026-08-05
updated: 2026-08-06
---

This module is a contract-only layer: it contains Markdown specifications (`review-fanout.workflow.md`, `monorepo-release.workflow.md` plus a README that maps user-facing slash commands to these contracts. Each `.workflow.md` file defines an input schema, phased execution steps, output JSON schema, and safety constraints — intended to be implemented by any host's native Workflow/Task engine when available, with a degraded path falling back to sequential specialist agents when no engine exists. The review workflow specifies a three-stage pipeline (parallel review across dimensions → dedup by evidence snippet → adversarial verify for CRITICAL/HIGH) and maps its verdict into Fractal's completion language (`ship | fix-first | rethink`. The release workflow defines five phases (verify, changelog, version bump, publish, notify) with explicit safety invariants (user confirmation, 2FA check, tag rollback on failure). Dependency direction is outward only: workflows reference other Fractal assets (`boss-orchestration`, `fractal_agentic_fresh_reviewer`, `/santa-loop`, `/quality-gate` but are not imported by code — they are consumed as human/machine-readable contracts.
