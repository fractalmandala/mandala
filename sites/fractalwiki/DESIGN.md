# Design

1. All styling is in single-tab indented SASS, without curly braces and semi-colons.

Inside `src/lib/styles`:

```
src/lib/styles/
├── _tokens.sass
├── _typography.sass
├── _globals.sass
├── _primitives.sass
├── _mixins.sass
└── index.sass
```

2. We have `fractals-styler` installed. 

## Common usage patterns

**Arbitrary spacing, no class list to maintain:**

```svelte
<div class="pad7 margintop3 gap19 width240 height88">
```

**Responsive variant of a utility (breakpoint suffix):**

```svelte
<div class="pad32 pad8-xs box-lg row-sm">
```

`pad8-xs` only applies the `8px` padding at `≤720px`; outside that range `pad32` (unsuffixed) still applies normally since CSS specificity/order isn't in play — both are separate classes, so combine them deliberately if you want a mobile override:

```svelte
<div class="pad32 pad8-xs">
```

At `≤720px` both rules apply; since `pad8-xs` is declared after the base utilities in the generated stylesheet, it wins. (If you need to be certain about ordering, check the generated `virtual:fractals-styler.css` in your dev tools — base rules first, then breakpoint blocks in `xs, sm, bs, lg, xl` order.)

**Dynamic `--pxN` variables in inline styles or your own SASS:**

```svelte
<div style="gap: var(--px12); padding: var(--px3) var(--px24)">
```

```sass
.card
	gap: var(--px12)
```

**Theming with the token system:**

```sass
// src/lib/styles/_tokens.sass — edit defaults
:root
	--background10: #ffffff
	--foreground10: #111111

// add a scoped theme anywhere in your sass
.theme-dark
	--background10: #0b0b0b
	--foreground10: #f5f5f5
```

```svelte
<div class="theme-dark box pad24" style="background: var(--background10); color: var(--foreground10)">
```

**Breakpoint-scoping your own custom classes** (the JIT can't introspect classes it didn't define — use the mixin instead):

```sass
@use '../lib/styles/mixins' as bp

.hero
	padding: 64px
	+bp.bp-sm
		padding: 24px
```

(Adjust the relative `@use` path to wherever you scaffolded `_mixins.sass`.)

---

## Troubleshooting

**`virtual:fractals-styler.css` 404s / "Failed to resolve import"**
Make sure `fractalsStyler()` is in your `vite.config.ts` plugins array — the virtual module only resolves while the plugin is active.

**New classes I just typed aren't showing up in dev**
The plugin reloads on file save; if you're seeing stale CSS, check that the file you're editing matches the `content` globs passed to `fractalsStyler()` (default: `src/**/*.{svelte,html,js,ts,jsx,tsx,mjs}`).

**A class like `card-sm` does nothing**
Breakpoint suffixes only resolve against classes the package itself defines (the numeric utilities, `.box`/`.row`/`.grid`/`.bdr`, and the `_typography.sass` classes). For your own classes, use the `_mixins.sass` `+bp-*` mixins instead — see above.

**Sass build errors after `init`**
Confirm `sass` is installed (`pnpm add -D sass`) and that your `@import`/`@use` path in the layout points at wherever you ran `init` (default `$lib/styles/index.sass`).

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
