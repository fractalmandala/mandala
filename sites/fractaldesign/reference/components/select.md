---
title: Select
description: A native-feeling dropdown picker for choosing one or more values from a list. Supports search-as-you-type, groups, checkboxes, scroll buttons, and keyboard navigation.
---

# Select

The `Select` family is a thin wrapper around the `bits-ui` select primitive. It renders a trigger (a button that looks like an input) and a popover with a scrollable list of items.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-popover:         hsl(0 0% 100%)
$bg-accent:          hsl(210 40% 96%)
$bg-muted:           hsl(210 40% 96%)
$bg-input-30:        hsl(217 33% 17% / 0.3)
$bg-input-50:        hsl(217 33% 17% / 0.5)
$fg:                 hsl(222 47% 11%)
$fg-popover:         hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-foreground-60:   hsl(222 47% 11% / 0.6)
$border:             hsl(214 32% 91%)
$border-input:       hsl(217 33% 17%)
$border-ring-50:     hsl(222 47% 11% / 0.5)
$border-destructive-20: hsl(0 84% 60% / 0.2)
$border-destructive-40: hsl(0 84% 60% / 0.4)
$border-destructive-50: hsl(0 84% 60% / 0.5)
$ring-foreground-10: hsl(222 47% 11% / 0.1)

$radius-md:          0.375rem
$shadow-xs:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$ring-width:         3px

$height-default:     2.25rem       // 36px — `h-9`
$height-sm:          2rem          // 32px — `h-8`
$padding-x:          0.625rem      // 10px — `px-2.5`
$padding-y:          0.5rem        // 8px  — `py-2`
$gap-row:            0.375rem      // 6px  — `gap-1.5`

$min-width:          9rem          // 144px — `min-w-36`
$icon-size:          1rem          // 16px — `size-4`
```

## Mixins

```sass
=focus-ring($color: $border-ring-50)
  outline: none
  box-shadow: 0 0 0 $ring-width $color

=disabled
  pointer-events: none
  cursor: not-allowed
  opacity: 0.5

=invalid-ring
  box-shadow: 0 0 0 $ring-width $border-destructive-20
  border-color: hsl(0 84% 60%)
```

## SelectTrigger

The button that opens the popover.

```sass
.select-trigger
  display: inline-flex
  width: fit-content
  align-items: center
  justify-content: space-between
  gap: $gap-row
  padding: $padding-y $padding-x
  border: 1px solid $border-input
  border-radius: $radius-md
  background-color: transparent
  color: $fg
  font-size: 0.875rem
  white-space: nowrap
  box-shadow: $shadow-xs
  outline: none
  cursor: default
  transition: color $transition, box-shadow $transition

  // placeholder color (when no value selected)
  &[data-placeholder]
    color: $fg-muted

  &:focus-visible
    border-color: $border-ring-50
    +focus-ring

  &[aria-invalid="true"]
    +invalid-ring

  &:disabled
    +disabled

  // size variants
  &[data-size="default"]
    height: $height-default

  &[data-size="sm"]
    height: $height-sm

  // value text and trailing chevron
  > [data-slot="select-value"]
    display: flex
    align-items: center
    gap: $gap-row
    flex: 1 1 auto
    line-clamp: 1
    text-overflow: ellipsis
    overflow: hidden

  > svg
    pointer-events: none
    flex-shrink: 0
    width: $icon-size
    height: $icon-size
    color: $fg-muted
```

## SelectContent

The popover panel.

```sass
.select-content
  position: relative
  z-index: 50
  min-width: $min-width
  max-height: 24rem
  overflow-x: hidden
  overflow-y: auto
  border: 1px solid $ring-foreground-10
  border-radius: $radius-md
  background-color: $bg-popover
  color: $fg-popover
  box-shadow: $shadow-md
  transform-origin: var(--transform-origin, center)

  // open/close animations
  &[data-state="open"]
    animation: select-in 100ms ease-out forwards
  &[data-state="closed"]
    animation: select-out 100ms ease-out forwards
    overflow: hidden

  // side-aware slide
  &[data-side="bottom"][data-state="open"]
    animation-name: select-in-bottom
  &[data-side="top"][data-state="open"]
    animation-name: select-in-top
  &[data-side="left"][data-state="open"]
    animation-name: select-in-left
  &[data-side="right"][data-state="open"]
    animation-name: select-in-right

@keyframes select-in
  from
    opacity: 0
    transform: scale(0.95)
  to
    opacity: 1
    transform: scale(1)

@keyframes select-out
  from
    opacity: 1
    transform: scale(1)
  to
    opacity: 0
    transform: scale(0.95)

@keyframes select-in-bottom
  from
    opacity: 0
    transform: translateY(-0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateY(0) scale(1)

@keyframes select-in-top
  from
    opacity: 0
    transform: translateY(0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateY(0) scale(1)

@keyframes select-in-left
  from
    opacity: 0
    transform: translateX(0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateX(0) scale(1)

@keyframes select-in-right
  from
    opacity: 0
    transform: translateX(-0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateX(0) scale(1)
```

## SelectViewport

The scrollable inner region inside the popover.

```sass
.select-viewport
  padding: $padding-y
```

## SelectItem

A single selectable row.

```sass
.select-item
  position: relative
  display: flex
  width: 100%
  align-items: center
  gap: $gap-row
  padding: $padding-y calc(#{$padding-x} * 2)
  border-radius: $radius-md
  font-size: 0.875rem
  cursor: default
  user-select: none
  -webkit-user-select: none
  outline: none
  color: $fg
  transition: background-color $transition, color $transition

  // selected — soft accent background
  &[data-highlighted],
  &:focus-visible
    background-color: $bg-accent
    color: $fg

  &[data-state="checked"]
    color: $fg

  &[data-disabled]
    pointer-events: none
    opacity: 0.5

  // leading check icon — only visible when selected
  > [data-slot="select-item-indicator"]
    position: absolute
    left: $padding-x
    display: inline-flex
    align-items: center
    justify-content: center
    width: $icon-size
    height: $icon-size
    color: $fg

    > svg
      width: 1rem
      height: 1rem
```

## SelectItemText

The text label of the selected item.

```sass
.select-item-text
  flex: 1 1 auto
  font-size: 0.875rem
  white-space: nowrap
  text-overflow: ellipsis
  overflow: hidden
```

## SelectGroup / SelectLabel / SelectSeparator

```sass
.select-group
  display: flex
  flex-direction: column
  gap: 0.125rem

.select-label
  padding: 0.5rem 0.625rem
  font-size: 0.6875rem
  font-weight: 600
  text-transform: uppercase
  letter-spacing: 0.05em
  color: $fg-muted

.select-separator
  height: 1px
  margin: 0.25rem 0
  background-color: $border
```

## SelectScrollUpButton / SelectScrollDownButton

Floating buttons that appear when the list is scrollable in that direction.

```sass
.select-scroll-up-button,
.select-scroll-down-button
  display: flex
  align-items: center
  justify-content: center
  height: 1.5625rem
  padding: 0
  border: 0
  background-color: transparent
  color: $fg-muted
  cursor: default
  position: sticky

  > svg
    width: $icon-size
    height: $icon-size

.select-scroll-up-button
  top: 0
  z-index: 1

.select-scroll-down-button
  bottom: 0
  z-index: 1
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-popover-dark:        hsl(222 47% 6%)
  $bg-accent-dark:         hsl(217 33% 17%)
  $bg-input-30-dark:       hsl(217 33% 22% / 0.3)
  $bg-input-50-dark:       hsl(217 33% 22% / 0.5)
  $fg-dark:                hsl(210 40% 98%)
  $fg-muted-dark:          hsl(215 16% 65%)
  $fg-foreground-60-dark:  hsl(210 40% 98% / 0.6)
  $border-input-dark:      hsl(217 33% 22%)
  $border-destructive-40-dark: hsl(0 84% 60% / 0.4)
  $border-destructive-50-dark: hsl(0 84% 60% / 0.5)
  $ring-dark:              hsl(210 40% 98% / 0.1)

  .select-trigger
    background-color: $bg-input-30-dark
    border-color: $border-input-dark
    color: $fg-dark
    &[data-placeholder]
      color: $fg-muted-dark
    &:hover
      background-color: $bg-input-50-dark

  .select-content
    background-color: $bg-popover-dark
    color: $fg-dark
    border-color: $ring-dark

  .select-item
    color: $fg-dark
    &[data-highlighted],
    &:focus-visible
      background-color: $bg-accent-dark
      color: $fg-dark

  .select-label,
  .select-scroll-up-button,
  .select-scroll-down-button
    color: $fg-muted-dark

  .select-separator
    background-color: $border-input-dark

  // invalid state in dark mode
  .select-trigger[aria-invalid="true"]
    box-shadow: 0 0 0 $ring-width $border-destructive-40-dark
    border-color: $border-destructive-50-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<button class="select-trigger" type="button" data-size="default" data-placeholder>
  <span data-slot="select-value">Select a model</span>
  <ChevronDown />
</button>

<div class="select-content" data-state="open" data-side="bottom">
  <div class="select-viewport">
    <div class="select-group">
      <div class="select-label">Anthropic</div>
      <div class="select-item">
        <span data-slot="select-item-indicator"><Check /></span>
        <span class="select-item-text">Claude 3.5 Sonnet</span>
      </div>
    </div>
    <div class="select-separator"></div>
  </div>
</div>
```
