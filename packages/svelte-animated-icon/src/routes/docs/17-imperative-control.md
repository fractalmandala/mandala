---
title: Imperative Control
id: 17
group: api-reference
description: "Driving animation from code via bind:this and the exported methods."
---

For most cases `trigger`, `active`, and `loop` are enough. When you need to fire animations from code - outside of mouse events, after an async step, on a keyboard shortcut - bind to the component and call `startAnimation()` / `stopAnimation()` directly.

## The two methods

`AnimatedIcon` and every per-icon component expose:

```ts
startAnimation(): void;  // runs the configured template now
stopAnimation(): void;   // cancels in-flight animations and clears inline styles
```

Both are safe to call repeatedly. `startAnimation()` calls `stopAnimation()` first so you never see a leftover animation bleed into the new one.

## Binding to the component

```svelte
<script>
  import { Gear } from 'svelte-animated-icon/phosphor';

  let icon = $state();

  function replay() {
    icon.startAnimation();
  }
</script>

<button onclick={replay}>Replay</button>
<Gear bind:this={icon} template="draw" trigger="controlled" />
```

`bind:this` on a Svelte 5 component gives you the component instance, not the DOM element. The exported methods (`startAnimation`, `stopAnimation`) become instance methods.

## Use cases

### Replay after an async step

```svelte
<script>
  import { Gear } from 'svelte-animated-icon/phosphor';
  let icon = $state();
  let saving = $state(false);

  async function save() {
    saving = true;
    await api.save();
    saving = false;
    icon.startAnimation();
  }
</script>

<button onclick={save} disabled={saving}>
  {saving ? 'Saving…' : 'Save'}
  <Gear bind:this={icon} template="tada" trigger="controlled" active={saving} />
</button>
```

### Keyboard shortcut

```svelte
<svelte:window onkeydown={(e) => e.key === 'r' && icon.startAnimation()} />
<Gear bind:this={icon} template="draw" trigger="controlled" />
```

### Chaining animations

The methods return `void`, but you can chain by waiting on the underlying `Animation` objects if you grab them yourself:

```svelte
<script>
  import { AnimatedIcon, getTemplate } from 'svelte-animated-icon';

  let icon = $state();

  async function doubleAnimation() {
    icon.startAnimation();
    await Promise.all(
      // startAnimation doesn't return animations, but the next mount will.
    );
  }
</script>
```

For chained sequences, drive each step through `trigger="controlled"` and toggle `active` from your state instead. See [Parent-Controlled Animation](/docs/20-guide-controlled).

## Stopping an animation in flight

`stopAnimation()` cancels the WAAPI animations and calls `clearProps()` to strip the inline styles. The icon returns to its rest state. Call it from anywhere you have the bound instance:

```svelte
<script>
  let icon = $state();
</script>

<button onclick={() => icon.stopAnimation()}>Reset</button>
<Gear bind:this={icon} template="draw" trigger="controlled" active={true} />
```

## Why `trigger="controlled"` for imperative use

If you bind to an icon with `trigger="hover"`, the hover handlers will fire alongside your manual calls - and you can get into weird races where a hover-out cancels an animation you just started.

The clean pattern is:

```svelte
<Gear bind:this={icon} template="draw" trigger="controlled" />
```

Now only your code drives it.

## Component vs. DOM

`bind:this` on a Svelte 5 component gives you the **component instance** (with its exported methods). If you need the underlying `<svg>` DOM element - for example, to call `getBoundingClientRect()` - use a wrapper:

```svelte
<script>
  let wrapper = $state();
  $inspect(() => wrapper?.getBoundingClientRect());
</script>

<div bind:this={wrapper}>
  <Gear template="draw" />
</div>
```