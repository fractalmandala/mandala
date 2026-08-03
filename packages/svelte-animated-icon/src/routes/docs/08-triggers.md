---
title: Triggers
id: 8
group: customization
description: "hover, mount, and controlled (active) - when each fires and how to drive it."
---

The `trigger` prop decides **when** the animation runs. Three values cover the whole range.

## `hover` (default)

The icon animates while the cursor is over it. The trigger fires on `mouseenter`, stops on `mouseleave`.

```svelte
<Gear template="spin" />
<!-- equivalent to: -->
<Gear template="spin" trigger="hover" />
```

Hover triggers are tied to the icon's own bounding box (the `<div class="animated-icon">` wrapper). If you want the icon to animate when **the parent** is hovered - for example, a button - see the [Animate on Hover in Button](/docs/19-guide-hover-button) guide.

## `mount`

Fires exactly once, as soon as the component mounts and the SVG is in the DOM. Useful for first-impression motion on hero elements, page entrances, or any "this thing just appeared" moment.

```svelte
<Heart template="jelly" trigger="mount" size={48} />
```

Combine with `loop` to make a perpetually running loader:

```svelte
<Gear template="spin" trigger="mount" loop />
```

See [Autoplay and Looping](/docs/22-guide-autoplay-loop) for the full pattern.

## `controlled`

Animation is driven entirely by the `active` prop. When `active` is `true`, the animation runs. When it flips to `false`, the animation stops and the icon resets to its rest state.

```svelte
<script>
  let isOpen = $state(false);
</script>

<button onclick={() => (isOpen = !isOpen)}>
  {isOpen ? 'Close' : 'Open'}
  <ArrowRight template="draw" trigger="controlled" active={isOpen} />
</button>
```

This is the right mode for:

- Toggles, accordions, popovers, drawers.
- Status indicators tied to app state (online / offline, saved / unsaved).
- Async states (idle / loading / success / error).

Switching `trigger` *away from* `'controlled'` also stops any in-flight (possibly looping) animation, so it's safe to flip modes at runtime. See [Parent-Controlled Animation](/docs/20-guide-controlled) for the full pattern, including how to bind `active` to multiple icons at once.

## Quick comparison

| Trigger | Fires on | Best for |
|---|---|---|
| `hover` | `mouseenter` / `mouseleave` | Toolbars, buttons, list rows |
| `mount` | Component first appears | Entrances, hero motion, autoplay loaders |
| `controlled` | `active` becomes `true` | Toggles, app state, async status |

## Combining with `loop`

`loop` is orthogonal to `trigger`. Pair them whenever you want a perpetually running animation:

```svelte
<!-- Always spinning once mounted -->
<Gear template="spin" trigger="mount" loop />

<!-- Spinning only while loading is true -->
<Gear template="iris" trigger="controlled" active={isLoading} loop />
```

See [Loop](/docs/12-loop) for the details.