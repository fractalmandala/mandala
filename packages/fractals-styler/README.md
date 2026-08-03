# fractals-styler

JIT numeric utility classes, breakpoint-suffixed variants, and a themeable SASS token system — drop into any SvelteKit (or other Vite) + SASS project.

## Install

```sh
pnpm add fractals-styler
```

## 1. Scaffold the static SASS files

```sh
npx fractals-styler init            # writes to src/lib/styles by default
npx fractals-styler init src/styles # or a custom destination
```

This copies into your project (they become **yours** to edit/theme — not synced from `node_modules`):

- `_tokens.sass` — default CSS custom properties
- `_typography.sass` — `--text-*` scale + `.text-*`, `.tt-*`, `.w*`, `.bold`, `.lh*`
- `_globals.sass` — box-sizing reset, `button.blank`, heading margin reset, `.bdr`
- `_primitives.sass` — `.box`, `.row`, `.grid` flex/grid layout primitives
- `_mixins.sass` — `+bp-xs` / `+bp-sm` / `+bp-bs` / `+bp-lg` / `+bp-xl` mixins, an escape hatch for breakpoint-scoping your **own** custom classes
- `index.sass` — `@use`s the four files above, in order

Import once, globally (e.g. root `+layout.svelte`):

```sass
@import '$lib/styles/index.sass'
```

## 2. Add the Vite plugin

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import fractalsStyler from 'fractals-styler';

export default {
	plugins: [sveltekit(), fractalsStyler()]
	// fractalsStyler({ content: ['src/**/*.{svelte,html,js,ts,jsx,tsx}'] }) to customize globs
};
```

Import the generated stylesheet once, globally:

```ts
import 'virtual:fractals-styler.css';
```

The plugin scans your source files at dev/build time for utility classes actually used, and generates **only those** as plain CSS — true JIT, any arbitrary integer, no class list to maintain. In dev, editing a `.svelte`/`.ts`/`.html` file triggers a full reload that picks up newly-used classes.

## Utility classes

Any `{prefix}{N}` for any non-negative integer `N`:

| Class | CSS |
|---|---|
| `.gapN` | `gap: Npx` |
| `.cgapN` | `column-gap: Npx` |
| `.rgapN` | `row-gap: Npx` |
| `.padN` | `padding: Npx` |
| `.padtopN` | `padding-top: Npx` |
| `.padbotN` | `padding-bottom: Npx` |
| `.padleftN` | `padding-left: Npx` |
| `.padrightN` | `padding-right: Npx` |
| `.marginN` | `margin: Npx` |
| `.margintopN` | `margin-top: Npx` |
| `.marginbotN` | `margin-bottom: Npx` |
| `.marginleftN` | `margin-left: Npx` |
| `.marginrightN` | `margin-right: Npx` |
| `.heightN` | `height: Npx` |
| `.widthN` | `width: Npx` |

e.g. `class="gap1 pad24 margintop128"`.

## Dynamic `--pxN` variables

Use `var(--pxN)` anywhere (inline styles, your own SASS) for any integer `N` — the plugin scans for `--px(\d+)` usage and emits `:root { --pxN: Npx; }` for every one found:

```svelte
<div style="padding: var(--px24); gap: var(--px8)">
```

## Breakpoint suffixes

Append `-xs` / `-sm` / `-bs` / `-lg` / `-xl` to **any class this package defines** (the numeric utilities above, plus `.box`, `.row`, `.grid`, `.bdr`, and every `_typography.sass` class) to scope it to a breakpoint:

| Suffix | Media query |
|---|---|
| `-xs` | `(max-width: 720px)` |
| `-sm` | `(max-width: 1024px)` |
| `-bs` | `(min-width: 721px)` |
| `-lg` | `(min-width: 1025px)` |
| `-xl` | `(min-width: 1201px)` |

e.g. `class="pad24-xs box-lg text-lg-sm"`.

This only works for classes whose declarations the JIT engine knows statically (its own registry) — it can't introspect arbitrary third-party or component-scoped CSS. For your **own** custom classes, use the `_mixins.sass` escape hatch instead:

```sass
.card
	padding: 8px
	+bp-sm
		padding: 4px
```

> Note: primitive *modifiers* (`.box.xcenter`, `.row.xbetween`, `.grid.grid-cols-3`, ...) are compound selectors, not flat declarations, so they aren't part of the breakpoint-suffix system — combine the unsuffixed base class with the modifier as usual, or use `+bp-*` directly in your component.

## Theming

`_tokens.sass` ships sensible defaults for `--text-primary`, `--text-secondary`, `--text-tertiary`, `--background10..50`, `--foreground10..50`, `--color10..30`, `--border-primary`, `--border-secondary`, `--border-tertiary`. Override under `:root` for a global change, or under any class to scope a theme:

```sass
.theme-dark
	--background10: #0b0b0b
	--foreground10: #f5f5f5
```

```svelte
<div class="theme-dark">...</div>
```
