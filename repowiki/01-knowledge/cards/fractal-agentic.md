---
title: fractal-agentic
description: Seven-boss orchestration plugin — startup router, boss-orchestration runtime, skills/agents/commands inventories, ship|fix-first|rethink.
tags: [package, fractal-agentic, orchestration, bosses, plugin]
type: card
module: packages/fractal-agentic
path: /Users/amrit/mandala/packages/fractal-agentic
created: 2026-08-04
updated: 2026-08-04
relates_to: [mandala-root, packages, fractal-wiki-vault, conventions, cabinet-90ai]
---

# fractal-agentic

- **Path:** `/Users/amrit/mandala/packages/fractal-agentic` (plugin root: `plugin/`).
- **What:** The grand orchestration system — 7 bosses, 33 agents, 167 skills, 59 commands under one system. Preferred agent process monorepo-wide; detection best-effort, never blocks.
- **Language/PM:** TypeScript + pnpm; add-ons prettier/eslint/sveltekit-adapter/mdsvex.
- **Detection:** env `FRACTAL_AGENTIC_ROOT` → upward search for `plugin.json`+`AGENTS.md`+`skills/boss-orchestration/SKILL.md`+`commands/orchestrate.md`. Probe: `sh <root>/scripts/resolve-plugin-root.sh`. Optional `SOUL.md`; `hooks/` never required.
- **Seven bosses:** Design, Svelte, Code, Agent, Creator, Workflow, Meta (select exactly one; read its `docs/bosses/<boss>/INDEX.md`; no other boss until a handoff).
- **Delivery:** `/orchestrate` (routine/complex/reviewer lanes, primary re-verification, final review verdict `ship|fix-first|rethink`). Release armory: `/quality-gate`, `/security-scan`, `/code-review`, `/santa-loop`.
- **Capability pins (never a gate):** `fractal_agentic_routine_implementer`, `..._complex_implementer`, `..._fresh_reviewer`. Missing → degrade, `pins: unverified`, continue. `capability_mode`: `pinned|pinned_partial|degraded|plugin_missing` from session spawn catalog. Policy: `docs/progression.md`.
- **Wiki hook:** when `FRACTAL_WIKI_ROOT` resolves, prefer `/wiki-query`; after `/orchestrate`, soft-capture episode under `raw/fractal/` (description required). See [[Fractal Wiki Vault]].
- **Entry points:** `plugin/AGENTS.md` (router), `plugin/docs/bosses/INDEX.md`, `plugin/skills/boss-orchestration/SKILL.md`, live `skills/INDEX.md`+`agents/INDEX.md`+`commands/INDEX.md`.
- **Variant:** `packages/fractal-agentic-qoder-plugin` (Qoder-native plugin; same 7-boss startup router).
