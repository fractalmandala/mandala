---
title: Fractalsvelte Svelte Component Library — Architecture Design
description: The package is a SvelteKit application that doubles as an npm library. src/lib/ holds the publishable component source: each component lives in its own folder (e.g. components/button/, components/ai-…
tags: [packages/fractalsvelte]
type: card
module: packages/fractalsvelte
path: packages/fractalsvelte
created: 2026-08-05
updated: 2026-08-06
---

The package is a SvelteKit application that doubles as an npm library. `src/lib/` holds the publishable component source: each component lives in its own folder (e.g. `components/button/`, `components/ai-elements/action/` containing a `.svelte` root, optional sibling parts (`*-content.svelte`, `*-trigger.svelte`, etc.), a `.sass` stylesheet, and an `index.ts` barrel re-exporting named exports plus type aliases. The top-level `src/lib/index.ts` is the package entry point (currently empty — individual `./accordion`, `./alert`, … paths are declared in `package.json` `exports`. Shared cross-cutting code lives alongside: `themes.ts` wraps `themes.json` typed data for CSS custom properties, `types.ts` defines shared prop enums (`Radius`, `TextSize`, `TextTransform`, and `accents.ts` / `utils.ts` provide helpers. A parallel `src/routes/(docs)/` SvelteKit app renders documentation pages driven by markdown content under `src/content/components/*.md` and `src/content/blocks/*.md`, using mdsvex preprocessing. Build output goes through `svelte-package` into `dist/`, with `@sveltejs/adapter-vercel` powering the docs site. Scripts under `scripts/` generate palettes, themes, and port manifests; `ports/*.json` files capture per-component metadata used by the orchestration pipeline.
