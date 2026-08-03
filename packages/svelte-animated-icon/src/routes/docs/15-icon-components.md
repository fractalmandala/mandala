---
title: Icon Components
id: 15
group: api-reference
description: "The props every generated per-icon component accepts (and how variant selects the embedded SVG)."
---

Every generated icon (`Gear`, `Heart`, `ArrowRight`, …) is a thin Svelte component that embeds its variant SVGs and forwards the rest to `AnimatedIcon`.

## What a generated component looks like

```svelte
<!-- src/lib/phosphor/icons/Acorn.svelte (auto-generated) -->
<script lang="ts">
  import AnimatedIcon from '../../core/AnimatedIcon.svelte';

  const VARIANTS: Record<string, string> = {
    regular: `<g fill="currentColor"><path d="M216,112v16c0,53-88,88-88,112…" fill="none" stroke="currentColor" …/></g>`,
    light:   `<g fill="currentColor"><path d="…" stroke-width="12"/></g>`,
    fill:    `<g fill="currentColor"><path d="M232,104a56.06,56.06,0,0,0-56-56…"/></g>`
  };

  interface Props {
    variant?: string;
    [key: string]: unknown;
  }

  let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant]} {...rest} />
```

You don't write these by hand. The codegen pipeline produces them - see [Codegen Pipeline](/docs/26-codegen-pipeline) for how.

## Props

A per-icon component exposes everything `AnimatedIcon` does, plus the `variant` prop.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `string` | set per library | Phosphor: `'regular' \| 'light' \| 'fill'`. Remix: `'line' \| 'fill'`. Flowbite/Hero: `'outline' \| 'solid'`. Ion: `'outline' \| 'filled'`. |
| `template` | `string` | `'draw'` | Forwarded to `AnimatedIcon`. |
| `size` | `number` | `24` | Forwarded. |
| `trigger` | `'hover' \| 'mount' \| 'controlled'` | `'hover'` | Forwarded. |
| `active` | `boolean` | `false` | Forwarded. |
| `loop` | `boolean` | `false` | Forwarded. |
| `speed` | `number` | `1` | Forwarded. |
| `easing` | `string \| null` | `null` | Forwarded. |
| `class` | `string` | `''` | Forwarded. |

Because `...rest` flows straight through, anything you can do with `AnimatedIcon` you can do with a per-icon component.

## How `variant` selects the SVG

The codegen embeds all variants as raw markup strings in a `VARIANTS` object. Selecting one is just an object lookup:

```ts
VARIANTS[variant] // → string of inner SVG markup
```

No fetches, no dynamic imports, no runtime cost. Switching variants is free.

## Why pass-through is the right pattern

If you ever need a prop a per-icon component doesn't expose (for example, a custom field for analytics or a test hook), the `[key: string]: unknown` index signature in `Props` lets you pass arbitrary attributes straight through to `AnimatedIcon`'s wrapper. For anything beyond that, drop down to `AnimatedIcon` directly with your own SVG.

## Generated vs. handwritten

The component files in `src/lib/phosphor/icons/`, `src/lib/remix/icons/`, `src/lib/flowbite/icons/`, `src/lib/hero/icons/`, and `src/lib/ion/icons/` are overwritten by the codegen script. Don't hand-edit them - your changes will be lost on the next `node scripts/generate.js`. To customize one icon permanently, copy it out of the generated set, edit it, and import the copy directly.

See [Custom SVG Icons](/docs/21-guide-custom-svg) for the manual approach.