---
title: How It Works
id: 23
group: guides-and-advanced
description: "The WAAPI template model - what run() does and why there's no animation library dependency."
---

The library is small on purpose. Three pieces do all the work:

1. **`AnimatedIcon.svelte`** - the Svelte component that owns the SVG and the trigger logic.
2. **`templates.svelte.ts`** - a flat array of small WAAPI scripts that animate the SVG.
3. **Per-icon wrappers** (`Gear.svelte`, `Heart.svelte`, …) - thin files that embed the SVG variants and forward everything else.

There's no animation library dependency. Everything runs on the browser's built-in [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).

## Why WAAPI

WAAPI is the browser's native animation engine - `Element.animate(keyframes, options)` returns a controllable `Animation` object. Compared to a JS animation library:

- **No install footprint.** Lighter bundle, fewer version-pinning concerns.
- **Hardware-accelerated.** Transforms and opacity run on the compositor thread by default.
- **Cancellable, reversible, scrubable.** The standard `Animation` API works on every template's output.
- **Composites with CSS animations.** Mix WAAPI-driven icons with CSS-driven UI without conflicts.

The trade-off: WAAPI doesn't give you a tween DSL. You write keyframes by hand for each template. That's a feature here - every template is ~10 lines of readable code.

## The template model

A template is one record in `TEMPLATES`:

```ts
interface IconTemplate {
  id: string;
  label: string;
  for?: 'line' | 'fill';
  run: (svg: SVGSVGElement) => Animation[];
}
```

- `id` - what you pass to the `template` prop.
- `label` - human-readable name.
- `for` - optional hint: `'line'` (needs a stroke), `'fill'` (suited to solid shapes), or omitted (works on both).
- `run(svg)` - the actual animation. Receives the inner `<svg>` element, returns the `Animation[]` it created.

`run` is called from `startAnimation()` inside the component. The component tracks the returned animations so it can cancel them later.

## What a template looks like

`draw` - the default - animates each path's stroke as if a pen were tracing it:

```ts
{
  id: 'draw',
  label: 'Draw on',
  for: 'line',
  run: (svg) => {
    const out: Animation[] = [];
    svg.querySelectorAll('path,circle,line,polyline,polygon,ellipse,rect')
      .forEach((el, i) => {
        el.setAttribute('pathLength', '1');
        (el as any).style.strokeDasharray = '1';
        (el as any).style.strokeDashoffset = '1';
        out.push(
          (el as any).animate(
            [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
            { duration: 900, delay: i * 70, easing: 'ease-in-out', fill: 'forwards' }
          )
        );
      });
    return out;
  }
}
```

The shape:

1. Walk every animatable shape inside the SVG.
2. Normalize each one's path length to `1` (via `pathLength="1"`) so `stroke-dasharray` and `stroke-dashoffset` are in unit space.
3. Set `stroke-dashoffset: 1` (line is fully "off").
4. Animate `stroke-dashoffset` from `1` to `0` - the line draws on.
5. Stagger by index (`delay: i * 70`) for the cascade feel.
6. Return every animation so the caller can cancel them.

When `stopAnimation()` runs, the component calls each `Animation.cancel()` and then `clearProps(svg)` to strip the inline styles the template set.

## Why one template works on any icon

Most animation templates operate on shapes inside the SVG using relative geometric transformations (such as scale, rotate, opacity, and stroke). Since these transformations are coordinate-independent or utilize relative units (like setting `pathLength="1"` for stroke dash offsets), the same templates work seamlessly across different icon sets with different viewBox coordinate spaces (e.g., `256` for Phosphor, `24` for Remix/Flowbite/Hero, and `512` for Ion).

This means:

- New icons "just work" the moment they enter the library.
- Adding a template benefits every existing icon.
- The whole library is essentially `~4,000+ SVGs × ~22 templates`.

## The component layer

`AnimatedIcon.svelte` is a Svelte 5 component that:

1. Renders a fixed-viewBox `<svg>` and injects the `svg` prop via `{@html}`.
2. Binds the inner `<svg>` to a `svgEl` state.
3. Wires `mouseenter` / `mouseleave` to `startAnimation` / `stopAnimation` when `trigger="hover"`.
4. Runs `startAnimation` in a `$effect` when `trigger="mount"` and the SVG is set.
5. Runs `startAnimation` / `stopAnimation` in a `$effect` based on `active` when `trigger="controlled"`. The effect's cleanup calls `stopAnimation()`, so flipping `trigger` away from `'controlled'` (or unmounting) cancels any in-flight - including looping - animation cleanly.

The patch layer (`loop`, `speed`, `easing`) is applied **after** the template runs by mutating each animation's `KeyframeEffect.updateTiming()` - no template has to know about them.

## Custom templates

Adding a new template means adding a record to `TEMPLATES`:

```ts
{
  id: 'wiggle',
  label: 'Wiggle',
  run: (svg) => {
    svg.style.transformOrigin = 'center';
    return [
      svg.animate(
        [{ transform: 'rotate(0)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(0)' }],
        { duration: 600, easing: 'ease-in-out' }
      )
    ];
  }
}
```

Once it's in the array, `template="wiggle"` works on every icon and per-icon component. Reach for this when the bundled templates don't cover a motion you need. See [Core Exports and Types](/docs/18-core-exports-and-types) for the API surface.

## Why templates live in `.svelte.ts`

`templates.svelte.ts` (note the extension) tells the Svelte compiler to allow runes inside the file. Currently the templates use plain JS - they're a flat array of records - but the extension leaves room for any future `$state` or `$derived` use without a rename.