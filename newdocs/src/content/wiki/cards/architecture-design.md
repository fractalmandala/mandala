---
title: Mandala Monorepo — Architecture Design
description: The root is a flat orchestrator that binds three sibling domains — apps/ (Tauri+SvelteKit desktop), sites/ (SvelteKit/Astro static sites), and packages/ (npm libraries plus the fractal-agentic orches…
tags: [repo]
type: card
module: repo
path: repo
created: 2026-08-05
updated: 2026-08-06
---

The root is a flat orchestrator that binds three sibling domains — `apps/` (Tauri+SvelteKit desktop), `sites/` (SvelteKit/Astro static sites), and `packages/` (npm libraries plus the fractal-agentic orchestration core) — through shared developer tooling rather than runtime code. Cross-cutting concerns are centralized at the top level: `AGENTS.md` defines the Fractal Agentic plugin bootstrap and boss-selection protocol consumed by every child; `CLAUDE.md`, `GEMINI.md`, and `.windsurfrules` are thin shims that defer to `AGENTS.md`; `README.md` registers all projects; `LEARNINGS.md` plus `docs_learnings/` capture retrospectives; and `ide_workspaces/` provides per-project VS Code multi-root sessions so each child can be edited in isolation while sharing the same repo-wide conventions (Svelte 5, TypeScript, single-tab SASS). The fractal-agentic package (`packages/fractal-agentic` acts as the central knowledge/orchestration layer that agents across all children invoke via its skills, commands, and boss playbooks.
