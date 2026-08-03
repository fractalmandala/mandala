---
title: Button Group
description: A container that joins multiple buttons (or inputs/selects) into a single segmented control. Buttons inside share their borders and corner radii so they form a seamless pill. Supports horizontal and vertical orientations.
---

# Button Group

The `ButtonGroup` family is the segmented-control primitive — a horizontal or vertical row of buttons that visually merge into one element. Adjacent buttons drop their inner border radius and their border edge so the row reads as a single connected piece.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$border-input:       hsl(217 33% 17%)
$radius-md:          0.375rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$ring-width:         3px
$ring-color:         hsl(222 47% 11% / 0.5)
$gap-row:            0.5rem
$min-height:         2.25rem
```

## Mixins

```sass
=focus-ring
  outline: none
  box-shadow: 0 0 0 $ring-width $ring-color
```

## ButtonGroup (root)

A flex container that holds the joined children.

```sass
.button-group
  display: flex
  width: fit-content
  align-items: stretch
  gap: 0

  // every child stacks against the next
  > [data-slot]
    position: relative

    // z-index lift when focused, so the focus ring isn't clipped by the next sibling's border
    &:focus-visible
      position: relative
      z-index: 10

  // when a select trigger hides inside the group, give it the same width handling
  > select[aria-hidden="true"]:last-child
    + .button-group > [data-slot="select-trigger"]:last-of-type
      border-top-right-radius: $radius-md
      border-bottom-right-radius: $radius-md

  > [data-slot="select-trigger"]:not([class*="w-"])
    width: fit-content

  > input
    flex: 1 1 auto

  // container-of-container gap (when nesting one group inside another)
  &:has([data-slot="button-group"])
    gap: $gap-row
```

## Orientation variants

```sass
.button-group--horizontal
  flex-direction: row

  // siblings snap together — drop right radius, drop left border
  > [data-slot]
    border-top-right-radius: 0
    border-bottom-right-radius: 0

  // the very last child gets its right radius back
  > [data-slot]:not(:has(~ [data-slot]))
    border-top-right-radius: $radius-md
    border-bottom-right-radius: $radius-md

  // any child that has a sibling to its right drops its left radius and left border
  > [data-slot] ~ [data-slot]
    border-top-left-radius: 0
    border-bottom-left-radius: 0
    border-left-width: 0

.button-group--vertical
  flex-direction: column

  > [data-slot]
    border-bottom-right-radius: 0
    border-bottom-left-radius: 0

  > [data-slot]:not(:has(~ [data-slot]))
    border-bottom-right-radius: $radius-md
    border-bottom-left-radius: $radius-md

  > [data-slot] ~ [data-slot]
    border-top-left-radius: 0
    border-top-right-radius: 0
    border-top-width: 0
```

## ButtonGroupText (a non-interactive label slot)

Sometimes the middle of a button group is a static label (e.g. `2 of 3`) rather than a button. `ButtonGroupText` is the slot for that.

```sass
.button-group-text
  display: inline-flex
  align-items: center
  padding: 0 0.5rem
  background-color: transparent
  border: 0
  box-shadow: none
  color: $fg-muted
  font-size: 0.75rem
  font-weight: 500
  user-select: none
  -webkit-user-select: none
```

## ButtonGroupSeparator

A 1px divider between groups of buttons (when the user wants a visible split rather than a continuous strip).

```sass
.button-group-separator
  align-self: stretch
  width: 1px
  margin: 0 0.25rem
  background-color: $border

  .button-group--vertical &
    width: auto
    height: 1px
    margin: 0.25rem 0
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $fg-muted-dark:   hsl(215 16% 65%)
  $border-dark:     hsl(217 33% 17%)

  .button-group-text
    color: $fg-muted-dark

  .button-group-separator
    background-color: $border-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="button-group button-group--horizontal">
  <button class="button button--outline" type="button">Day</button>
  <button class="button button--outline" type="button">Week</button>
  <span class="button-group-text">2 of 12</span>
  <button class="button button--outline" type="button">Month</button>
</div>
```
