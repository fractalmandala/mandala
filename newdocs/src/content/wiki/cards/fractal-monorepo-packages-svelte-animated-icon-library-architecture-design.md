---
title: Svelte Animated Icon Library — Architecture Design
description: The package is a SvelteKit + @sveltejs/package project that publishes both a core AnimatedIcon component and per-library icon components via subpath exports. The runtime core lives in src/lib/core/:…
tags: [packages/svelte_animated_icon]
type: card
module: packages/svelte_animated_icon
path: packages/svelte_animated_icon
created: 2026-08-05
updated: 2026-08-06
---

The package is a SvelteKit + `@sveltejs/package` project that publishes both a core `AnimatedIcon` component and per-library icon components via subpath exports. The runtime core lives in `src/lib/core/`: `AnimatedIcon.svelte` is the single Svelte component that accepts raw SVG inner content and applies an animation template via the Web Animations API; `templates.svelte.ts` defines the registry of structure-agnostic animation templates (`draw`, `cascade`, `pop`, `spin`, `jelly`, `orbit`, `assemble`, `trace`, `tada`, `flip`, `swing`, `wave`, etc.) plus `TEMPLATES`, `TEMPLATE_IDS`, `getTemplate`, and `clearProps`. Per-icon-set generated components live under `src/lib/{phosphor,remix,flowbite,hero,ion}/icons/*.svelte`, each wrapping `AnimatedIcon` with a `VARIANTS` map for that set's variants (e.g. regular/light/fill). A Node script `scripts/generate.js` reads raw SVGs from `static/svg/<set>-<variant>/`, strips wrappers, normalizes colors to `currentColor`, and emits one `.svelte` component per icon plus a barrel `index.ts`. Documentation pages under `src/routes/docs/` are mdsvex Markdown files, while `src/lib/components/` holds demo-only UI (BezierEditor, EasingControl). The public API surface is re-exported from `src/lib/index.ts` with subpath entries declared in `package.json`'s `exports` field.
