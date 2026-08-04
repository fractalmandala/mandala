---
title: Code HQFlow
description: Local-first workflow canvas tool that renders .codehq JSON maps; no LLM and no code upload.
tags: [hqflow, tooling, visualization, documentation]
sources:
  - 2026-08-02-170717-hqflow-boss-orchestrator-armory.md
created: 2026-08-02
updated: 2026-08-02
type: entity
project: fractal-agentic
---

**HQFlow** (`hqflow` CLI, package `hqflow`) is a local-first workflow mapper for coding agents. It watches `.codehq/workflows/*.json`, validates schema, and renders an interactive canvas. It has no LLM of its own and never uploads repository code.

## Repo layout (Fractal Agentic)

| Path | Role |
| --- | --- |
| `.codehq/SKILL.md` | Agent authoring rules (18 rules, schema) |
| `.codehq/project.json` | Project id/name + default workflow |
| `.codehq/workflows/<id>.json` | Workflow documents |
| `.codehq/diagnostics.json` | Validate output |

## Fractal map

Workflow **`boss-orchestrator-armory`** documents [[Boss Orchestration Runtime]] and [[Domain Bosses Armory]]: orchestrator entry → domain select → seven boss steps with agents/skills/commands and handoff edges.

Commands used in session: `hqflow validate`, `pnpm dlx hqflow validate`, `pnpm dlx hqflow open` (server later stopped).
