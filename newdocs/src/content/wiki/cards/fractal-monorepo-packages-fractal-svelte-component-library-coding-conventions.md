---
title: Fractal Svelte Component Library — Coding Conventions
description: - Each component lives in its own directory under src/lib/components/<category/<slug/ with an index.js entry that re-exports the Svelte component, and is mirrored as a named export in package.json's…
tags: [packages/fractal_svelte]
type: card
module: packages/fractal_svelte
path: packages/fractal_svelte
created: 2026-08-05
updated: 2026-08-06
---

- Each component lives in its own directory under `src/lib/components/<category>/<slug>/` with an `index.js` entry that re-exports the Svelte component, and is mirrored as a named export in `package.json`'s `exports` map.
- Category index files (`components/motion/index.ts`, `components/agents/index.ts`, `components/blocks/index.ts` explicitly re-export every component rather than using wildcard re-exports, keeping the public surface explicit.
- Catalog-driven development: new components must be reflected in `ports/upstream-catalog.json` and then regenerated via `generate-catalog.ts`, which produces both the typed catalog and the preview loader map used by the dev site.
- Tests are written as per-file `*.test.ts` suites under `tests/` using Vitest with jsdom, and global browser APIs like `matchMedia` are patched once in `tests/setup.ts`.
- Site code uses SvelteKit path aliases defined in `svelte.config.js` (`@` → `src/lib`, `$site` → `src/site`, `$examples` → `src/examples`, `@fractaldesign/fractal-svelte` → `src/lib` instead of relative imports.
