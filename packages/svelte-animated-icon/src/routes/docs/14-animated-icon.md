---
title: Animated Icon
id: 14
group: api-reference
description: "Full prop table for the core component plus the exported startAnimation() / stopAnimation()."
---

The core animation engine. Importable as `AnimatedIcon` from `svelte-animated-icon`.

```svelte
<script>
  import { AnimatedIcon } from 'svelte-animated-icon';
</script>

<AnimatedIcon svg={mySvgString} template="spin" size={32} />
```

## Props

| Prop | Type | Default | Required | Notes |
|---|---|---|---|---|
| `svg` | `string` | - | **yes** | Pre-stripped inner SVG markup. No `<svg>` wrapper, no bounding `<rect fill="none">`. |
| `template` | `string` | `'draw'` | | A template id - see [Templates Catalog](/docs/16-templates-catalog). |
| `size` | `number` | `24` | | Rendered pixel size; sets `<svg width>` and `<svg height>`. |
| `trigger` | `'hover' \| 'mount' \| 'controlled'` | `'hover'` | | See [Triggers](/docs/08-triggers). |
| `active` | `boolean` | `false` | | When `trigger="controlled"`, animates while true. |
| `loop` | `boolean` | `false` | | Force the template to repeat forever. |
| `speed` | `number` | `1` | | Duration / delay multiplier (`2` = twice as fast). |
| `easing` | `string \| null` | `null` | | Override the template's easing. `null` keeps the template's own. |
| `class` | `string` | `''` | | Extra class on the wrapper. |
| `color` | `string` | - | | Text/icon color (sets inline `style="color: …"`). |

## Exported methods

Bind to the component instance to drive animation imperatively:

```svelte
<script>
  import { AnimatedIcon } from 'svelte-animated-icon';

  let icon = $state();

  export function replay() {
    icon.stopAnimation();
    icon.startAnimation();
  }
</script>

<AnimatedIcon bind:this={icon} svg={mySvg} template="draw" trigger="controlled" />
<button onclick={replay}>Replay</button>
```

### `startAnimation(): void`

Cancels any in-flight animation, then runs the configured template against the current SVG. Reads the latest values of `template`, `loop`, `speed`, and `easing` from props.

### `stopAnimation(): void`

Cancels all in-flight animations and calls `clearProps()` to strip the inline styles the template set (`stroke-dasharray`, `stroke-dashoffset`, `opacity`, `transform`, `transform-box`, `transform-origin`, `fill`, `fill-opacity`). The icon returns to its rest state.

## Render output

The component renders (with any additional HTML attributes/styles/events forwarded):

```html
<div class="animated-icon {className}" role="img" style="color: {color}; ...anyOtherStyles" onmouseenter=… onmouseleave=… ...anyOtherAttributes>
  <svg bind:this={svgEl} width={size} height={size} viewBox="0 0 256 256"
       style="overflow: visible; display: block;">
    {@html svg}
  </svg>
</div>
```

- The wrapper has `role="img"` by default. Override accessibility or add extra event handlers via standard props. See [Accessibility](/docs/27-accessibility).
- The inner `<svg>` has a fixed `viewBox="0 0 256 256"` - required for templates to do their geometry tricks.
- `xmlns="http://www.w3.org/2000/svg"` is set on the inner `<svg>`.

## Reactivity model

The component uses two `$effect` blocks internally:

1. **Mount trigger** - if `trigger === 'mount'` and `svg` is set, calls `startAnimation()` once.
2. **Controlled trigger** - if `trigger === 'controlled'`, starts or stops based on `active`. The effect's cleanup calls `stopAnimation()`, so flipping `trigger` *away* from `'controlled'` (or changing `active` / `svg`) cancels any in-flight animation. Looping animations are stopped cleanly this way.

## Type import

The `Props` interface is exported from the component's `<script module>` block, and re-exported as `AnimatedIconProps` from the package root:

```ts
import type { AnimatedIconProps } from 'svelte-animated-icon';
```

See [Core Exports and Types](/docs/18-core-exports-and-types) for the rest of the public surface.