---
title: Loop
id: 12
group: customization
description: "Forcing a template to repeat forever, and which templates loop by design."
---

`loop={true}` forces a template to repeat forever instead of running once.

```svelte
<Gear template="spin" trigger="mount" loop />
```

This icon starts spinning the moment it mounts and never stops.

## How looping works under the hood

When you call `startAnimation()`, the engine patches each WAAPI animation's effect timing:

```ts
if (loop) patch.iterations = Infinity;
```

That tells the browser to repeat each animation indefinitely. The template's keyframes don't change - only how many times they're played.

## Templates that look right looping

| Template | Loop feel |
|---|---|
| `spin` | Continuous rotation - the classic loader |
| `iris` | Pulsing scale - ambient breathing |
| `wave` | Sequential opacity sweep - typing indicators |
| `march` | Strokes marching - equalizer bars |
| `glitch` | Rapid jitter - debug / status |
| `boil` | Bubbling motion - organic ambient |
| `orbit` | Each shape rotating in place (when each iteration has a visible rest) |

## Templates that **don't** loop well

One-shot entrance animations look broken when forced to repeat:

- `pop`, `cascade`, `rise` - already settled; looping jumps back to invisible
- `draw`, `native-draw`, `wipe`, `trace` - the path is drawn, then redrawn - usable but busy
- `drop`, `stamp`, `tada` - designed as discrete events

If you want a perpetual loading-style animation, prefer `spin`, `iris`, `wave`, or `march`.

## Loop with controlled triggers

`loop` works with any trigger, but the combination that surprises people is `controlled` + `loop`:

```svelte
<Gear template="spin" trigger="controlled" active={isLoading} loop />
```

The icon loops only while `isLoading` is `true`. When the load completes, `active` flips to `false`, the animation is cancelled, and the icon resets to its rest state. See [Parent-Controlled Animation](/docs/20-guide-controlled) for the full pattern.

## Loop cleanup

Switching `trigger` *away* from `'controlled'` while a loop is running triggers an effect cleanup that cancels the animation. You can also call `stopAnimation()` imperatively. See [Imperative Control](/docs/17-imperative-control).

## Performance note

A looping animation runs WAAPI work for as long as it's active. If you mount many loopers at once (a full-screen spinner grid, for instance), consider:

- Lower `speed` if the loop is meant to be ambient - fewer frames per second.
- `trigger="controlled"` with `active` only true on visible icons - let `IntersectionObserver` drive it.
- Unmount icons that don't need to be in the DOM.