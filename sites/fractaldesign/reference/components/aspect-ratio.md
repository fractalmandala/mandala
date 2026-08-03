---
title: Aspect Ratio
description: A layout primitive that constrains its child to a fixed width-to-height ratio. Use it anywhere an image, video, or iframe needs to keep its proportions inside a fluid container.
---

# Aspect Ratio

The `AspectRatio` component is a thin wrapper around the underlying `bits-ui` primitive. It accepts a `ratio` prop and renders a container that always maintains the requested `width / height` regardless of the child's intrinsic size.

The styling below is pure indented Sass.

## Tokens

```sass
// ratio is supplied inline via --ratio
$ratio-default: 1 / 1
```

## Mixins

```sass
=aspect-ratio($ratio: $ratio-default)
  position: relative
  width: 100%

  &::before
    content: ""
    display: block
    padding-top: calc(100% / #{$ratio})

  > *
    position: absolute
    inset: 0
    width: 100%
    height: 100%
```

## AspectRatio (root)

The component reads the ratio from an inline `--ratio` custom property and applies it via padding-bottom trick. (The `bits-ui` primitive wraps children in a div whose `padding-bottom` is computed from the ratio.)

```sass
.aspect-ratio
  position: relative
  width: 100%
  overflow: hidden

  // inline-set CSS custom property drives the padding-bottom
  // e.g. style="--ratio: 16 / 9"
  padding-bottom: calc(100% / (var(--ratio, 1)))
  height: 0

  > *
    position: absolute
    inset: 0
    width: 100%
    height: 100%
    display: block
    object-fit: cover
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="aspect-ratio" style="--ratio: 16 / 9">
  <img src="/hero.png" alt="" />
</div>

<div class="aspect-ratio" style="--ratio: 1">
  <Avatar src={user.avatar} />
</div>
```
