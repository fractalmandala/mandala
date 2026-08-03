---
title: Typescript
id: 28
group: guides-and-advanced
description: "Typing templates/variants and the generated component props."
---

The package is written in TypeScript and ships its own types. Imports come with type information out of the box - no `@types/...` install required.

## The public types

```ts
import type {
  AnimatedIconProps,
  IconTemplate
} from 'svelte-animated-icon';
```

- **`AnimatedIconProps`** - the `Props` interface from the component, re-exported under a friendlier name. Use it to type component props, derive state types, or constrain a prop in a wrapper component.

  ```ts
  import type { AnimatedIconProps } from 'svelte-animated-icon';

  let size: AnimatedIconProps['size'] = $state(24);
  ```

- **`IconTemplate`** - the shape of a single template record: `{ id: string; label: string; for?: 'line' | 'fill'; run: (svg: SVGSVGElement) => Animation[] }`.

The runtime exports `TEMPLATES`, `TEMPLATE_IDS`, `getTemplate`, and `clearProps` are also fully typed.

## Per-icon component types

Each generated icon (e.g. `Gear.svelte`) declares:

```ts
interface Props {
  variant?: Variant;
  [key: string]: unknown;
}
```

`Variant` is `keyof typeof VARIANTS` - the exact union of variant ids that the codegen saw in the source folder. For Phosphor: `'regular' | 'light' | 'fill'`. For Remix: `'line' | 'fill'`.

The `[key: string]: unknown` index signature lets you pass anything `AnimatedIcon` accepts without per-prop re-declaration. TypeScript checks the *known* props strictly; unknown ones are still forwarded at runtime.

```svelte
<script lang="ts">
  import { Gear } from 'svelte-animated-icon/phosphor';

  // ✓ typed
  let v: 'regular' | 'light' | 'fill' = $state('regular');

  // ✓ typed via index signature
  let speed: number = $state(2);
</script>

<Gear variant={v} template="draw" {speed} />
```

## Typing a template picker

If you build a UI that lets users choose a template, narrow the string to one of the known ids:

```ts
import { TEMPLATE_IDS, type IconTemplate } from 'svelte-animated-icon';

type TemplateId = (typeof TEMPLATE_IDS)[number]; // 'draw' | 'cascade' | …

let current: TemplateId = $state(TEMPLATE_IDS[0]);
```

`TEMPLATE_IDS` is `string[]` at runtime but the *type* of each element is preserved via `as const` on the underlying array. The `typeof` trick keeps your picker in sync if you ever add or remove a template id.

## Typing a wrapper component

If you build a component that wraps an icon, you'll want a prop typed as "any icon component":

```svelte
<script lang="ts" generics="T extends typeof import('svelte-animated-icon/phosphor').Gear">
  import type { Component } from 'svelte';
  import { AnimatedIcon } from 'svelte-animated-icon';

  let {
    icon,
    ...rest
  }: {
    icon: Component<{ variant?: 'regular' | 'light' | 'fill' }>;
  } = $props();
</script>
```

Or, more pragmatically, accept the icon as a value and let Svelte's component type do the work:

```svelte
<script lang="ts">
  import type { Component } from 'svelte';
  import { Gear } from 'svelte-animated-icon/phosphor';

  let {
    icon = Gear,
    ...rest
  }: {
    icon?: Component<any>;
  } = $props();
</script>

{@const Icon = icon}
<Icon {...rest} />
```

The `Component<any>` is the loose form; tighten it as your surface grows.

## Typing custom SVG strings

`AnimatedIcon`'s `svg` prop is `string`. If you keep templates as constants and want type safety on the shape, narrow with a branded type:

```ts
type IconMarkup = string & { readonly __iconMarkup: unique symbol };

const TRIANGLE: IconMarkup = `<path d="M128 32 L224 224 L32 224 Z"/>` as IconMarkup;
```

Branded types are usually more friction than they're worth here - `string` is fine for nearly every case. Reach for branding only if you're shipping a library of custom icons and want to prevent the wrong string from being passed.

## Where types live in the package

| Path | Contains |
|---|---|
| `svelte-animated-icon` | `AnimatedIconProps`, `IconTemplate` |
| `svelte-animated-icon/phosphor` | Per-icon `Props` interfaces (auto-generated) |
| `svelte-animated-icon/remix` | Per-icon `Props` interfaces (auto-generated) |
| `svelte-animated-icon/flowbite` | Per-icon `Props` interfaces (auto-generated) |
| `svelte-animated-icon/hero` | Per-icon `Props` interfaces (auto-generated) |
| `svelte-animated-icon/ion` | Per-icon `Props` interfaces (auto-generated) |

The package's `exports` map points each subpath at its own `.d.ts`. Your editor should resolve types without configuration - if it doesn't, make sure your `tsconfig.json` includes `"moduleResolution": "Bundler"` or `"NodeNext"`.