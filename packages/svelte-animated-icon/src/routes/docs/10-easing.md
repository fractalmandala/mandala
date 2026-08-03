---
title: Easing
id: 10
group: customization
description: "Overriding a template's easing with any CSS easing string (and when to leave the default)."
---

Each template ships with an easing tuned to its motion. The `easing` prop lets you swap in **any valid CSS easing string** without touching the template.

```svelte
<Heart template="jelly" />                      <!-- template's default -->
<Heart template="jelly" easing="ease-out" />   <!-- standard CSS easing -->
<Heart template="jelly" easing="linear" />     <!-- no easing at all -->
<Heart template="jelly" easing="cubic-bezier(.34,1.56,.64,1)" /> <!-- custom curve -->
```

Set `easing={null}` (the default) to keep the template's own choice.

## What you can pass

Anything the `animation-timing-function` CSS property accepts:

- Keywords: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `step-start`, `step-end`
- Step functions: `steps(4, end)`, `steps(8)`
- Cubic-bézier: `cubic-bezier(x1, y1, x2, y2)`
- The shorthand: `ease-in-out` is equivalent to `cubic-bezier(0.42, 0, 0.58, 1)`

## When the override applies

The engine patches the **timing** of every WAAPI animation the template produced. It does not rewrite the keyframes - your easing rides on top of whatever shapes the template moves.

So:

```svelte
<Gear template="spin" easing="linear" />
```

spins uniformly - no acceleration or deceleration at the ends. The template's default `ease-in-out` would have given a slight wobble at the loop boundary.

```svelte
<Heart template="jelly" easing="ease-in-out" />
```

squishes and un-squishes with the same gentle curve at both ends instead of the template's overshoot-y bouncy easing.

## Templates with built-in bouncy curves

A handful of templates already use `cubic-bezier(.34,1.56,.64,1)` (a back-out with a tiny overshoot) for that "spring past the target and settle" feel - `cascade`, `orbit`, `assemble`, `tada`, `drop`. Override these if you want a more clinical, linear feel:

```svelte
<Heart template="cascade" />                                    <!-- bouncy -->
<Heart template="cascade" easing="ease-out" />                 <!-- clinical -->
<Heart template="cascade" easing="cubic-bezier(.22,1,.36,1)" /> <!-- quintOut -->
```

## Easing × loop

When `loop` is on, easing controls the **transition between iterations**. `linear` gives a metronomic loop; the template's default often pauses perceptibly at the loop seam. Pick whatever feels right for the moment.

## Why `null` is the default

Most of the time, the template author already chose the right easing for the motion. Setting `easing={null}` (or just omitting the prop) lets that choice win. Override only when you have a specific reason - a faster UI, a calmer hero, a steppy clock face.