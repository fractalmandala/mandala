---
title: Fractalsvelte Svelte Component Library — Unique Setup and Commands
description: npm run dev starts the SvelteKit docs/dev server; npm run build runs vite build then prepack which executes svelte-kit sync && svelte-package && publint; npm run check runs svelte-check; theme/palett…
tags: [packages/fractalsvelte]
type: card
module: packages/fractalsvelte
path: packages/fractalsvelte
created: 2026-08-05
updated: 2026-08-06
---

`npm run dev` starts the SvelteKit docs/dev server; `npm run build` runs `vite build` then `prepack` which executes `svelte-kit sync && svelte-package && publint`; `npm run check` runs `svelte-check`; theme/palette generation uses `node scripts/gen-palette.mjs <palette> [--class]` to regenerate `_tokens.sass` or per-theme sass files from frozen shadcn token data; `node scripts/ai-elements-scan.mjs` rescans the ai-elements registry and writes `ports/ai-elements-facts.json`.
