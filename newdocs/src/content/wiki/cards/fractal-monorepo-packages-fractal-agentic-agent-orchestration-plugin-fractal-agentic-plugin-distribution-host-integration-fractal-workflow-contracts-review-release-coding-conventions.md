---
title: Fractal Workflow Contracts (Review & Release) — Coding Conventions
description: - Each workflow is authored as a standalone Markdown spec with explicit sections for Purpose, Inputs (table with required/optional), Phases/Dimensions, Finding/Output schemas, Safety rules, and Relat…
tags: [packages/fractal_agentic/plugin_core/workflows]
type: card
module: packages/fractal_agentic/plugin_core/workflows
path: packages/fractal_agentic/plugin_core/workflows
created: 2026-08-05
updated: 2026-08-06
---

- Each workflow is authored as a standalone Markdown spec with explicit sections for Purpose, Inputs (table with required/optional), Phases/Dimensions, Finding/Output schemas, Safety rules, and Related assets.
- I/O is defined as strict JSON schemas with typed fields and enumerated values, and invalid inputs produce fail-closed behavior (reject rather than approve unreviewed payloads).
- Workflows map their results into Fractal's completion language (`ship | fix-first | rethink`, `APPROVE | CHANGES_REQUESTED` so host implementations integrate seamlessly with the primary session without custom adapters.
- Security-sensitive paths are detected via case-insensitive keyword matching against diff content and changed file paths, triggering the security-reviewer dimension automatically.
