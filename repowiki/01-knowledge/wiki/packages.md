---
title: Packages Module
description: Publishable npm packages plus the fractal-agentic orchestration plugin — styler, animated icons, iconsets, fractalsvelte, agentic.
tags: [packages, npm, fractal-agentic, fractalsvelte, svelte-animated-icon, morphicons, styler]
type: concept
created: 2026-08-04
updated: 2026-08-04
---

# Packages Module (`packages/`)

Publishable npm libraries and the grand orchestration plugin. The monorepo root `package.json` ("fractals", private, pnpm) wires workspace scripts that filter into individual packages (`@fractals/fracta`, `@fractals/desktop`, `@fractals/fractalbodha`, `@fractals/fractalbuilder`).

## Public npm packages

- **morphicons-svelte** — morphicons ported to Svelte. [npm](https://www.npmjs.com/package/morphicons-svelte).
- **svelte-animated-icon** — thousands of iconsets animated in dozens of ways; a complete animated-icons library for SvelteKit. [npm](https://www.npmjs.com/package/svelte-animated-icon).
- **@fractaldesign/svelte-icons** — combined iconset library (published). [npm](https://www.npmjs.com/package/@fractaldesign/svelte-icons).
- **fractalsvelte** — `packages/fractalsvelte`. A SvelteKit component library with **no Tailwind, no class-string merging**, customization through props. Ships from `src/lib/`; docs site in `src/routes/docs/` with page content in `src/content/components/`.
  - **Dual distribution:** published to npm **and** meant to be copy-pasteable. A flattened copy-paste variant (mixins inlined, shared classes resolved) is generated from the same source — never hand-maintained.
  - **Docs chrome:** `Preview`, `Examples`, `PropsTable` (after Examples), `CodeBlock`, `Sidebar`, `Toc`. Radius `--doc-r` 3px / `--doc-r-lg` 6px; no single-side accent borders. Prose selectors must exclude `[data-slot]` so rendered components inside `.doc-article` don't inherit prose styling.
  - **Page structure:** title+lede → hero Preview → Installation (npm **and** copy-paste) → Usage → Examples → Props → Theming.
- **fractals-styler** — `packages/fractals-styler`. Scaffolds the house SASS styling + preset classes into any new project. Enforces tokens-only, two-layer CSS tokens (primitives→semantic), Svelte 5 runes only, indented SASS discipline, no `<style>` blocks in Svelte (styles under `src/lib/styles/`), single IPC gateway, hostile-HTML boundary (`{@html}` must route through `sanitizeHtml`), undo/redo boundaries on all editable state.

## Orchestration packages

- **fractal-agentic** — `packages/fractal-agentic`. The grand orchestration system (see [[Fractal Agentic System]]). Packages the agent process under `plugin/`. Language TS, package manager pnpm, add-ons prettier/eslint/sveltekit-adapter/mdsvex.
- **fractal-agentic-qoder-plugin** — Qoder-native plugin variant; carries the same startup router with the seven-boss table (Design, Svelte, Code, Agent, Creator, Workflow, Meta).

See [[Fractal Agentic System]] for the orchestration depth, and [[Coding Conventions]] for the shared SASS/token rules.
