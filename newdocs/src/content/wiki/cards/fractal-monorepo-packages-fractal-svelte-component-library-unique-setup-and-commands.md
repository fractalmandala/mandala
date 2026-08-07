---
title: Fractal Svelte Component Library — Unique Setup and Commands
description: pnpm generate:catalog regenerates src/lib/catalog/generated.ts and preview-loaders.generated.ts from ports/upstream-catalog.json; pnpm check:catalog runs the generator in --check mode to fail if the…
tags: [packages/fractal_svelte]
type: card
module: packages/fractal_svelte
path: packages/fractal_svelte
created: 2026-08-05
updated: 2026-08-06
---

`pnpm generate:catalog` regenerates `src/lib/catalog/generated.ts` and `preview-loaders.generated.ts` from `ports/upstream-catalog.json`; `pnpm check:catalog` runs the generator in `--check` mode to fail if the generated files drift. `pnpm prepack` runs `svelte-kit sync && svelte-package && publint` before publishing. Tests require the `@humanspeak/svelte-motion` alias to resolve to `tests/mocks/motion.ts` via `vite.config.ts`.
