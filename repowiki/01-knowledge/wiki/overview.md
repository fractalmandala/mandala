---
title: Mandala Monorepo Architecture
description: pnpm monorepo of SvelteKit/Svelte 5/Tauri/TypeScript apps, sites, and publishable packages with indented-SASS styling.
tags: [monorepo, architecture, sveltekit, tauri, typescript, sass]
type: concept
created: 2026-08-04
updated: 2026-08-04
---

# Mandala Monorepo Architecture

`/Users/amrit/mandala` is a pnpm monorepo ("fractals") holding everything the author works on — desktop apps, websites, and publishable npm packages. A single workspace manifest (`pnpm-workspace.yaml`) ties apps/, sites/, and packages/ together.

## Canonical stack

- **SvelteKit 2 + Svelte 5 (runes)** for nearly every app, site, and the component library.
- **Tauri 2** for desktop shells (`src-tauri/`); Rust commands stay thin, domain logic in Rust modules.
- **TypeScript** across the board; Svelte 5 runes only (`$state`, `$derived`, `$props`, `$effect`) — no legacy `$:` reactivity or `svelte/store` for new code.
- **Indented SASS only** (`.sass`, single-tab, no braces, no semicolons). No SCSS, no CSS, no `<style>` blocks inside Svelte components for shell UI. Two-layer CSS tokens: primitives → semantic, consumed via semantic variables (e.g. `--background10`, `--text-primary`).

## Top-level layout

| Path | Role |
|---|---|
| `apps/` | Desktop apps (Tauri + SvelteKit). fracta, shradhapp, fractaldesk, CodeEdit-main (vendored). |
| `sites/` | SvelteKit websites — blog, wiki, docs, home, agent-memory experiments. |
| `packages/` | Publishable npm libraries + the fractal-agentic orchestration plugin. |
| `vendors/` | Third-party vendored code (svocs-main, xyflow-main, flow-maps) — reference only. |
| `basedocs/`, `docs/learnings/` | Cross-project documentation and captured learnings. |
| `deposits/` | Local media + project workspaces (gitignored). |
| `ide-workspaces/` | `.code-workspace` files per project. |

## Cross-cutting conventions

1. **Tokens-only styling.** Components never hardcode colors/sizes/spacing/radii/shadows except for ≤2-place low-usage overrides.
2. **Reusable general classes** over singular-element classes; divergence/drift must be checked after every styling change (shradhapp rule, applied monorepo-wide).
3. **Fractal Agentic plugin** is the preferred agent process across the monorepo: detect the plugin, select exactly one of seven domain bosses, follow `/orchestrate` + ship|fix-first|rethink. Detection is best-effort and never blocks project work.
4. **Single IPC gateway** where Tauri is used (e.g. `src/lib/ipc.ts`) with a browser mock so `pnpm dev` works fully outside Tauri; parity enforced by contract tests.

## Scope of this knowledge build

Per `wiki_plan.yaml`, the build covers the in-scope mandala modules **plus** two external folders outside the project root:
- `/Users/amrit/100cabinet/10wiki/fractal-wiki` — the LLM wiki vault (raw → wiki → output).
- `/Users/amrit/100cabinet/90AI` — the General File Cabinet AI agent/skill/plugin config.

Separately-tracked repos listed in the root `.gitignore` (`apps/fractalknow`, `apps/fractalengine`, `apps/fractalai`, `deposits`, `sites/fractaldharma`) are intentionally excluded.

See the [[Apps Module]], [[Sites Module]], [[Packages Module]], [[Fractal Agentic System]], [[Fractal Wiki Vault]], [[Cabinet 90AI]], and [[Coding Conventions]] pages for detail.
