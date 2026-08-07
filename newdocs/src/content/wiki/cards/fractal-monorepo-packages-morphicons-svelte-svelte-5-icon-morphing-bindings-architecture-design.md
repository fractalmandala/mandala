---
title: morphicons-svelte — Svelte 5 Icon Morphing Bindings — Architecture Design
description: The package is a SvelteKit + Vite project whose public API lives under src/lib/. The entry point src/lib/index.ts re-exports the main MorphIcon.svelte component, its TypeScript props type, two conven…
tags: [packages/morphicons_svelte]
type: card
module: packages/morphicons_svelte
path: packages/morphicons_svelte
created: 2026-08-05
updated: 2026-08-06
---

The package is a SvelteKit + Vite project whose public API lives under `src/lib/`. The entry point `src/lib/index.ts` re-exports the main `MorphIcon.svelte` component, its TypeScript props type, two convenience icon pairs (`MenuCloseIcon`, `PlayPauseIcon` from sibling `.svelte` files, shared path constants from `icons/paths.ts`, and core `morphicons` types. `MorphIcon.svelte` is a single-file Svelte 5 component using `$props()`, `$effect()`, and `$derived()` to manage three rendering modes — empty, uncontrolled (reactive `icon` prop drives morphing), and controlled (`from`/`to`/`progress` drive a `seek`-based animation). It owns a `morphicons/dom` `Morph` instance created lazily via `ensureDriver` and destroyed on `onDestroy`. The `src/demo/` directory holds a SvelteKit demo app (Studio, CodePanel, CopyButton, etc.) kept outside `src/lib` so only the library code ships to consumers. Tests in `tests/` cover both browser and SSR scenarios via Vitest with jsdom. Build output goes through `vite build` plus `svelte-package`, producing dual exports for the root package and the standalone `MorphIcon.svelte` file.
