---
title: svelte-animated-icon
description: Tree-shakeable Svelte 5 animated icon library powered by the native Web Animations API — Phosphor, Remix, Hero, Ion, and Flowbite icon sets, by Fractaldesign.
tags: [package, svelte, icons, animation, web-animations-api]
type: card
module: packages/svelte-animated-icon
path: packages/svelte-animated-icon
created: 2026-08-06
updated: 2026-08-06
---

Svelte Animated Icon is a Svelte 5 animated icon library by Fractaldesign — tree-shakeable, multi-library, and powered by the browser's native [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) (no animation library dependency).

## Structure

The package and its docs site share one SvelteKit project:

- `src/lib/` — package source: `AnimatedIcon`, the templates, and generated per-icon `.svelte` files.
- `src/lib/core/` + `src/lib/data/` + `src/lib/utils/` — animation core, icon data, and helpers.
- `src/lib/<set>/` — icon sets: `phosphor`, `remix`, `hero`, `ion`, `flowbite`.
- `src/routes/` — the docs site (interactive explorer + mdsvex-compiled `/docs` pages).
- `scripts/generate.js` — reads source SVGs and writes per-icon `.svelte` files; `static/svg/` holds raw Phosphor/Remix sources.

## Project facts

- GitHub: `fractalmandala/svelte-animated-icon`; site: svelte-animated-icon.vercel.app.
- Built with SvelteKit 2 + Svelte 5, `@sveltejs/package`, and mdsvex.
- Icons are MIT; the package source follows the license in `package.json`.
