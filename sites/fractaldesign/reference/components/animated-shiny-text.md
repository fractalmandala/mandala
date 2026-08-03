---
title: Animated Shiny Text
description: A text effect that wipes a bright gradient across a string of muted text — similar to a hero-section headline animation. Used to draw attention to a piece of static text without using motion or sound.
---

# Animated Shiny Text

The `AnimatedShinyText` component renders a `<span>` whose background is a horizontal gradient that animates `background-position` from `0 0` to a negative offset. The text color is set to `transparent` and the background is clipped to the text shape, so the gradient appears to slide through the glyphs.

The styling below is pure indented Sass.

## Tokens

```sass
$fg-muted-light:     hsl(0 0% 0% / 0.7)
$fg-muted-dark:      hsl(0 0% 100% / 0.7)
$highlight-light:    hsl(0 0% 0% / 0.8)
$highlight-dark:     hsl(0 0% 100% / 0.8)
$transparent:        transparent
$shimmer-width:      100px        // default
$animation-duration: 1s
$animation-timing:   cubic-bezier(0.6, 0.6, 0, 1)
$max-width:          28rem        // 448px — `max-w-md`
```

## Mixins

```sass
=shiny-gradient($from, $highlight, $to)
  background-image: linear-gradient(to right, $from, $highlight 50%, $to)
```

## AnimatedShinyText (root)

```sass
.animated-shiny-text
  display: inline-block
  margin-left: auto
  margin-right: auto
  max-width: $max-width
  color: $fg-muted-light
  background-size: var(--shiny-width, #{$shimmer-width}) 100%
  background-position: 0 0
  background-repeat: no-repeat
  background-clip: text
  -webkit-background-clip: text
  +shiny-gradient($transparent, $highlight-light, $transparent)
  transition: background-position $animation-duration $animation-timing infinite

  // the slide
  animation: shiny-text-slide calc(#{$animation-duration} * 3) $animation-timing infinite

@keyframes shiny-text-slide
  0%
    background-position: 0 0
  100%
    background-position: calc(var(--shiny-width, #{$shimmer-width}) * -1) 0
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  .animated-shiny-text
    color: $fg-muted-dark
    +shiny-gradient($transparent, $highlight-dark, $transparent)
```

## Reduced motion

```sass
@media (prefers-reduced-motion: reduce)
  .animated-shiny-text
    animation: none
    background-position: 0 0
```

## Usage skeleton (Svelte, for reference)

```svelte
<span class="animated-shiny-text" style="--shiny-width: 120px">
  Introducing the all-new AI Elements library
</span>
```
