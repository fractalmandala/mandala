# Props

Props are this library's **entire** customisation surface. There is no `class` merging, so a behaviour with no prop is a behaviour the consumer cannot reach.

## Contents

- Convert tv() to typed props
- Variants render as data attributes
- Use the shared vocabulary
- Invent props for anything the examples did with class
- Boolean props vs enums
- Optional props have no default
- Record every invented prop

---

## Convert `tv()` to typed props

Each variant axis becomes one prop with a literal union type and a default.

**Source:**

```ts
export const buttonVariants = tv({
	base: 'cn-button inline-flex shrink-0 items-center …',
	variants: {
		variant: { default: 'cn-button-variant-default', outline: 'cn-button-variant-outline' },
		size: { default: 'cn-button-size-default', sm: 'cn-button-size-sm' }
	},
	defaultVariants: { variant: 'default', size: 'default' }
});
```

**Correct:**

```svelte
<script lang="ts" module>
	export type ButtonVariant = 'default' | 'outline';
	export type ButtonSize = 'default' | 'sm';

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> & {
		variant?: ButtonVariant;
		size?: ButtonSize;
	};
</script>

<script lang="ts">
	let { variant = 'default', size = 'default', ...restProps }: ButtonProps = $props();
</script>
```

Export the variant types from `index.ts` — consumers type their own wrappers with them.

**Do not export a `buttonVariants` helper.** It exists upstream to hand a class string to other components. There are no class strings. A component that wants to look like a button renders a `<Button>`, or sets `data-slot="button"` with the variant attributes itself.

---

## Variants render as data attributes

**Incorrect:**

```svelte
<button class={buttonVariants({ variant, size })}>
```

**Correct:**

```svelte
<button data-slot="button" data-variant={variant} data-size={size}>
```

The SASS then nests: `&[data-variant='outline']`. An `undefined` prop renders no attribute at all, which is exactly what you want for optional overrides.

---

## Use the shared vocabulary

`$lib/types.js` defines the cross-library enums. Never invent a per-component radius scale.

| Type            | Values                                | Mixin                      |
| --------------- | ------------------------------------- | -------------------------- |
| `Radius`        | `none sm md lg xl 2xl full`           | `+radius-variants`         |
| `TextSize`      | `xs sm base lg`                       | `+text-size-variants`      |
| `TextTransform` | `none uppercase lowercase capitalize` | `+text-transform-variants` |

**Incorrect:**

```svelte
export type CardRadius = "small" | "large" | "round";
```

**Correct:**

```svelte
import type { Radius } from "$lib/types.js";

export type CardProps = … & { radius?: Radius };
```

Always pair the type with its mixin — the prop does nothing without the matching SASS.

If a component genuinely needs a value the shared enum lacks, extend `$lib/types.ts` so every component gains it, rather than defining a local variant. Note it in the ledger.

---

## Invent props for anything the examples did with `class`

This is the single most common porting failure. Read `shadcn-registry/docs/lib/registry/examples/<name>-*.svelte` **before** writing props.

**Source examples:**

```svelte
<Skeleton class="size-12 rounded-full" />
<Skeleton class="h-4 w-[250px]" />
```

Upstream `Skeleton` has zero props. Ported literally it cannot express a size — every real use of it is broken.

**Correct:**

```svelte
let {
  width,
  height,
  size,      // shorthand for equal width/height
  radius,
  ...restProps
}: SkeletonProps & {
  width?: string;
  height?: string;
  size?: string;
  radius?: Radius;
} = $props();
```

Rules of thumb for what deserves a prop:

- **Geometry the component cannot know** (a skeleton's dimensions) → always a prop.
- **A shape or casing the examples demonstrate** (`rounded-full`) → use the shared enum.
- **A one-off margin in a demo** (`class="mt-4"`) → not a prop. That is the consumer's layout, and `class` still passes through `restProps`.

When unsure: if the docs page would need it to show a documented example, it is a prop.

### The skin itself can depend on a consumer class

Watch for `&:is(.border-b)` and similar in oracle output — the skin styling a class the _consumer_ passes. `card-header` does this: `border-b` adds a divider **and** the matching bottom padding, so it cannot be replicated by the consumer just setting a border.

**Correct:**

```svelte
let { bordered = false, ...restProps } = $props();

<div data-slot="card-header" data-bordered={bordered || undefined} {...restProps}>
```

```sass
[data-slot='card-header']
	&[data-bordered]
		padding-bottom: var(--card-spacing)
		border-bottom: 1px solid var(--border)
```

Grep the oracle output for `:is(.` before writing props — every hit is a class-based API that needs converting.

---

## Boolean props vs enums

A two-state axis is a boolean; three or more is an enum.

**Incorrect:**

```svelte
export type SpinnerState = "spinning" | "not-spinning";
```

**Correct:**

```svelte
let { loading = false }: { loading?: boolean } = $props();

<div data-slot="spinner" data-loading={loading || undefined}>
```

`data-loading={loading || undefined}` renders the attribute only when true, so the SASS can use `&[data-loading]` without a value comparison.

---

## Optional props have no default

An override prop must be distinguishable from "not set", so the theme default can win.

**Incorrect:**

```svelte
let {(radius = 'md')}: Props = $props();
```

This forces `md` on every instance and the component's own base radius can never apply.

**Correct:**

```svelte
let {radius}: Props = $props();
```

`radius` is `undefined` → no `data-radius` attribute → the base rule in the SASS applies.

Props that name a _required_ axis (`variant`, `size`) do get defaults. Props that _override_ a base style (`radius`, `textSize` `textTransform`) do not.

---

## Record every invented prop

In `ports/<name>.json` under `propsInvented`, with what it replaces:

```json
{
	"name": "radius",
	"why": "Every documented use sets a shape through class; with no class merging the component cannot express one.",
	"replaces": "class=\"rounded-full\""
}
```

This is internal bookkeeping. It never appears in the documentation.
