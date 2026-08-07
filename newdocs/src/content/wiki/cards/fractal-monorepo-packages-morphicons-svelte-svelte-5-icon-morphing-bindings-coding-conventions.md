---
title: morphicons-svelte — Svelte 5 Icon Morphing Bindings — Coding Conventions
description: - Public APIs are re-exported through a single barrel index.ts that forwards both default components and their corresponding Props TypeScript types from the source .svelte files.
tags: [packages/morphicons_svelte]
type: card
module: packages/morphicons_svelte
path: packages/morphicons_svelte
created: 2026-08-05
updated: 2026-08-06
---

- Public APIs are re-exported through a single barrel `index.ts` that forwards both default components and their corresponding `*Props` TypeScript types from the source `.svelte` files.
- Each icon pair is implemented as a dedicated `.svelte` component under `src/lib/icons/` and re-exported alongside its props type from the package root.
- Component state uses Svelte 5 runes exclusively: `$props()` for input, `$effect()` for side effects tied to reactive props, and `$derived()` for computed values like `renderedStrokeWidth`.
- Browser-only resources (the `morphicons/dom` `Morph` instance) are allocated lazily on first use and explicitly destroyed in an `onDestroy` hook to avoid memory leaks.
- Tests are split into browser tests (`.browser.test.ts` and SSR tests (`.ssr.test.ts` under `tests/`, all run by Vitest with jsdom, and share a `MorphIconHarness.svelte` helper for mounting the component in tests.
