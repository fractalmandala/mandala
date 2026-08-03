---
title: Usage
id: 4
group: getting started
description: "The two ways to use the library - per-icon components vs the AnimatedIcon core - and the shared prop set."
---

There are two ways to consume `svelte-animated-icon`. Pick whichever fits the moment.

## Option A: Per-icon components (the common case)

Import a single named component from a subpath and use it directly:

```svelte
<script>
  import { Gear, Heart, ArrowRight } from 'svelte-animated-icon/phosphor';
</script>

<Gear template="spin" size={24} />
<Heart template="jelly" size={32} variant="fill" />
<ArrowRight template="draw" size={20} />
```

Every per-icon component accepts the **same prop set** as the core (plus a `variant` prop to switch weights). See [Icon Components](/docs/15-icon-components) for the full list.

### When to use this

- You want one specific icon and don't need to construct the SVG yourself.
- You care about the smallest bundle (only the icon you import ships).
- You're building standard UI: buttons, nav bars, toolbars, list rows.

## Option B: The `AnimatedIcon` core

Import the engine directly and pass your own SVG string. Useful when you've drawn a custom shape, or when icons come from a source the library doesn't yet ship (yet).

```svelte
<script>
  import { AnimatedIcon } from 'svelte-animated-icon';
</script>

<AnimatedIcon
  svg={`<circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-width="16"/>`}
  template="spin"
  size={48}
/>
```

The `svg` prop is the **inner** markup - no `<svg>` wrapper, no bounding `<rect fill="none">`. The component renders the surrounding SVG with a fixed `viewBox="0 0 256 256"` so templates can do their geometry tricks.

### When to use this

- You have an icon that isn't in any shipped library.
- You want one animation template to drive many distinct shapes.
- You're prototyping animation behavior before committing to a real icon.

## Shared props

Both APIs accept the same animation control surface:

| Prop | Type | Default | What it does |
|---|---|---|---|
| `template` | `string` | `'draw'` | One of the template ids - see [Templates Catalog](/docs/16-templates-catalog) |
| `size` | `number` | `24` | Pixel size of the rendered icon |
| `trigger` | `'hover' \| 'mount' \| 'controlled'` | `'hover'` | When the animation fires |
| `active` | `boolean` | `false` | Drives animation when `trigger="controlled"` |
| `loop` | `boolean` | `false` | Repeat the template forever |
| `speed` | `number` | `1` | Duration/delay multiplier (`2` = twice as fast) |
| `easing` | `string \| null` | `null` | Override the template's easing; `null` keeps its own |
| `class` | `string` | `''` | Extra class on the wrapper |

Per-icon components additionally accept `variant` — valid values differ per library (e.g. `'regular' | 'light' | 'fill'` for Phosphor, `'line' | 'fill'` for Remix, `'outline' | 'solid'` for Flowbite/Hero, `'outline' | 'filled'` for Ion). See [Icon Type](/docs/07-icon-type).

## Mixing the two

The two patterns compose freely. You can use per-icon components everywhere, drop down to `AnimatedIcon` for one-off custom shapes, and import types from the same root:

```svelte
<script>
  import { AnimatedIcon, TEMPLATE_IDS, type AnimatedIconProps } from 'svelte-animated-icon';
  import { Gear } from 'svelte-animated-icon/phosphor';

  let size: AnimatedIconProps['size'] = $state(24);
</script>

<Gear {size} template="spin" />
<AnimatedIcon svg={myCustomSvg} template={TEMPLATE_IDS[2]} {size} />
```

## Next

- **[AnimatedIcon](/docs/14-animated-icon)** - full prop table and exported methods.
- **[Icon Components](/docs/15-icon-components)** - how the generated wrappers are built.