---
title: Svelte Icon Component Library (@fractaldesign/svelte-icons) — Coding Conventions
description: - Each icon SVG becomes a standalone TypeScript module under src/lib/<set/<name.ts that exports a const object satisfying the IconData interface, never edited by hand (header comment marks them as ge…
tags: [packages/svelte_icons]
type: card
module: packages/svelte_icons
path: packages/svelte_icons
created: 2026-08-05
updated: 2026-08-06
---

- Each icon SVG becomes a standalone TypeScript module under `src/lib/<set>/<name>.ts` that exports a const object satisfying the `IconData` interface, never edited by hand (header comment marks them as generated).
- Every icon set has a sibling barrel file `<set>.ts` that re-exports all its icons using the pattern `export { default as <setName><PascalCaseIcon> } from './<set>/<icon-name>.js'`.
- Generated identifiers are derived by camelCasing the `<set>-<icon-name>` pair with leading digits prefixed by `icon`, ensuring valid JS identifiers across all icon names.
- SVG color normalization replaces hardcoded black variants (`#000`, `rgb(0,0,0)`, etc.) with `currentColor` so icons inherit CSS text color, and removes transparent background rects during stripping.
- The `Icon.svelte` component derives accessibility attributes (`aria-hidden`, `role`, `aria-labelledby` reactively from the `decorative` and `title` props using Svelte 5 `$derived` runes.
