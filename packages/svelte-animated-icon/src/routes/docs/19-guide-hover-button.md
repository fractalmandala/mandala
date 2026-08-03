---
title: Animate on Hover in Button
id: 19
group: guides-and-advanced
description: "Make the whole button's hover drive the icon (the controlled + active pattern)."
---

The default `trigger="hover"` only fires when the cursor enters the icon's own bounding box. Inside a button, the clickable area is bigger than the icon - you almost always want the **button's** hover to drive the icon, not the icon's.

## The pattern

Use `trigger="controlled"` and bind the icon's `active` prop to the button's hover state.

```svelte
<script>
  import { Gear } from 'svelte-animated-icon/phosphor';

  let hovered = $state(false);
</script>

<button
  type="button"
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
  onfocus={() => (hovered = true)}
  onblur={() => (hovered = false)}
>
  <Gear template="spin" trigger="controlled" active={hovered} size={20} />
  Settings
</button>
```

Hovering anywhere on the button - including the label - spins the gear.

## Why mirror focus too

Keyboard users navigate with `Tab`. Mirroring focus events into the same `hovered` state makes the icon animate when the button receives focus, not just when a mouse hovers over it.

If you prefer to keep hover and focus as separate signals, use two `boolean`s:

```svelte
let hovered = $state(false);
let focused = $state(false);

<button
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
  onfocus={() => (focused = true)}
  onblur={() => (focused = false)}
>
  <Gear template="spin" trigger="controlled" active={hovered || focused} />
</button>
```

## Wrapping it as a component

If you do this in more than one place, hoist it:

```svelte
<!-- HoverButton.svelte -->
<script>
  import { Gear } from 'svelte-animated-icon/phosphor';
  import type { Snippet } from 'svelte';

  let {
    icon,
    children,
    template = 'spin',
    ...rest
  }: {
    icon: typeof Gear;
    template?: string;
    children: Snippet;
  } = $props();

  let hovered = $state(false);
</script>

<button
  {...rest}
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
  onfocus={() => (hovered = true)}
  onblur={() => (hovered = false)}
>
  {@const Icon = icon}
  <Icon {template} trigger="controlled" active={hovered} size={20} />
  {@render children()}
</button>
```

```svelte
<HoverButton icon={Gear} template="spin">Settings</HoverButton>
<HoverButton icon={Heart} template="jelly">Like</HoverButton>
```

## CSS-only fallback

If you don't want to wire state, the default `trigger="hover"` works - but the icon only animates when the cursor is over its bounding box, not the surrounding button. Acceptable for icon-only buttons. Annoying for buttons with labels, where the label area isn't part of the hover region.

## What about pointerdown / press

If you want a press-state animation too:

```svelte
let pressed = $state(false);

<button
  onpointerdown={() => (pressed = true)}
  onpointerup={() => (pressed = false)}
  onpointerleave={() => (pressed = false)}
  …
>
  <Gear template="spin" trigger="controlled" active={hovered || pressed} />
</button>
```

Or chain: use `active={hovered}` for the spin and a separate `template="tada"` with `active={justSaved}` for one-shot moments.

See [Parent-Controlled Animation](/docs/20-guide-controlled) for more state patterns.