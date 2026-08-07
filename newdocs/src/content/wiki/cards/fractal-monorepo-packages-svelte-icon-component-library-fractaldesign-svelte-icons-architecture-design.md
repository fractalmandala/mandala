---
title: Svelte Icon Component Library (@fractaldesign/svelte-icons) — Architecture Design
description: The package is a SvelteKit-based npm library (@fractaldesign/svelte-icons) built around three layers:
tags: [packages/svelte_icons]
type: card
module: packages/svelte_icons
path: packages/svelte_icons
created: 2026-08-05
updated: 2026-08-06
---

The package is a SvelteKit-based npm library (`@fractaldesign/svelte-icons` built around three layers:
- Runtime layer: `src/lib/Icon.svelte` is the sole runtime component, accepting an `icon: IconData` prop plus optional `size`, `title`, and `decorative` flags, and renders an `<svg>` with proper ARIA attributes. `src/lib/types.ts` defines the shared `IconData` interface (`name`, `set`, `viewBox`, `body`.
- Generated asset layer: `scripts/generate-icons.js` scans `src/lib/iconsets/<setName>/` for `.svg` files, strips the SVG wrapper, normalizes hardcoded black colors to `currentColor`, extracts viewBox, and writes one TypeScript module per icon under `src/lib/<setName>/<iconName>.ts` exporting a const `satisfies IconData` object. Each set also gets a barrel `src/lib/<setName>.ts` re-exporting all icons.
- Package surface: `src/lib/index.ts` re-exports the `Icon` component and the `IconData`/`IconSize` types. `package.json` declares ESM exports for `.`, `./Icon.svelte`, and a wildcard `.*` so consumers can import either the component or individual icon modules directly.

Dependency direction is strictly one-way: generated icon modules depend only on `types.ts`; `Icon.svelte` depends only on `types.ts`; nothing imports the generator script at runtime. The build pipeline runs `npm run generate` before `vite build` and `svelte-package` to ensure generated code is always in sync with source SVGs.
