---
title: Autoplay and Looping
id: 22
group: guides-and-advanced
description: "Loading spinners and ambient motion with trigger=mount + loop."
---

`trigger="mount"` fires once when the component appears. `loop` makes the animation repeat forever. Together they produce perpetually running motion - the classic use case is a loading indicator.

## The minimum

```svelte
<Gear template="spin" trigger="mount" loop />
```

The icon mounts, starts spinning, and never stops. No JavaScript, no `setInterval`, no cleanup on unmount - when the icon leaves the DOM, the WAAPI animations go with it.

## Choosing the right template

Not every template is satisfying when looped. See the [Loop](/docs/12-loop) catalog for the full list, but as a rule:

| You want… | Use |
|---|---|
| A classic loading spinner | `spin`, `iris` |
| A typing / thinking indicator | `wave` on small dots |
| An equalizer / activity bar | `march` |
| An ambient, breathing feel | `iris`, `boil`, `orbit` (slow speed) |
| A blinking status / debug | `glitch` |

For a loading row that reads as a single, calm motion, prefer **one** template + a CSS-driven stagger across icons, rather than mixing templates.

## Speed and easing for ambient motion

The default `speed={1}` is tuned for short, decisive UIs. For ambient or background loading:

```svelte
<Gear template="iris" trigger="mount" loop speed={0.5} />
```

Half speed reads as calmer, more deliberate. Combine with a slower easing curve:

```svelte
<Gear template="iris" trigger="mount" loop speed={0.5} easing="ease-in-out" />
```

For an urgent, attention-grabbing loader:

```svelte
<Gear template="spin" trigger="mount" loop speed={2.5} />
```

## Loading row - three dots

```svelte
<script>
  import { Dot } from 'svelte-animated-icon/phosphor';
</script>

<div class="loading-dots" role="status" aria-label="Loading">
  <Dot template="wave" trigger="mount" loop size={10} style="--i: 0;" />
  <Dot template="wave" trigger="mount" loop size={10} style="--i: 1;" />
  <Dot template="wave" trigger="mount" loop size={10} style="--i: 2;" />
</div>

<style>
  .loading-dots {
    display: inline-flex;
    gap: 0.25rem;
    align-items: center;
  }
  .loading-dots :global(.animated-icon) {
    animation-delay: calc(var(--i) * 150ms);
  }
</style>
```

Three dots, each running the same template, each delayed by 150ms via a CSS variable. The result is a wave that propagates left → right.

> The `animation-delay` here is on the **wrapper**, not on a per-keyframe level. WAAPI handles its own per-shape timing inside each icon.

## Stopping the loop

`trigger="mount"` + `loop` runs forever once mounted. To stop it, switch to `trigger="controlled"` and bind `active`:

```svelte
<script>
  import { Gear } from 'svelte-animated-icon/phosphor';
  let isLoading = $state(true);
</script>

<Gear template="spin" trigger="controlled" active={isLoading} loop />
{#if !isLoading}Done!{/if}
```

When `isLoading` flips to `false`, the effect cleanup cancels the in-flight WAAPI animation and the icon returns to rest. See [Parent-Controlled Animation](/docs/20-guide-controlled).

## Accessibility

A perpetually animating icon should have `role="status"` (or `aria-live="polite"`) and an accessible label so screen readers announce the state. A purely decorative spinner can hide from assistive tech:

```svelte
<!-- Decorative -->
<Gear template="spin" trigger="mount" loop aria-hidden="true" />

<!-- Status -->
<div role="status" aria-live="polite">
  <Gear template="spin" trigger="mount" loop />
  Loading…
</div>
```

Also consider `prefers-reduced-motion` - see [Accessibility](/docs/27-accessibility).

## Avoiding motion sickness

Auto-playing loops are one of the most common causes of vestibular discomfort. Always:

- Provide a way to stop them (controlled trigger + state).
- Respect `prefers-reduced-motion`.
- Keep the loop area small - a fullscreen pulsing background is harder on users than a corner spinner.