---
title: Core Exports and Types
id: 18
group: api-reference
description: "TEMPLATES, getTemplate, exported types, and the svelte-animated-icon (core) entry point."
---

Everything reachable from the package root (`svelte-animated-icon`).

## Component

```ts
import { AnimatedIcon } from 'svelte-animated-icon';
```

The shared animation engine. See [AnimatedIcon](/docs/14-animated-icon) for the full prop table.

```ts
import type { AnimatedIconProps } from 'svelte-animated-icon';
```

The `Props` interface from the component's `<script module>` block, re-exported as `AnimatedIconProps`.

## Templates

```ts
import { TEMPLATES, TEMPLATE_IDS, getTemplate } from 'svelte-animated-icon';
```

### `TEMPLATES: IconTemplate[]`

The full ordered list of template records. Each entry is:

```ts
interface IconTemplate {
  id: string;
  label: string;
  /** Which weight this suits. Omit = works on both. 'line' needs a stroke; 'fill' suits solid shapes. */
  for?: 'line' | 'fill';
  run: (svg: SVGSVGElement) => Animation[];
}
```

### `TEMPLATE_IDS: string[]`

A flat array of every `id` in `TEMPLATES`, in the same order. Convenient for `<select>`-based template pickers - see [Templates Catalog](/docs/16-templates-catalog) for an example.

### `getTemplate(id: string): IconTemplate`

Look up a template by id. Returns the record or `undefined` if no template matches.

```ts
import { getTemplate } from 'svelte-animated-icon';

const t = getTemplate('spin');
t?.run(svgEl); // → Animation[]
```

Use this when you want to drive a template directly without the component - for example, to animate a non-icon SVG inside a larger animation system.

## Reset helper

```ts
import { clearProps } from 'svelte-animated-icon';
```

`clearProps(svg: SVGSVGElement): void` strips the inline styles a template set (`stroke-dasharray`, `stroke-dashoffset`, `opacity`, `transform`, `transform-box`, `transform-origin`, `fill`, `fill-opacity`) plus the `pathLength` attribute, returning the icon to its rest state. The component calls it for you inside `stopAnimation()`; reach for it directly only when you're driving templates yourself.

## Types

```ts
import type { IconTemplate } from 'svelte-animated-icon';
```

The shape of a template record - see `TEMPLATES` above.

## What's **not** exported

- **Per-icon components** - those live behind the library subpaths. Import `Gear` from `svelte-animated-icon/phosphor`, never from the root.
- **`startAnimation` / `stopAnimation`** - those are component instance methods. Reach them via `bind:this`. See [Imperative Control](/docs/17-imperative-control).
- **WAAPI patches** - `loop`, `speed`, and `easing` overrides happen inside the component. If you want that level of control, call `getTemplate(id).run(svg)` yourself and manage the resulting `Animation[]`.

## Entry point map

| Subpath | What you get |
|---|---|
| `svelte-animated-icon` | `AnimatedIcon`, `TEMPLATES`, `TEMPLATE_IDS`, `getTemplate`, `clearProps`, types |
| `svelte-animated-icon/phosphor` | ~1,500 generated Phosphor icon components |
| `svelte-animated-icon/remix` | 1,441 generated Remix icon components |
| `svelte-animated-icon/flowbite` | 444 generated Flowbite icon components |
| `svelte-animated-icon/hero` | 515 generated Hero icon components |
| `svelte-animated-icon/ion` | 324 generated Ionicons icon components |

See [Tree Shaking](/docs/24-tree-shaking) for how the bundler uses this map to keep your output small.