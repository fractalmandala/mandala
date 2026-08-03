---
title: Custom SVG Icons
id: 21
group: guides-and-advanced
description: "Use AnimatedIcon directly with your own SVG markup."
---

When the icon you want isn't in any shipped library, drop down to the `AnimatedIcon` core and pass your own SVG string.

## The basics

```svelte
<script>
  import { AnimatedIcon } from 'svelte-animated-icon';
</script>

<AnimatedIcon
  svg={`<circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-width="16"/>`}
  template="draw"
  size={48}
/>
```

`svg` is the **inner** markup - no `<svg>` wrapper, no bounding `<rect fill="none">`. The component renders the surrounding `<svg viewBox="0 0 256 256">` and inlines your string inside it.

## Why the 256 viewBox matters

Templates operate on a coordinate space of `0 0 256 256`. As long as your shapes use coordinates in that range, every template works without modification.

```svelte
<!-- ✓ works -->
<AnimatedIcon svg={`<rect x="32" y="32" width="192" height="192" fill="currentColor"/>`} template="pop" />

<!-- ✗ will draw but templates will scale oddly -->
<AnimatedIcon svg={`<rect x="0" y="0" width="24" height="24" fill="currentColor"/>`} template="pop" />
```

If you have SVG that doesn't fit the 256 grid, the simplest fix is to wrap it in a `<g transform="scale(…) translate(…)">`. Better: redraw the path on the 256 grid - most icon editors export with `viewBox="0 0 24 24"`, which is `scale(~10.67)` away.

## Recognized shape types

Templates walk the SVG looking for shapes they can animate. Recognized:

- `path`
- `circle`
- `line`
- `polyline`
- `polygon`
- `ellipse`
- `rect`

If your icon uses something else (`<use>`, custom elements, `<image>`), the templates won't see it. Stick to the seven above.

## Color and stroke

Always prefer `currentColor` for fill and stroke - it lets the icon inherit from CSS. Avoid hard-coded `fill="#000000"` or `stroke="black"` unless you specifically want that color to override the parent.

```svelte
<!-- ✓ follows theme -->
<AnimatedIcon svg={`<path d="..." fill="none" stroke="currentColor" stroke-width="16"/>`} />

<!-- ✗ ignores theme -->
<AnimatedIcon svg={`<path d="..." fill="#000"/>`} />
```

## Sourcing SVG from Figma / Sketch / Illustrator

1. Export as SVG.
2. Open in a text editor.
3. Find the outer `<svg …>` tag. Inside, take everything between the opening tag and the closing `</svg>` - that's your `svg` string.
4. Remove any `<rect width="100%" height="100%" fill="none"/>` bounding rect at the top.
5. Replace explicit colors with `currentColor`.
6. Make sure paths use coordinates in 0–256.

For path data, [svg-path-editor](https://yqnn.github.io/svg-path-editor/) is a clean way to inspect and normalize.

## Persisting custom icons

If you're going to use a custom shape more than once, define it once and reuse:

```svelte
<script>
  import { AnimatedIcon } from 'svelte-animated-icon';

  const MY_ICON = `<path d="M128 32 L224 224 L32 224 Z" fill="none" stroke="currentColor" stroke-width="16" stroke-linejoin="round"/>`;
</script>

<AnimatedIcon svg={MY_ICON} template="draw" />
<AnimatedIcon svg={MY_ICON} template="jelly" />
```

Or extract a Svelte component:

```svelte
<!-- src/lib/icons/LogoTriangle.svelte -->
<script>
  import AnimatedIcon from 'svelte-animated-icon/core/AnimatedIcon.svelte';
  const SVG = `<path d="..." />`;
  let { ...rest } = $props();
</script>

<AnimatedIcon svg={SVG} {...rest} />
```

That wrapper looks identical to the generated Phosphor components - drop it in any place you'd use a shipped icon.

## A complete worked example

A loading spinner built from three rotating arcs:

```svelte
<script>
  import { AnimatedIcon } from 'svelte-animated-icon';

  const SPINNER = `
    <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor"
            stroke-width="16" stroke-linecap="round"
            stroke-dasharray="150 600" stroke-dashoffset="0"/>
  `;
</script>

<AnimatedIcon svg={SPINNER} template="spin" trigger="mount" loop size={32} />
```

The `stroke-dasharray="150 600"` makes only a quarter of the circle visible at any time. `template="spin"` rotates the whole SVG; combined with `loop` it produces a smooth perpetual spinner.