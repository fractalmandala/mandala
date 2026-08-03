---
title: Speed
id: 9
group: customization
description: "The speed multiplier and how it scales each template's duration and delay."
---

The `speed` prop multiplies every duration and delay inside a template. Default is `1`.

```svelte
<Gear template="draw" speed={1} />   <!-- normal -->
<Gear template="draw" speed={2} />   <!-- 2× faster -->
<Gear template="draw" speed={0.5} /> <!-- 2× slower -->
<Gear template="draw" speed={3} />   <!-- 3× faster, snappy UI -->
```

## What it actually scales

When you call `startAnimation()`, the engine reads the computed timing for each WAAPI animation the template produced and:

- divides `duration` by `speed`
- divides `delay` by `speed`

So a template that normally runs for `900ms` with a `70ms` stagger between shapes becomes `450ms` + `35ms` stagger at `speed={2}`. The animation looks the same, just compressed.

This is per-animation, not per-icon. If a template creates 10 child animations (like `cascade`), each one is sped up independently - their *relative* offsets stay proportional.

## Sensible ranges

| `speed` | Feel | Reach for |
|---|---|---|
| `0.25 – 0.5` | Cinematic / dramatic | Hero entrances, success celebrations |
| `1` | The template's intended pace | Default UI |
| `2` | Snappy | Buttons, toolbars, dense lists |
| `3 – 5` | Glitch / blink | Loading dots, attention-grabbers |
| `> 10` | Effectively instant | Avoid - combine with `loop` if you want a strobe |

## A loading dot row

```svelte
<script>
  import { Dot } from 'svelte-animated-icon/phosphor';
</script>

<div class="loading-dots" aria-label="Loading">
  <Dot template="pop" trigger="mount" loop speed={2} size={12} />
  <Dot template="pop" trigger="mount" loop speed={2} size={12} style="animation-delay: 150ms" />
  <Dot template="pop" trigger="mount" loop speed={2} size={12} style="animation-delay: 300ms" />
</div>
```

Three identical icons, each running the same template at `speed={2}`. The CSS `animation-delay` is a *render* delay (CSS-driven) - use it for orchestration across separate icons; use `speed` to tune a single icon's pace.

## Speed × loop

Pair `speed` with `loop` to control how fast a perpetual animation cycles:

```svelte
<Gear template="spin" trigger="mount" loop speed={0.5} />  <!-- slow, ambient -->
<Gear template="spin" trigger="mount" loop speed={1} />    <!-- normal -->
<Gear template="spin" trigger="mount" loop speed={3} />    <!-- fast, urgent -->
```

## Speed vs. duration override

If you need per-animation-keyframe control (different shapes moving at different rates inside one template), use the [`easing`](/docs/10-easing) override or call `startAnimation()` / `stopAnimation()` imperatively and reach for the underlying WAAPI `Animation` objects. See [Imperative Control](/docs/17-imperative-control).