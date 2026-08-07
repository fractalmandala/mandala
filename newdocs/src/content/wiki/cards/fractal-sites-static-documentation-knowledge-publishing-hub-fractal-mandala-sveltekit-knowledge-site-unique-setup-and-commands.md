---
title: Fractal Mandala — SvelteKit Knowledge Site — Unique Setup and Commands
description: Content is synced from an external vault before building: run npm run sync-banks (Node script reads BANKVAULTPATH env var defaulting to /Users/amrit/100cabinet/10wiki and src/lib/data/routes-config.j…
tags: [sites/fractalmandala]
type: card
module: sites/fractalmandala
path: sites/fractalmandala
created: 2026-08-05
updated: 2026-08-06
---

Content is synced from an external vault before building: run `npm run sync-banks` (Node script reads `BANK_VAULT_PATH` env var defaulting to `/Users/amrit/100cabinet/10wiki` and `src/lib/data/routes-config.json`. Development uses `npm run dev`, builds with `npm run build`, previews with `npm run preview`, and type-checks via `npm run check`. Linting/formatting are handled by Prettier and ESLint through `npm run lint` and `npm run format`.
