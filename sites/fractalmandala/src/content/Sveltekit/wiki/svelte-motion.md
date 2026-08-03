---
title: Svelte Motion
description: The Svelte Motion animation library for Svelte 5 — motion component, hooks (useAnimate, useScroll, useSpring, useTime, useInView, etc.), AnimatePresence, variants, layout animations, gestures, drag, pan, motion values, and optimized appear animations.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - svelte-5
  - animation
  - motion
  - svelte-motion
  - transitions
sources:
  - svelte-motion/docs/api-reference
  - svelte-motion/docs/motion-config
  - svelte-motion/docs/motion-values
  - svelte-motion/docs/motion-value-children
  - svelte-motion/docs/object-style-motion-values
  - svelte-motion/docs/use-animate
  - svelte-motion/docs/use-animation-controls
  - svelte-motion/docs/use-animation-frame
  - svelte-motion/docs/use-cycle
  - svelte-motion/docs/use-follow-value
  - svelte-motion/docs/use-in-view
  - svelte-motion/docs/use-motion-template
  - svelte-motion/docs/use-motion-value-event
  - svelte-motion/docs/use-presence
  - svelte-motion/docs/use-presence-data
  - svelte-motion/docs/use-reduced-motion
  - svelte-motion/docs/use-reduced-motion-config
  - svelte-motion/docs/use-scroll
  - svelte-motion/docs/use-spring
  - svelte-motion/docs/use-time
  - svelte-motion/docs/use-transform
  - svelte-motion/docs/use-velocity
  - svelte-motion/docs/variants
  - svelte-motion/docs/animate-presence
  - svelte-motion/docs/animate-presence-custom
  - svelte-motion/docs/layout-animations
  - svelte-motion/docs/drag
  - svelte-motion/docs/pan
  - svelte-motion/docs/gestures
  - svelte-motion/docs/lazy-motion
  - svelte-motion/docs/optimized-appear
  - svelte-motion/docs/style-string
  - svelte-motion/docs/transform-template
  - svelte-motion/docs/tree-shaking
  - svelte-motion/docs/shadcn-button
  - svelte-motion/docs/shadcn-tabs
  - svelte-motion/examples/animate-presence
  - svelte-motion/examples/animate-presence-custom
  - svelte-motion/examples/animated-button
  - svelte-motion/examples/animated-tabs
  - svelte-motion/examples/characters-remaining
  - svelte-motion/examples/color-interpolation
  - svelte-motion/examples/conic-gradient
  - svelte-motion/examples/fancy-like-button
  - svelte-motion/examples/hover-and-tap
  - svelte-motion/examples/html-content
  - svelte-motion/examples/keyframes
  - svelte-motion/examples/layout-group
  - svelte-motion/examples/layout-scroll
  - svelte-motion/examples/lazy-motion
  - svelte-motion/examples/motion-path
  - svelte-motion/examples/motion-value-children
  - svelte-motion/examples/multi-state-badge
  - svelte-motion/examples/notifications-stack
  - svelte-motion/examples/object-style-motion-values
  - svelte-motion/examples/optimized-appear
  - svelte-motion/examples/pan
  - svelte-motion/examples/path-morphing
  - svelte-motion/examples/reordering
  - svelte-motion/examples/rotate
  - svelte-motion/examples/scroll-progress
  - svelte-motion/examples/shared-layout-animation
  - svelte-motion/examples/style-string
  - svelte-motion/examples/tab-select
  - svelte-motion/examples/toggle-switch
  - svelte-motion/examples/transform-template
  - svelte-motion/examples/use-animate
  - svelte-motion/examples/use-animation-controls
  - svelte-motion/examples/use-animation-frame
  - svelte-motion/examples/use-cycle
  - svelte-motion/examples/use-follow-value
  - svelte-motion/examples/use-in-view
  - svelte-motion/examples/use-presence
  - svelte-motion/examples/use-presence-data
  - svelte-motion/examples/use-reduced-motion
  - svelte-motion/examples/use-reduced-motion-config
  - svelte-motion/examples/use-time
  - svelte-motion/examples/use-time-synced
  - svelte-motion/examples/variants-basic
  - svelte-motion/examples/variants-dynamic
  - svelte-motion/examples/variants-propagation
  - svelte-motion/examples/variants-while-hover
  - svelte-motion/examples/while-focus
  - svelte-motion/examples/while-in-view
related:
  - Svelte-5-Template-Directives
  - Svelte-Built-in-Modules
  - Svelte-5-Template-Syntax
timestamp: 2026-06-21
source: Wiki repo
---

Svelte Motion (`@humanspeak/svelte-motion`) is an animation library for Svelte 5 that provides declarative and imperative animation APIs, gesture handling, layout animations, and more. It follows Svelte 5 conventions with rune-based hooks and attachment-based scoping.

## Motion Component

The `<Motion>` component provides declarative animations with variants, transitions, gesture callbacks, and layout animation support:

```svelte
<Motion
  initial={{ opacity: 0, scale: 0.5 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
>
  <div>Animated</div>
</Motion>
```

## Hooks

| Hook | Purpose |
|---|---|
| `useAnimate` | Imperative animation with scoped CSS selector API |
| `useAnimationControls` | Programmatic control over `<Motion>` animations |
| `useAnimationFrame` | Run code on every animation frame |
| `useScroll` | Track scroll position and progress |
| `useSpring` | Physics-based spring animations |
| `useTime` | Reactive time value |
| `useTransform` | Map one range of values to another |
| `useVelocity` | Track velocity of motion values |
| `useInView` | Detect when elements enter the viewport |
| `useCycle` | Cycle through a set of values |
| `useMotionValue` | Create and manage motion values |
| `useMotionTemplate` | Combine motion values into CSS strings |
| `useMotionValueEvent` | Listen to motion value changes |
| `useFollowValue` | Follow another motion value with spring physics |
| `usePresence` / `usePresenceData` | Animate elements entering/leaving |
| `useReducedMotion` / `useReducedMotionConfig` | Respect user motion preferences |

## AnimatePresence

Animate elements as they mount and unmount from the component tree:

```svelte
<AnimatePresence>
  {#if visible}
    <Motion initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div>Hello</div>
    </Motion>
  {/if}
</AnimatePresence>
```

## Variants

Define named animation states that can be referenced by multiple elements:

```svelte
<script>
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
</script>

<Motion variants={variants} initial="hidden" animate="visible">
  <div>Content</div>
</Motion>
```

Variants support propagation to child motion elements and orchestration with `delayChildren` and `staggerChildren`.

## Layout Animations

- **`layout` prop:** Animate a single element when its size/position changes (FLIP)
- **`layoutId` prop:** Animate between different elements sharing the same ID

## Gestures

Built-in gesture support:

- **Hover and tap:** `whileHover`, `whileTap` props with visual feedback
- **While focus:** `whileFocus` for accessibility-friendly focus animations
- **While in view:** `whileInView` for scroll-triggered animations
- **Drag:** `drag` prop with drag constraints, elastic bounds, and direction locking
- **Pan:** `onPan` callbacks for custom pan gesture handling

## Motion Values

Motion values track numerical or color values over time and can be:

- **Spring-based:** Physics-driven with configurable stiffness, damping, and mass
- **Tweened:** Timing-based with easing functions
- **Transformed:** Mapped through input/output ranges with `useTransform`
- **Templated:** Combined into CSS strings with `useMotionTemplate`
- **Followed:** Spring-animated followers with `useFollowValue`

## Optimized Appear

`optimizedAppear` enables the motion component to animate from its server-rendered state to the client state without layout shift.

## Style String & Transform Template

- **Style string:** Pass animation values as a CSS string
- **Transform template:** Define transform properties (translate, scale, rotate) as template strings

## Performance & Tree Shaking

Svelte Motion is tree-shakable — unused hooks and components are removed from the production bundle. The `motion` package re-exports animation primitives (`animate`, `easing`, `spring`) for standalone use.

## Examples

The library includes extensive examples covering: animated buttons, tabs, toggle switches, notifications stacks, path morphing, color interpolation, conic gradients, fancy like buttons, scroll progress indicators, character counters, layout groups, reordering, motion paths, shared layout animations, and more.

## See Also
- [Svelte 5 Template Directives](Svelte-5-Template-Directives) — transition: and animate: directives for simpler animations
- [Svelte Built-in Modules](Svelte-Built-in-Modules) — svelte/motion for spring/tweened stores
