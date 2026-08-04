---
title: Data-Slot SASS Component Styling
description: Pattern for Svelte component libraries using data-slot attribute selectors, indented SASS, and two-layer CSS tokens — zero Tailwind, zero class merging.
tags: [svelte, sass, styling, data-slot, component-library, tokens]
sources: [2026-08-03-beui-svelte-orchestrate.md]
created: 2026-08-03
updated: 2026-08-03
type: concept
boss: svelte
project: fractal-svelte
---

A Svelte 5 component library styling contract that replaces Tailwind utility classes with colocated indented SASS, `data-slot` attribute selectors, and a two-layer CSS custom property token system.

## Contract

1. **`data-slot` is the ONLY styling hook** — no `class` attribute on component-owned elements, no `cn()`, no `clsx`. Every component element carries a `data-slot="name"` attribute. SASS targets `[data-slot="name"]`.

2. **Variants are typed props → `data-*` attributes** — a `variant: 'primary' | 'ghost'` prop renders as `data-variant="primary"`. SASS nests on `&[data-variant="primary"]`. No class-string arithmetic.

3. **Colocated `.svelte` + `.sass`** — each component has `component.svelte` (markup + runes) and `component.sass` (indented SASS). Zero `<style>` blocks in `.svelte` files.

4. **Two-layer CSS tokens** — primitives (`--beui-gray-900: #171717`) feed semantic tokens (`--foreground: var(--beui-gray-900)`). Components consume semantic tokens only. Light/dark themes switch semantic token mappings via `.dark` class.

5. **Indented SASS syntax** — single-tab indentation, no braces, no semicolons. Mixins use `=` prefix (not `@mixin`), includes use `+` (not `@include`).

6. **Consumers restyle through tokens** — CSS custom properties are the customization API. No class escape hatches.

## Why not Tailwind

- Eliminates `cn()` / `clsx` / `tailwind-merge` dependency chain
- `data-slot` selectors are self-documenting (element purpose is visible in DOM)
- Token system gives consumers a semantic customization surface without knowing internal class structure
- No build-time class scanning or content path configuration needed

## In practice

`@beui/svelte` (packages/fractal-svelte) ships 30+ components under this contract. Each component folder contains:

```
motion/button/
├── button.svelte     # markup + runes, imports './button.sass'
├── button.sass       # [data-slot="button"] styles
└── index.ts          # barrel re-export
```

All component SASS files are registered in `src/lib/styles/index.sass` via `@forward`.
