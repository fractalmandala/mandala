# Styles

Indented SASS, one file per component folder, keyed on `data-slot`.

## Contents

- Indented SASS discipline
- Never a style block
- data-slot selectors, nested variants
- Tokens only
- Use the mixins
- Shared prop mixins go LAST
- Central vs colocated
- Resolve --spacing and Tailwind-default tokens
- Dark mode is an ancestor selector
- Register the file

---

## Indented SASS discipline

`.sass` syntax: **single-tab** indentation, no braces, no semicolons. Not `.scss`, not `.css`.

**Incorrect:**

```scss
[data-slot='card'] {
	display: flex;
	background-color: var(--card);
}
```

**Correct:**

```sass
[data-slot='card']
	display: flex
	background-color: var(--card)
```

---

## Never a `<style>` block

Not in a component, not in a route, not in a docs page. Styles live in a `.sass` file. A demo page that needs scaffolding gets its own `.sass` imported from the layout.

---

## `data-slot` selectors, nested variants

One top-level rule per `data-slot`. Variants nest inside it.

**Correct:**

```sass
[data-slot='card']
	display: flex
	flex-direction: column
	background-color: var(--card)

	&[data-variant='outline']
		background-color: transparent
		border: 1px solid var(--border)

	&:hover
		@media (hover: hover)
			border-color: var(--muted-foreground)

[data-slot='card-header']
	display: flex
	padding: 1.5rem
```

`group-data-[x=y]:` in the source becomes an ancestor selector:

```sass
// group-data-[collapsible=icon]:w-8
[data-collapsible='icon'] &
	width: 2rem
```

Responsive variants use the breakpoint mixins, never a raw media query:

```sass
// md:flex
+bp-md
	display: flex
```

---

## Tokens only

Never a hardcoded colour, and never a raw hex. See [reference/tokens.md](../reference/tokens.md) for the full list.

**Incorrect:**

```sass
	background-color: #f5f5f5
	color: rgba(0, 0, 0, 0.6)
```

**Correct:**

```sass
	background-color: var(--muted)
	color: var(--muted-foreground)
```

Opacity variants use `color-mix`, matching what the oracle emits:

```sass
	background-color: color-mix(in oklab, var(--primary) 80%, transparent)
```

Drop the `@supports (color: color-mix(…))` fallbacks the oracle wraps these in. Our tokens are already `oklch()`, which has the same browser support — a browser that cannot do `color-mix` cannot render the theme at all, so the fallback is unreachable.

---

## Use the mixins

`_mixins.sass` covers the behaviour that repeats across every component. Do not re-declare it.

| Mixin                                                               | Replaces                                                                                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `+interactive($cursor)`                                             | `select-none cursor-*` `disabled:opacity-50` `disabled:pointer-events-none` `disabled:cursor-not-allowed` `data-disabled:opacity-50` |
| `+focus-ring($width, $color, $opacity)`                             | `outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`                                         |
| `+invalid-ring($width)`                                             | `aria-invalid:border-destructive aria-invalid:ring-destructive/20`                                                                   |
| `+icon-child($size)`                                                | `[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`                                                  |
| `+truncate`                                                         | `truncate`                                                                                                                           |
| `+radius($step)`                                                    | `rounded-sm/md/lg/xl`                                                                                                                |
| `+bp-sm … +bp-2xl`, `+bp-max-md`                                    | `sm: md: lg: xl: 2xl: max-md:`                                                                                                       |
| `+radius-variants` `+text-size-variants` `+text-transform-variants` | the shared prop enums                                                                                                                |

**Incorrect:**

```sass
[data-slot='button']
	cursor: pointer
	user-select: none
	&:disabled
		opacity: 0.5
		pointer-events: none
```

**Correct:**

```sass
[data-slot='button']
	+interactive(pointer)
```

Check the oracle for the _parameters_ — ring opacity varies by component (luma's button uses 30%, most others 50%). Don't assume the defaults.

Interactive controls that should feel like web controls take `+interactive(pointer)`. shadcn ships `cursor: default` on controls; we prefer pointer for buttons and links.

### `+interactive` is wrong for text-entry controls

It sets `user-select: none`, which stops the user selecting the text they just typed. Any control the user types into — `input`, `textarea`, `input-otp`, the editable part of a combobox — writes the disabled rules out instead.

**Incorrect:**

```sass
[data-slot='input']
	+interactive           # user-select: none — text can no longer be selected
```

**Correct:**

```sass
[data-slot='input']
	&:disabled
		pointer-events: none
		cursor: not-allowed
		opacity: 0.5
```

---

## Shared prop mixins go LAST

`size` usually sets `font-size`, and `textSize` has to beat it. Both are attribute selectors at identical specificity, so **source order decides**.

**Incorrect:**

```sass
[data-slot='button']
	+text-size-variants          # ← textSize declared first
	&[data-size='xs']
		font-size: 0.75rem       # ← wins, textSize silently does nothing
```

**Correct:**

```sass
[data-slot='button']
	&[data-size='xs']
		font-size: 0.75rem

	// Shared prop overrides last.
	+radius-variants
	+text-size-variants
	+text-transform-variants
```

---

## Central vs colocated

Measured across all 56 components, not decided by taste:

| Used by        | Goes in                                                            |
| -------------- | ------------------------------------------------------------------ |
| 5+ components  | `src/lib/styles/` (`_layouts` `_typography` `_globals` `_mixins`)  |
| 2–4 components | colocated by default; promote only when a third component wants it |
| 1 component    | colocated — `<name>.sass`                                          |

Do **not** add to the central files casually. If something belongs there it already appears in 5+ components; check before adding, and note any promotion in the ledger.

**Layout classes (`.box` / `.row`) are never used inside a component.** A button is _intrinsically_ a centred inline row — that belongs in `button.sass`, not in a class attribute the consumer could delete. `.box` / `.row` are for composition: blocks, demos, docs, app code.

---

## Resolve `--spacing` and Tailwind-default tokens

The oracle emits Tailwind's internal scale. Resolve it — we do not define `--spacing`.

| Oracle emits                                   | Write                                                        |
| ---------------------------------------------- | ------------------------------------------------------------ |
| `calc(var(--spacing) * 9)`                     | `2.25rem` (`--spacing` is `0.25rem`)                         |
| `var(--radius-2xl)`                            | `1rem` — a Tailwind default, **not** derived from `--radius` |
| `var(--radius-4xl)`                            | `2rem`                                                       |
| `var(--radius-md)`                             | `calc(var(--radius) - 2px)` — this one _is_ ours, keep it    |
| `var(--radius-3xl)`                            | `1.5rem` — Tailwind default                                  |
| `var(--text-sm)`                               | keep — defined in `_typography.sass`                         |
| `var(--font-weight-medium)`                    | `500`                                                        |
| `var(--font-sans)`                             | `inherit` — see the preflight note below                     |
| `var(--animate-spin)` / `var(--animate-pulse)` | inline the keyframes locally                                 |

Getting this wrong is silent: `var(--radius-2xl)` resolves to nothing and the corner is square.

### The preflight can fight the skin

`_reset.sass` gives `kbd`, `code`, `samp` and `pre` a monospace stack — that is Tailwind's own preflight, and it applies to _our_ components too. `kbd`'s skin asks for `--font-sans`, so without an explicit override the element default silently wins.

**Correct:**

```sass
[data-slot='kbd']
	// The reset makes kbd monospace; the design wants the body stack.
	font-family: inherit
```

Whenever the source sets a property the reset also sets on that element type — `font-family` on `kbd`/`code`, `resize` on `textarea`, `list-style` on `ul` — check which one wins.

### Component-scoped custom properties are public API

When a component defines a custom property that its own parts read, keep it. Do not inline the value.

**Incorrect:**

```sass
[data-slot='card']
	padding-block: 1.5rem
[data-slot='card-content']
	padding-inline: 1.5rem       # the relationship is now invisible
```

**Correct:**

```sass
[data-slot='card']
	--card-spacing: 1.5rem
	padding-block: var(--card-spacing)
	&[data-size='sm']
		--card-spacing: 1rem     # retunes every part at once

[data-slot='card-content']
	padding-inline: var(--card-spacing)
```

Consumers rely on these from outside — card's own examples use `margin-inline: calc(var(--card-spacing) * -1)` to bleed content to the card edge. Inlining the value silently removes a documented API. Document it in the page's Theming section.

### Contextual styling keys off an ancestor `data-slot`

Some components restyle themselves inside particular parents — `kbd` looks different inside`input-group` and `tooltip-content`. Port those rules **even when the ancestor is not ported yet**: the selector simply never matches, and it saves revisiting the component later.

```sass
[data-slot='kbd']
	background-color: var(--muted)

	[data-slot='input-group'] &
		background-color: var(--input)
```

---

## Dark mode is an ancestor selector

The oracle emits `&:is(.dark *)`.

**Correct:**

```sass
	&[data-variant='outline']
		background-color: var(--background)
		.dark &
			background-color: transparent
```

Most components need no dark rules at all — the tokens already switch. Only add one where the source genuinely diverges beyond token substitution.

---

## Register the file

`src/lib/styles/index.sass`:

```sass
@use '../components/skeleton/skeleton'
@use '../components/button/button'
@use '../components/card/card'
```

A component whose SASS is not registered compiles fine and renders unstyled — check this first when a ported component looks naked.
