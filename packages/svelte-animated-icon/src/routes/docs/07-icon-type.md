---
title: Icon Type
id: 7
group: customization
description: "Weights/variants (regular · light · fill · outline · solid) and icon sets (Phosphor, Remix, Flowbite, Hero, Ion)."
---

Two independent dimensions define what icon you're looking at: **variant** (the visual weight) and **library** (the source set).

## Variant

Most icon sets ship the same shape in multiple weights. The variant names differ per library:

```svelte
<script>
  import { Heart } from 'svelte-animated-icon/phosphor';
  import { Home } from 'svelte-animated-icon/remix';
</script>

<!-- Phosphor: regular, light, fill -->
<Heart variant="regular" template="draw" />
<Heart variant="light"   template="draw" />
<Heart variant="fill"    template="jelly" />

<!-- Remix: line, fill -->
<Home variant="line" template="draw" />
<Home variant="fill" template="jelly" />
```

Default is whatever the icon set defines - for Phosphor it's `regular`; for Remix, Flowbite, and Hero it's `outline` / `line`; for Ion it's `outline`.

### When to use which

- **line/outline/regular** - stroke-only silhouettes. Works well with draw, trace, and march templates.
- **light** (Phosphor only) - finer 12-unit stroke. Lighter weight at the same size.
- **fill/solid/filled** - solid silhouettes. Use when an icon needs to "land" at a small size or when you want a heavier visual mass. Works with wipe, rise, iris, stamp, and other fill-type templates.

Pairing the variant with the right template matters - see [Animation Type](/docs/06-animation-type) for the line-vs-fill guidance.

## Library

Each icon set lives behind its own subpath, so you only pay for what you import.

| Subpath | Source | Icons | Variants |
|---|---|---|---|
| `svelte-animated-icon/phosphor` | [phosphoricons.com](https://phosphoricons.com/) | ~1,500 | `regular`, `light`, `fill` |
| `svelte-animated-icon/remix` | [remixicon.com](https://remixicon.com/) | 1,441 | `line`, `fill` |
| `svelte-animated-icon/flowbite` | [flowbite.com/icons](https://flowbite.com/icons/) | 444 | `outline`, `solid` |
| `svelte-animated-icon/hero` | [heroicons.com](https://heroicons.com/) | 515 | `outline`, `solid` |
| `svelte-animated-icon/ion` | [ionic.io/ionicons](https://ionic.io/ionicons) | 324 | `outline`, `filled` |

Importing from a subpath keeps the *other* libraries' code out of your bundle entirely.

Two libraries can ship icons with the same PascalCase name. Importing under an alias is the cleanest way to use both at once:

```svelte
<script>
  import { Gear as PhosphorGear } from 'svelte-animated-icon/phosphor';
  import { Gear as RemixGear } from 'svelte-animated-icon/remix';
</script>

<PhosphorGear template="spin" />
<RemixGear template="jelly" />
```

See [Adding an Icon Library](/docs/25-adding-library) if you want to wire up another set.