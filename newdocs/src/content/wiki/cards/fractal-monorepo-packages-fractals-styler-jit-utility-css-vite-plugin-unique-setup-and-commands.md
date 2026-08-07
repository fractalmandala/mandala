---
title: Fractals Styler — JIT Utility CSS Vite Plugin — Unique Setup and Commands
description: pnpm build runs tsup to emit dist/index.js, dist/cli.js, and dist/index.d.ts. Consumers run npx fractals-styler init [dest] [--force] to copy the SASS templates into their project, then add the plugi…
tags: [packages/fractals_styler]
type: card
module: packages/fractals_styler
path: packages/fractals_styler
created: 2026-08-05
updated: 2026-08-06
---

pnpm build runs tsup to emit dist/index.js, dist/cli.js, and dist/index.d.ts. Consumers run npx fractals-styler init [dest] [--force] to copy the SASS templates into their project, then add the plugin in vite.config.ts and import virtual:fractals-styler.css once globally.
