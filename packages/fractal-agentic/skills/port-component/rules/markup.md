# Markup

How a ported `.svelte` file is written.

## Contents

- No class attribute — data-slot is the hook
- No cn(), clsx, tailwind-merge
- Svelte 5 runes only
- $derived takes an expression, not a function
- ref is $bindable
- Icons are children, not imports
- Multi-part components keep the barrel
- The child snippet escape hatch
- restProps goes last

---

## No class attribute — `data-slot` is the styling hook

shadcn puts a class string on every element. We put `data-slot`, and the SASS keys off it. This is why the component needs no class merging: there is no class to merge.

**Incorrect:**

```svelte
<div class={cn("cn-card flex flex-col gap-6 rounded-xl border py-6", className)} {...restProps}>
```

**Correct:**

```svelte
<div data-slot="card" {...restProps}>
```

`data-slot` names come straight from the source — keep them verbatim. Where the source has no `data-slot`, use the component name (`card`) or `component-part` (`card-header`).

Some components let a caller **override** `data-slot` — `input` does, so `InputGroup` can restyle it. Keep that: since `data-slot` is our styling hook, overriding it deliberately opts the element out of `[data-slot='input']`, which is exactly the wrapper's intent.

```svelte
let { "data-slot": dataSlot = "input", ...restProps } = $props();

<input data-slot={dataSlot} {...restProps} />
```

A consumer's `class` still reaches the element through `restProps`, so it remains an escape hatch. It is simply not merged or de-duplicated.

---

## No `cn()`, `clsx`, `tailwind-merge`, `tailwind-variants`

These are the Tailwind coupling the library exists to remove. `$lib/utils.js` exports **types only** — `WithElementRef`, `WithoutChildren`, `WithoutChild`, `WithoutChildrenOrChild`.

**Incorrect:**

```svelte
import { cn, type WithElementRef } from "$lib/utils.js";
import { tv } from "tailwind-variants";
```

**Correct:**

```svelte
import type {WithElementRef} from "$lib/utils.js";
```

---

## Svelte 5 runes only

No `$:`, no `svelte/store`, no `export let`.

**Incorrect:**

```svelte
<script>
	export let variant = 'default';
	$: classes = variant === 'outline' ? 'border' : '';
</script>
```

**Correct:**

```svelte
<script lang="ts">
	let { variant = 'default', ...restProps }: CardProps = $props();
</script>
```

---

## `$derived` takes an expression, not a function

**Incorrect:**

```svelte
const label = $derived(() => `${count} items`);
```

**Correct:**

```svelte
const label = $derived(`${count} items`);
```

Use `$derived.by(() => { … })` only when you genuinely need a multi-statement body.

---

## `ref` is `$bindable(null)`

Every component exposes its root element so consumers can measure or focus it.

**Incorrect:**

```svelte
let {(ref = null)}: Props = $props();
```

**Correct:**

```svelte
let { ref = $bindable(null), ...restProps }: Props = $props();

<div bind:this={ref} data-slot="card" {...restProps}>
```

The type comes from `WithElementRef<HTMLAttributes<HTMLDivElement>>`, which adds
`ref?: HTMLElement | null`.

---

## Icons are children, never imports

The library ships **no icon dependency**. shadcn's registry imports `@lucide/svelte`; we do not. Icon sizing and spacing are handled by the component's SASS (`+icon-child`), so the consumer passes whatever icon library they use.

**Incorrect:**

```svelte
<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
</script>

<button data-slot="accordion-trigger">
	{@render children?.()}
	<ChevronDown />
</button>
```

**Correct:**

```svelte
<script lang="ts">
	let { children, icon, ...restProps }: Props = $props();
</script>

<button data-slot="accordion-trigger" {...restProps}>
	{@render children?.()}
	{#if icon}
		<span data-slot="accordion-trigger-icon">{@render icon()}</span>
	{/if}
</button>
```

When the source component _requires_ a decorative icon (a chevron, a check), give it a `Snippet` prop with a sensible inline-SVG default rather than importing a library. Record the prop in the ledger.

### Exception: components that ARE an icon

`Spinner` is the clear case — there is no meaningful spinner without artwork, and the source only delegates to whichever icon library the project configured. Ship the SVG inline and give it a `size` prop.

```svelte
<svg
	data-slot="spinner"
	role="status"
	aria-label="Loading"
	viewBox="0 0 24 24"
	style={size ? `width:${size};height:${size}` : undefined}
	{...restProps}
>
	<path d="M21 12a9 9 0 1 1-6.219-8.56" />
</svg>
```

An inline-SVG component also needs `ref?: SVGSVGElement | null` — `WithElementRef` defaults to `HTMLElement`, which does not match an `<svg>`.

Anything that continuously animates gets a `prefers-reduced-motion` rule. Slow it rather than stopping it — a frozen spinner reads as a broken one.

---

## Multi-part components keep the folder and barrel

`accordion`, `card`, `dialog` and friends ship several files plus an `index.ts`. Keep that
shape — consumers do `import * as Card from "fractalsvelte/card"`.

```
src/lib/components/card/
	card.svelte
	card-header.svelte
	card-title.svelte
	card.sass            ← ONE stylesheet for the whole component
	index.ts
```

`index.ts` mirrors the source's exports:

```ts
import Root from './card.svelte';
import Header from './card-header.svelte';
import Title from './card-title.svelte';

export {
	Root,
	Header,
	Title,
	//
	Root as Card,
	Header as CardHeader,
	Title as CardTitle
};
```

**One `.sass` file per component folder**, not per part. All parts key off `data-slot`, so they belong in one stylesheet.

---

## The `child` snippet escape hatch

Several shadcn components accept a `child` snippet so a consumer can render a different element with the component's props applied. Preserve it — with `mergedProps` built as an object rather than a class string.

**Correct:**

```svelte
<script lang="ts">
	let { child, children, ref = $bindable(null), ...restProps }: Props = $props();

	const mergedProps = $derived({
		'data-slot': 'menu-action',
		...restProps
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<button bind:this={ref} {...mergedProps}>
		{@render children?.()}
	</button>
{/if}
```

---

## `restProps` goes last

So consumers can override anything, including `data-*` attributes.

**Incorrect:**

```svelte
<div {...restProps} data-slot="card" data-variant={variant}>
```

**Correct:**

```svelte
<div data-slot="card" data-variant={variant} {...restProps}>
```
