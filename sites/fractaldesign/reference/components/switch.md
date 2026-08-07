---
title: Switch
description: A binary toggle (on / off) used for instant settings changes. Built on top of `bits-ui`'s switch primitive.
---

# Switch

The `Switch` family is a binary toggle styled as a pill with a draggable thumb. Toggling produces a smooth color and translation animation.

The styling below is pure indented Sass.

## Tokens

```sass
$bg-primary:         hsl(222 47% 11%)
$bg-muted:           hsl(210 40% 96%)
$border-ring-50:     hsl(222 47% 11% / 0.5)
$radius-full:        9999px

$height:             1.25rem       // 20px — `h-5`
$width:              2.25rem       // 36px — `w-9`
$thumb-size:         1rem          // 16px — `size-4`
$thumb-translate:    1rem          // 16px when checked
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$ring-width:         3px
$shadow-thumb:       0 1px 3px 0 hsl(0 0% 0% / 0.2)
```

## Mixins

```sass
=focus-ring
  outline: none
  box-shadow: 0 0 0 $ring-width $border-ring-50

=disabled
  pointer-events: none
  cursor: not-allowed
  opacity: 0.5
```

## Switch (root)

```sass
.switch
  position: relative
  display: inline-flex
  flex-shrink: 0
  align-items: center
  width: $width
  height: $height
  border: 1px solid transparent
  border-radius: $radius-full
  background-color: $bg-muted
  cursor: pointer
  outline: none
  transition: background-color $transition

  &:focus-visible
    +focus-ring

  &[data-state="checked"]
    background-color: $bg-primary

  &[data-disabled]
    +disabled
```

## SwitchThumb

The draggable thumb. Slides between the off (`translate-x-0`) and on (`translate-x-1rem`) positions.

```sass
.switch-thumb
  display: block
  width: $thumb-size
  height: $thumb-size
  border-radius: $radius-full
  background-color: hsl(0 0% 100%)
  box-shadow: $shadow-thumb
  transition: transform $transition

  // unchecked position
  transform: translateX(0.125rem)

  .switch[data-state="checked"] &
    transform: translateX(calc(#{$width} - #{$thumb-size} - 0.25rem))
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-muted-dark:   hsl(217 33% 22%)
  $bg-primary-dark: hsl(210 40% 98%)

  .switch
    background-color: $bg-muted-dark
    &[data-state="checked"]
      background-color: $bg-primary-dark

  .switch-thumb
    background-color: hsl(222 47% 6%)
```

## Usage skeleton (Svelte, for reference)

```svelte
<button class="switch" data-state="checked" type="button" role="switch" aria-checked="true">
  <span class="switch-thumb"></span>
</button>
```
