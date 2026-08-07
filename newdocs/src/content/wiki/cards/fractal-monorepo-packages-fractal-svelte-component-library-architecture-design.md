---
title: Fractal Svelte Component Library — Architecture Design
description: The package is a dual-purpose npm library plus SvelteKit documentation/dev site. The library surface lives under src/lib/ and is split into three categories — components/motion/, components/agents/,…
tags: [packages/fractal_svelte]
type: card
module: packages/fractal_svelte
path: packages/fractal_svelte
created: 2026-08-05
updated: 2026-08-06
---

The package is a dual-purpose npm library plus SvelteKit documentation/dev site. The library surface lives under `src/lib/` and is split into three categories — `components/motion/`, `components/agents/`, and `components/blocks/` — each re-exported through a flat `index.ts` barrel and individually exposed via `package.json` exports so consumers can import `@fractaldesign/fractal-svelte/button`, `./message`, etc. Shared utilities (`ease.ts`, `utils.ts` and the motion animation layer (`lib/motion/` are consumed by all categories. A generated catalog under `src/lib/catalog/` (types in `catalog/types.ts`, generated entries and preview loaders) is produced from `ports/upstream-catalog.json` (the beUI registry snapshot) via `scripts/generate-catalog.ts`, which also drives `check-catalog.ts`, `check-component-completeness.ts`, and other validation scripts. The SvelteKit app under `src/routes/` serves the component docs, examples, and a `/r/` registry API; `src/site/` holds shared site shell components (Breadcrumbs, CodeBlock, PreviewFrame, PropsTable, etc.). Build output goes through `svelte-package` into `dist/`, with `sideEffects` declared for `.css`/`.sass` assets. Tests live in `tests/` using Vitest + jsdom, with `@humanspeak/svelte-motion` mocked via `tests/mocks/` and aliased in `vite.config.ts`.
