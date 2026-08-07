---
title: Popover
description: A modal-less floating panel anchored to a trigger. Used to surface controls, menus, and forms next to the element that opened them — without blocking the rest of the page.
---

# Popover

The `Popover` family is a thin wrapper around the `bits-ui` popover primitive. It supports four anchor sides (`top` / `right` / `bottom` / `left`), an `align` value (`start` / `center` / `end`), and the standard `data-state` open/close animations.

The styling below is pure indented Sass.

## Tokens

```sass
$bg-popover:         hsl(0 0% 100%)
$fg-popover:         hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$ring-foreground-10: hsl(222 47% 11% / 0.1)
$radius-md:          0.375rem
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$transition:         100ms ease-out
$z-popover:          50
$width-default:      18rem        // 288px — `w-72`
$padding:            1rem
$font-size:          0.875rem
$gap-row:            1rem
```

## Mixins

```sass
=popover-state-animations
  &[data-state="open"]
    animation: popover-in $transition forwards
  &[data-state="closed"]
    animation: popover-out $transition forwards

  // side-aware slide direction
  &[data-side="bottom"]
    animation-name: popover-in-bottom
  &[data-side="top"]
    animation-name: popover-in-top
  &[data-side="left"]
    animation-name: popover-in-left
  &[data-side="right"]
    animation-name: popover-in-right

@keyframes popover-in
  from
    opacity: 0
    transform: scale(0.95)
  to
    opacity: 1
    transform: scale(1)

@keyframes popover-out
  from
    opacity: 1
    transform: scale(1)
  to
    opacity: 0
    transform: scale(0.95)

@keyframes popover-in-bottom
  from
    opacity: 0
    transform: translateY(-0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateY(0) scale(1)

@keyframes popover-in-top
  from
    opacity: 0
    transform: translateY(0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateY(0) scale(1)

@keyframes popover-in-left
  from
    opacity: 0
    transform: translateX(0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateX(0) scale(1)

@keyframes popover-in-right
  from
    opacity: 0
    transform: translateX(-0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateX(0) scale(1)
```

## PopoverContent

```sass
.popover-content
  z-index: $z-popover
  display: flex
  flex-direction: column
  gap: $gap-row
  width: $width-default
  padding: $padding
  border: 1px solid $ring-foreground-10
  border-radius: $radius-md
  background-color: $bg-popover
  color: $fg-popover
  font-size: $font-size
  box-shadow: $shadow-md
  outline: none
  transform-origin: var(--transform-origin, center)
  +popover-state-animations
```

## PopoverTrigger

```sass
.popover-trigger
  display: inline-block
  cursor: pointer
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-popover-dark: hsl(222 47% 6%)
  $fg-dark:         hsl(210 40% 98%)
  $fg-muted-dark:   hsl(215 16% 65%)
  $ring-dark:       hsl(210 40% 98% / 0.1)

  .popover-content
    background-color: $bg-popover-dark
    color: $fg-dark
    border-color: $ring-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<button class="popover-trigger" type="button">Open popover</button>

<div class="popover-content" data-state="open" data-side="bottom" style="--transform-origin: center top;">
  <h4>Dimensions</h4>
  <p>Set the dimensions for the layer.</p>

  <label>Width</label>
  <input class="input" type="text" value="100%" />
  <label>Height</label>
  <input class="input" type="text" value="25%" />
</div>
```
