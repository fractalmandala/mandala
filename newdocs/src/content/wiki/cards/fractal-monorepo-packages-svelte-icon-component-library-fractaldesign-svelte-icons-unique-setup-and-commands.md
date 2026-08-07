---
title: Svelte Icon Component Library (@fractaldesign/svelte-icons) — Unique Setup and Commands
description: Icons must be regenerated whenever SVG sources change: npm run generate (or npm run build / npm run check which invoke it automatically). The generator uses a .generate-icons.lock file to prevent con…
tags: [packages/svelte_icons]
type: card
module: packages/svelte_icons
path: packages/svelte_icons
created: 2026-08-05
updated: 2026-08-06
---

Icons must be regenerated whenever SVG sources change: `npm run generate` (or `npm run build` / `npm run check` which invoke it automatically). The generator uses a `.generate-icons.lock` file to prevent concurrent runs. Publishing requires `npm run prepack` which runs generation, `svelte-kit sync`, `svelte-package`, and `publint`. Development server runs via `npm run dev`.
