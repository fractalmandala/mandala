# Indented SASS traps & patterns (learned from real ports)

## Trap 1 — SASS evaluates `min()` / `max()` / `clamp()` as its own math functions

`border-radius: min(var(--radius-md), 8px)` compiles to broken CSS (`var(--radius - md)`).
Fix with interpolation:

```sass
border-radius: #{"min(var(--radius-md), 8px)"}
// or
border-radius: unquote("min(var(--radius-md), 8px)")
```

## Trap 2 — adjacent compound selectors are invalid

`> *svg` or `> *a:hover` (from mistranslating `[&>svg]`) emits a deprecation warning and broken CSS.
Write the element directly:

```sass
.cn-alert > svg
	margin-right: calc(var(--spacing) * 2)
```

`> *[data-slot="x"]` IS valid (universal + attribute). Only `*element` combos are broken.

## Trap 3 — Svelte scoped styles don't reach bits-ui internals

Bits-ui renders portal content (Dialog.Content, Popover.Content, Select.Content) outside the component's DOM subtree. Scoped `<style lang="sass">` in the wrapper won't apply. Two working patterns:

```sass
// 1. Global class, styled in src/lib/styles/_components.sass (fractals-ui convention)
.cn-dialog-content
	position: fixed
	&[data-state="open"]
		animation: cn-fade-in 150ms
```

```sass
// 2. :global in scoped block
<style lang="sass">
	:global(.cn-select-content)
		z-index: 50
		:global(&[data-state="closed"])
			animation: cn-fade-out 100ms
</style>
```

## Trap 4 — custom property names with `-` inside values

When a var name could be misread as subtraction (e.g. after min/max misparsing), grep the emitted CSS: `var(--radius - md)` means the source needs interpolation. Plain `var(--radius-md)` in normal declarations is fine.

## Animations (tw-animate-css replacements)

Reimplement as keyframes in the global SASS or scoped block:

```sass
@keyframes cn-fade-in
	from
		opacity: 0
	to
		opacity: 1

@keyframes cn-zoom-in
	from
		opacity: 0
		transform: translate(-50%, -50%) scale(0.95)
	to
		opacity: 1
		transform: translate(-50%, -50%) scale(1)

@keyframes cn-accordion-down
	from
		height: 0
	to
		height: var(--bits-accordion-content-height)
```

bits-ui exposes `--bits-accordion-content-height`, `--bits-collapsible-content-height` etc. for height animations — use them instead of the old `--radix-*` vars.

Pair with state selectors:

```sass
.cn-dialog-content
	&[data-state="open"]
		animation: cn-fade-in 150ms ease-out, cn-zoom-in 150ms ease-out
	&[data-state="closed"]
		animation: cn-fade-out 100ms ease-in
```

## File conventions (fractals-ui)

- `_tokens.sass` — `:root` custom properties only (`--spacing: 0.25rem`, shadcn theme tokens in oklch).
- `_components.sass` — one `.cn-<component>` block tree per component; variants as `.cn-button-variant-default`, sizes as `.cn-button-size-sm`.
- `_utilities.sass` — small shared helpers.
- Component `index.ts`: `export { default as Button } from "./button.svelte"` shape; also export variant types where upstream does.
- `cn()` in `$lib/utils`: `import { clsx, type ClassValue } from "clsx"; export const cn = (...inputs: ClassValue[]) => clsx(inputs)`.
