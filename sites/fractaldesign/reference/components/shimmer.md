---
title: Shimmer
description: A streaming placeholder effect that wipes a bright highlight across a muted text gradient. Used inside titles and descriptions that are still being generated, so the user sees an animated "skeleton" until the real content arrives.
---

# Shimmer

The `Shimmer` component wraps any inline text in an animated gradient sweep. The text color is set to transparent; instead, a `linear-gradient` background is clipped to the text shape and animated left-to-right via `background-position`. This produces the classic "loading shimmer" effect but rendered as actual text glyphs, not a gray box.

The styling below is pure indented Sass.

## Tokens

```sass
$shimmer-color:       hsl(0 0% 0%)           // foreground "ink" for the gradient text
$shimmer-highlight:   hsl(0 0% 100%)         // bright stop that sweeps across
$shimmer-bg-color:    hsl(210 40% 96%)       // muted foreground for the base text layer
$duration-default:    2s
$spread-default:      2
$background-size:     250% 100%
```

## Mixins

```sass
=shimmer-base($highlight: $shimmer-highlight, $base: $shimmer-bg-color, $duration: $duration-default)
  position: relative
  display: inline-block
  background-clip: text
  -webkit-background-clip: text
  color: transparent
  background-size: $background-size
  background-repeat: no-repeat
  background-position: 100% center
  animation: shimmer-slide $duration linear infinite

  // two layers:
  //   1. animated highlight sweeping across (transparent → highlight → transparent)
  //   2. static muted foreground as a fallback when the sweep is offscreen
  background-image: linear-gradient(90deg,
                   transparent calc(50% - var(--spread, 30px)),
                   $highlight,
                   transparent calc(50% + var(--spread, 30px))),
                 linear-gradient($base, $base)
```

## Shimmer (root)

```sass
.shimmer
  +shimmer-base()

  // optional content-length-driven spread for long strings
  &[data-spread]
    --spread: calc(attr(data-spread, 30) * 1px)
```

## Keyframes

```sass
@keyframes shimmer-slide
  from
    background-position: 100% center
  to
    background-position: 0% center
```

## Variants

```sass
.shimmer--muted
  // the base layer is the regular foreground muted tone
  background-image: linear-gradient(90deg,
                   transparent calc(50% - var(--spread, 30px)),
                   $shimmer-highlight,
                   transparent calc(50% + var(--spread, 30px))),
                 linear-gradient(hsl(215 16% 47%), hsl(215 16% 47%))

.shimmer--inverse
  // used inside dark text — highlight is dark, base is light
  background-image: linear-gradient(90deg,
                   transparent calc(50% - var(--spread, 30px)),
                   hsl(222 47% 11%),
                   transparent calc(50% + var(--spread, 30px))),
                 linear-gradient(hsl(210 40% 98%), hsl(210 40% 98%))
```

## Reduced motion

```sass
@media (prefers-reduced-motion: reduce)
  .shimmer
    animation-duration: 6s
```

## Usage skeleton (Svelte, for reference)

```svelte
<p class="shimmer" style="--spread: 60px; --shimmer-duration: 1.5s">
  Generating a plan…
</p>
```
