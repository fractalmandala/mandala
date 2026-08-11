---
title: "Domain bosses"
description: "Choose one domain owner, read its authoritative playbook, and hand off only when the work crosses a boundary."
type: guide
---

# Domain bosses

Bosses are executive domains, not chat personas. Begin with the
[startup router](../../AGENTS.md), choose one owner here, then read **only** that
boss's authoritative nested playbook. Do not preload the other boss armories.

## Discovery rule

1. Apply the router's trivial exemption first.
2. Select one boss from the table below.
3. Read its nested `INDEX.md` in full.
4. Stop. Load another boss only after a handoff changes the active domain.
5. For non-trivial delivery work, load [orchestration](../orchestration/INDEX.md)
   after the boss is selected; runtime policy remains in
   [`boss-orchestration`](../../skills/boss-orchestration/SKILL.md).

## Choose one boss

| Signal | Active boss | Authoritative playbook | Activate |
| --- | --- | --- | --- |
| UI craft, tokens, accessibility, motion, visual QA | Design | [Design](./design/INDEX.md) | [`/activate-boss-design`](../../commands/activate-boss-design.md) |
| Svelte, SvelteKit, SASS, or component porting | Svelte | [Svelte](./svelte/INDEX.md) | [`/activate-boss-svelte`](../../commands/activate-boss-svelte.md) |
| Security, audits, tests, performance, docs from code | Code | [Code](./code/INDEX.md) | [`/activate-boss-code`](../../commands/activate-boss-code.md) |
| Product agent harness, memory, MCP, or evals | Agent | [Agent](./agent/INDEX.md) | [`/activate-boss-agent`](../../commands/activate-boss-agent.md) |
| New app, site, or package from scaffold to ship | Creator | [Creator](./creator/INDEX.md) | [`/activate-boss-creator`](../../commands/activate-boss-creator.md) |
| Personal habits, hooks, instincts, cost, or loops | Workflow | [Workflow](./workflow/INDEX.md) | [`/activate-boss-workflow`](../../commands/activate-boss-workflow.md) |
| Plugin install, inventory, compliance, promotion, or pruning | Meta | [Meta](./meta/INDEX.md) | [`/activate-boss-meta`](../../commands/activate-boss-meta.md) |
| Unclear net-new product | Creator | [Creator](./creator/INDEX.md) | [`/activate-boss-creator`](../../commands/activate-boss-creator.md) |

Use Svelte's port lane for shadcn/fractalsvelte work. Creator is the executive
default for an unclear new product; Workflow is only the observation-first option for
personal operating friction.

## Boundary rules

| Concern | Owner |
| --- | --- |
| Agent systems inside product code | [Agent](./agent/INDEX.md) |
| Personal habits, hooks, instincts, and daily pruning | [Workflow](./workflow/INDEX.md) |
| Plugin install, inventory, and portfolio health | [Meta](./meta/INDEX.md) |
| Visual/a11y QA | [Design](./design/INDEX.md) |
| Behavioral E2E | [Code](./code/INDEX.md) |
| Svelte runes, routes, data flow, and component ports | [Svelte](./svelte/INDEX.md) |
| Media/video grammar (`taste`) | [Creator](./creator/INDEX.md) |

Canonical terms: `svelte-5-runes` is the runes authority (`svelte-runes` is a
reference pack); `continuous-agent-loop` is the loop-selection authority
(`autonomous-loops` is implementation detail); and memory tiers run instincts →
entity memory → session checkpoint.

## Handoff triggers

| From → To | When |
| --- | --- |
| Svelte → Design | Implementation needs visual polish, tokens, accessibility, or motion |
| Design → Svelte | Design is decided and routes, runes, or SASS components remain |
| Svelte / Creator → Code | Security, tests, quality gate, or technical-debt release work is needed |
| Creator → Svelte | Scaffold exists and the product body is SvelteKit |
| Creator → Agent | The product needs an AI harness, memory, or MCP surface |
| Agent → Code | Agent work touches secrets, tools, or user data |
| Workflow → Agent | Personal automation becomes a product feature |
| Any → Meta | Plugin install, inventory, compliance, promotion, or pruning is needed |
| Any → Creator | Scope becomes a new app, site, or package |

Carry verification evidence into the next phase. The receiving boss becomes active,
and only its playbook should be loaded. Creator may pull another armory mid-build;
final ship still returns to the relevant implementation and Code/Creator gates.

## Stack and surface gate

Detect Svelte, React, Vue, Flutter, Rust, or Tauri from manifests and file extensions.
Load primary reviewers for the detected stack; keep others secondary except during a
migration. This package defaults to Svelte, but project-local instructions win.

| Stack | Primary reviewer | Secondary |
| --- | --- | --- |
| Svelte 5 / SvelteKit | svelte-reviewer | code-reviewer, a11y-architect |
| UI components (any framework) | react-reviewer (rules/a11y/security), vue-reviewer (architecture), flutter-reviewer (performance) | code-reviewer |
| Rust / Tauri | rust-reviewer | rust-build-resolver |
| Unknown / polyglot | code-reviewer | stack specialists as files appear |

[Frontend Patterns](../../skills/frontend-patterns/SKILL.md) is Svelte 5 /
SvelteKit native; use it as the default frontend reference.
