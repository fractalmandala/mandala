---
title: Carousel
description: A horizontal/vertical sliding carousel built on top of Embla. Includes previous/next buttons, item rows with hidden overflow, and keyboard navigation. Used inside `InlineCitationCarousel` for stacked citation cards.
---

# Carousel

The `Carousel` family is a thin Embla wrapper that adds shadcn-style `CarouselContent`, `CarouselItem`, `CarouselPrevious`, and `CarouselNext` primitives. It supports horizontal and vertical orientations, optional looping, and keyboard arrow keys.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$radius-full:        9999px
$radius-md:          0.375rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$button-size:        2rem        // 32px — `size-8`
$slide-basis:        100%        // one slide per view by default
$gap-row:            0.5rem
```

## Mixins

```sass
=focus-ring
  outline: none
  box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.4)

=carousel-button
  display: inline-flex
  align-items: center
  justify-content: center
  width: $button-size
  height: $button-size
  border: 1px solid $border
  border-radius: $radius-full
  background-color: $bg
  color: $fg-muted
  cursor: pointer
  transition: background-color $transition, color $transition, transform $transition

  &:hover:not(:disabled)
    background-color: $bg-muted
    color: $fg

  &:focus-visible
    +focus-ring

  &:disabled
    pointer-events: none
    opacity: 0.4

  > svg
    width: 1rem
    height: 1rem
    flex-shrink: 0
```

## Carousel (root)

```sass
.carousel
  position: relative
  width: 100%

  &[data-orientation="vertical"]
    height: 100%
```

## CarouselContent

The scroll container. Items are laid out in a flex row (or column for vertical) with negative margins to compensate for the inner slide padding.

```sass
.carousel-content
  display: flex
  overflow: hidden
  margin: calc(-1 * $gap-row)

  .carousel[data-orientation="vertical"] &
    flex-direction: column
    height: 100%
```

## CarouselItem

Each slide.

```sass
.carousel-item
  flex: 0 0 $slide-basis
  min-width: 0
  padding: $gap-row
  box-sizing: border-box

  .carousel[data-orientation="vertical"] &
    flex: 0 0 auto
    height: $slide-basis
```

## CarouselPrevious / CarouselNext

Floating circular buttons positioned on the left and right edges of the carousel.

```sass
.carousel-previous
  +carousel-button
  position: absolute
  top: 50%
  left: -1rem
  transform: translateY(-50%)

  .carousel[data-orientation="vertical"] &
    top: -1rem
    left: 50%
    transform: translateX(-50%) rotate(90deg)

.carousel-next
  +carousel-button
  position: absolute
  top: 50%
  right: -1rem
  transform: translateY(-50%)

  .carousel[data-orientation="vertical"] &
    bottom: -1rem
    top: auto
    left: 50%
    transform: translateX(-50%) rotate(90deg)
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:        hsl(222 47% 6%)
  $bg-muted-dark:  hsl(217 33% 17%)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)
  $border-dark:    hsl(217 33% 17%)

  .carousel-previous,
  .carousel-next
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-muted-dark
    &:hover:not(:disabled)
      background-color: $bg-muted-dark
      color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="carousel">
  <div class="carousel-content">
    {#each items as item}
      <div class="carousel-item">
        <img src={item.image} alt={item.title} />
      </div>
    {/each}
  </div>

  <button class="carousel-previous" type="button" aria-label="Previous">
    <ArrowLeft />
  </button>
  <button class="carousel-next" type="button" aria-label="Next">
    <ArrowRight />
  </button>
</div>
```
