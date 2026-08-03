---
title: Loader
description: A small spinning indicator and icon used to convey that a response, tool call, or background task is in progress. Typically rendered inline next to text or inside a button.
---

# Loader

The `Loader` component is a thin animated SVG icon (an eight-spoke sunburst with progressively faded spokes) wrapped in an `inline-flex` container that applies a continuous CSS spin animation. It is used wherever a transient loading state needs to be surfaced without occupying a full skeleton block.

In the original implementation the spin animation is done with the Tailwind `animate-spin` utility. The equivalent in pure indented Sass is a `@keyframes spin` paired with a long-form `animation` shorthand.

## Tokens

```sass
$color-loader:        currentColor
$loader-stroke-width: 1.5
$size-default:        1rem          // 16px — matches the `size={16}` default
$animation-duration:  0.8s
$animation-timing:    linear
```

## Mixins

```sass
=loader-size($size: $size-default)
  width: $size
  height: $size

=loader-spin($duration: $animation-duration)
  animation: loader-spin $duration $animation-timing infinite

@keyframes loader-spin
  to
    transform: rotate(360deg)
```

## Loader (wrapper)

```sass
.loader
  display: inline-flex
  align-items: center
  justify-content: center
  +loader-spin()
```

## LoaderIcon (the SVG itself)

The icon is an inline SVG so its strokes pick up `currentColor`. It is sized through the CSS `width`/`height` properties (driven by a CSS custom property `--loader-size` set inline by the component), with each of its eight radial spokes drawn at a stepped opacity to mimic the original layered-fade pattern.

```sass
.loader-icon
  +loader-size(var(--loader-size, $size-default))
  stroke-linejoin: round
  color: $color-loader

  // eight spokes — same color, stepped opacity from 0.1 → 1.0
  &__spoke
    stroke: currentColor
    stroke-width: $loader-stroke-width
    fill: none

  // progressive fade per spoke (matches the original eight path elements)
  &__spoke--1   opacity: 1.0
  &__spoke--2   opacity: 0.5
  &__spoke--3   opacity: 0.9
  &__spoke--4   opacity: 0.1
  &__spoke--5   opacity: 0.4
  &__spoke--6   opacity: 0.6
  &__spoke--7   opacity: 0.2
  &__spoke--8   opacity: 0.7
  &__spoke--9   opacity: 0.3
  &__spoke--10  opacity: 0.8
  &__spoke--11  opacity: 0.0
  &__spoke--12  opacity: 0.0
```

If you prefer to keep the icon markup-driven instead of class-driven, the spokes can also be expressed as a single repeating selector:

```sass
.loader-icon path
  stroke: currentColor
  stroke-width: $loader-stroke-width
  fill: none
  vector-effect: non-scaling-stroke

  // nth-child overrides for the stepped-opacity fan
  &:nth-child(1)   opacity: 1.0
  &:nth-child(2)   opacity: 0.5
  &:nth-child(3)   opacity: 0.9
  &:nth-child(4)   opacity: 0.1
  &:nth-child(5)   opacity: 0.4
  &:nth-child(6)   opacity: 0.6
  &:nth-child(7)   opacity: 0.2
  &:nth-child(8)   opacity: 0.7
  &:nth-child(9)   opacity: 0.3
  &:nth-child(10)  opacity: 0.8
```

## Reduced motion

```sass
@media (prefers-reduced-motion: reduce)
  .loader
    animation-duration: 3s

  .loader-icon
    animation-duration: 3s
```

## Inline size override

The component accepts a `size` prop that translates to the inline CSS variable `--loader-size`. To bump the loader to 24px, set `style="--loader-size: 24px"` on the wrapper. The selectors above already read from that variable, so no extra rules are required.

## Usage skeleton (Svelte, for reference)

```svelte
<span class="loader" style="--loader-size: 16px" role="status" aria-label="Loading">
  <svg class="loader-icon" viewBox="0 0 16 16" aria-hidden="true">
    <!-- 8 radial <path class="loader-icon__spoke loader-icon__spoke--N" /> spokes -->
  </svg>
</span>
```
