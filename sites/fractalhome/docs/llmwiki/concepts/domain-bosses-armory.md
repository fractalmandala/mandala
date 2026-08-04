---
title: Domain Bosses Armory
description: Seven executive domains with agents, skills, and commands; AGENTS.md is the inventory source of truth.
tags: [bosses, armory, agents, skills, commands]
sources:
  - 2026-08-02-170717-hqflow-boss-orchestrator-armory.md
  - 2026-08-02-050000-bosses-eval-meta-and-vendor.md
created: 2026-08-02
updated: 2026-08-02
type: concept
boss: meta
project: fractal-agentic
---

Bosses are **executive domains**, not chat personas. Routing cards live under `plugin/docs/bosses/`; full inventories are only in `plugin/AGENTS.md` §§1–7. Live counts: skills/commands/agents INDEX files — never hardcode totals.

## The seven

| Boss | Activate | Owns |
| --- | --- | --- |
| **Design** | `/activate-boss-design` | Tokens, UI craft, a11y, motion, visual QA |
| **Code** | `/activate-boss-code` | Security, tests, performance, debt, docs-from-code |
| **Agent** | `/activate-boss-agent` | Product agent OS, harness, memory, MCP, eval |
| **Svelte** | `/activate-boss-svelte` | Runes, SvelteKit, SASS, shadcn port lane |
| **Creator** | `/activate-boss-creator` | Scaffold → ship; may commandeer any armory |
| **Workflow** | `/activate-boss-workflow` | Personal OS (habits, hooks, cost) — not product agents |
| **Meta** | `/activate-boss-meta` | Plugin install, skill portfolio, promote/prune |

## Hard splits

- Product agents **inside apps** → Agent; **your** daily habits → Workflow; ECC portfolio → Meta
- Visual/a11y QA (`browser-qa`) → Design; behavioral E2E → Code
- `taste` (media) → Creator media lane, not Design UI craft

## Decision tree (compressed)

UI craft → Design · Svelte/Kit/port → Svelte · security/tests/docs → Code · product harness/MCP → Agent · greenfield/unclear product → Creator · personal prune/hooks → Workflow · install/comply/promote → Meta.

Delivery executes through [[Boss Orchestration Runtime]]. Canvas map: [[Code HQFlow]] workflow `boss-orchestrator-armory`. Related: [[Plugin Distribution and Packaging]], [[SvelteKit Development]], [[Fractals Styler System]].

**2026-08-02 evaluation:** Meta Boss added for portfolio/install; Design stack Svelte-primary; Docs folded into Code; Port into Svelte; orphans mapped; live INDEX files only for counts. Source: [[Bosses Evaluation, Meta Boss, and Plugin Vendoring (Source Summary)]].
