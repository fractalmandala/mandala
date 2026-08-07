---
title: Fractal Agentic System
description: Seven-boss orchestration plugin — startup router, boss-orchestration runtime, skills/agents/commands inventories, and ship|fix-first|rethink review.
tags: [package, fractal-agentic, orchestration, bosses, agents, skills, commands]
type: card
module: packages/fractal-agentic
path: packages/fractal-agentic
created: 2026-08-04
updated: 2026-08-06
---

`packages/fractal-agentic` is a self-described grand orchestration of skills, commands, agents, and bosses under one system that learns, grows, and maintains a wiki — 7 bosses, 33 agents, 167 skills, 59 commands. It is the preferred agent process across the whole mandala monorepo — detection is **best-effort and never blocks** project work.

## Plugin root & detection
The canonical checkout lives at `packages/fractal-agentic/plugin`. A personal copy exists at `~/.agents/plugins/fractal-agentic`. Detection order: env `FRACTAL_AGENTIC_ROOT` → upward search for a dir containing `plugin.json` (name "fractal-agentic") + `AGENTS.md` + `skills/boss-orchestration/SKILL.md` + `commands/orchestrate.md`. "Accessible" = can **read** those files. Optional probe: `sh <root>/scripts/resolve-plugin-root.sh` (exit 0 ⇒ ok). Optional identity: read `SOUL.md` when relevant; hooks under `hooks/` are never required.

## Startup state machine (the router)
1. Read applicable project-local `AGENTS.md` + this router.
2. Apply the **trivial exemption** (single-sentence answer / pure explanation / "what is X?") → if it applies, stop.
3. Select **exactly one** boss.
4. Read that boss's nested `docs/bosses/<boss>/INDEX.md` in full — its mission, exclusions, stack/surface rules, mapped agents/skills/commands, phases, verification defaults, handoffs.
5. **Stop reading other boss playbooks.** A second boss loads only after an explicit handoff.
6. For non-trivial implementation/review/refactor/scaffold/completion-claim, load `/orchestrate` and the runtime it names.
7. The primary session stays responsible for the real diff, verification evidence, and final review verdict.

## The seven bosses
| Task signal | Boss | Activate |
|---|---|---|
| UI craft, tokens, a11y, motion, visual QA | Design | `/activate-boss-design` |
| Svelte, SvelteKit, indented SASS, component porting | Svelte | `/activate-boss-svelte` |
| Security, audits, tests, perf, docs-from-code | Code | `/activate-boss-code` |
| Product agent harness, memory, eval, MCP | Agent | `/activate-boss-agent` |
| New app/site/package scaffold→ship | Creator | `/activate-boss-creator` |
| Personal habits, hooks, instincts, cost, loops | Workflow | `/activate-boss-workflow` |
| Plugin install/inventory/compliance/promotion/prune | Meta | `/activate-boss-meta` |
| Unclear net-new product | Creator | `/activate-boss-creator` |

Svelte's port lane owns shadcn/fractalsvelte work. Agent owns systems inside product code; Workflow owns personal automation; Meta owns the plugin portfolio.

## Delivery runtime
`/orchestrate` chooses routine/complex/reviewer capability lanes when spawn types are exposed, has the **primary** inspect the diff and rerun verification, and requires the best available final review with one verdict: **ship | fix-first | rethink**. The shared release armory is `/quality-gate`, `/security-scan`, `/code-review`, `/santa-loop`. Human navigation hubs: bosses, orchestration, armory (`docs/`/INDEX.md files).

## Capability pins (optional, never a gate)
Prefer exposed `fractal_agentic_*` agent types: `fractal_agentic_routine_implementer`, `fractal_agentic_complex_implementer`, `fractal_agentic_fresh_reviewer`. Improve later via `sh <root>/scripts/install-agents.sh`. If types/templates are missing → **degrade immediately**: implement in primary/general agents, review with domain agents or structured self-review, state `pins: unverified`, and continue. Set `capability_mode` once (`pinned | pinned_partial | degraded | plugin_missing` from the **session spawn catalog**. Policy: `docs/progression.md`.

## Handoffs
- Svelte ↔ Design when implementation and visual craft split.
- Svelte/Creator → Code before security/tests/release gates.
- Creator → Svelte for the product body; Creator → Agent for in-product AI.
- Agent → Code when tools/secrets/user data are involved.
- Workflow → Agent when personal automation becomes a product feature.
- Any boss → Meta for install/inventory/compliance/promotion/prune.
- Any boss → Creator when scope becomes a new app/site/package.

## Continuous LLM wiki hook
When `FRACTAL_WIKI_ROOT` (or fractal wiki config) resolves, prefer `/wiki-query` for prior decisions; after `/orchestrate` completes, soft-capture an episode under `raw/fractal/` (frontmatter **must** include `description`. Missing wiki never blocks product work. See [Fractal Wiki Vault](fractal-wiki-vault.md).

## Entry points
`plugin/AGENTS.md` (router), `plugin/docs/bosses/INDEX.md`, `plugin/skills/boss-orchestration/SKILL.md`, live `skills/INDEX.md` + `agents/INDEX.md` + `commands/INDEX.md`. Language TS, package manager pnpm, add-ons prettier/eslint/sveltekit-adapter/mdsvex.

## Variant
`packages/fractal-agentic-qoder-plugin` (Qoder-native plugin; same 7-boss startup router).

See [Packages Module](../concepts/packages.md), [Coding Conventions](conventions.md), [Fractal Wiki Vault](fractal-wiki-vault.md).
