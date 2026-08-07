---
title: Dropdown Menu
description: A right-click / trigger-anchored menu with optional checkboxes, radio groups, sub-menus, separators, labels, and shortcuts. Built on top of `bits-ui` with the same fade + zoom + slide entry animation as `Dialog`.
---

# Dropdown Menu

The `DropdownMenu` family is the most-used shadcn primitive — a popover menu with rich item types. It supports nesting (sub-menus), checkboxes, radio groups, and shortcut hints.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-popover:         hsl(0 0% 100%)
$bg-accent:          hsl(210 40% 96%)
$bg-destructive-10:  hsl(0 84% 60% / 0.1)
$bg-destructive-20:  hsl(0 84% 60% / 0.2)
$fg:                 hsl(222 47% 11%)
$fg-popover:         hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-accent:          hsl(222 47% 11%)
$fg-destructive:     hsl(0 84% 60%)
$border:             hsl(214 32% 91%)
$ring-foreground-10: hsl(222 47% 11% / 0.1)
$radius-md:          0.375rem
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$transition:         100ms ease-out
$z-menu:             50
$min-width:          8rem        // 128px — `min-w-32`
$item-padding-x:     0.5rem
$item-padding-y:     0.375rem
$item-radius:        $radius-md
$item-padding-inset: 2rem        // 32px — `pl-8`
$gap-row:            0.125rem
$padding-menu:       0.25rem
```

## Mixins

```sass
=focus-ring
  outline: none
  box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.4)

=menu-row
  position: relative
  display: flex
  align-items: center
  gap: 0.5rem
  padding: $item-padding-y $item-padding-x
  border-radius: $item-radius
  font-size: 0.875rem
  cursor: default
  user-select: none
  -webkit-user-select: none
  color: inherit
  outline: none
  transition: background-color $transition, color $transition

  &[data-highlighted],
  &:focus-visible
    background-color: $bg-accent
    color: $fg-accent

  &[data-disabled]
    pointer-events: none
    opacity: 0.5

  > svg
    width: 1rem
    height: 1rem
    color: $fg-muted
    flex-shrink: 0
    pointer-events: none
```

## DropdownMenuContent

```sass
.dropdown-menu-content
  z-index: $z-menu
  min-width: $min-width
  max-height: 24rem
  overflow-x: hidden
  overflow-y: auto
  padding: $padding-menu
  border: 1px solid $ring-foreground-10
  border-radius: $radius-md
  background-color: $bg-popover
  color: $fg-popover
  box-shadow: $shadow-md
  outline: none

  // entry/exit animations driven by data-state
  &[data-state="open"]
    animation: dropdown-menu-in $transition forwards
  &[data-state="closed"]
    animation: dropdown-menu-out $transition forwards

  // overflow is hidden while closing so the fade doesn't reveal scrollbar artifacts
  &[data-state="closed"]
    overflow: hidden

@keyframes dropdown-menu-in
  from
    opacity: 0
    transform: scale(0.95)
  to
    opacity: 1
    transform: scale(1)

@keyframes dropdown-menu-out
  from
    opacity: 1
    transform: scale(1)
  to
    opacity: 0
    transform: scale(0.95)
```

## DropdownMenuItem

```sass
.dropdown-menu-item
  +menu-row

  // destructive variant
  &[data-variant="destructive"]
    color: $fg-destructive

    &[data-highlighted],
    &:focus-visible
      background-color: $bg-destructive-10
      color: $fg-destructive

    > svg
      color: $fg-destructive

  // inset (indented by the leading icon's width)
  &[data-inset="true"]
    padding-left: $item-padding-inset

  // nested indicator caret (for sub-menu triggers)
  > .dropdown-menu-item__caret
    margin-left: auto
    width: 1rem
    height: 1rem
    color: $fg-muted
```

## DropdownMenuCheckboxItem

```sass
.dropdown-menu-checkbox-item
  +menu-row
  padding-left: 2rem

  // check icon (visible only when checked)
  > .dropdown-menu-checkbox-item__indicator
    position: absolute
    left: 0.5rem
    width: 1rem
    height: 1rem
    display: inline-flex
    align-items: center
    justify-content: center
    color: $fg-accent
```

## DropdownMenuRadioGroup / RadioItem

```sass
.dropdown-menu-radio-group
  display: flex
  flex-direction: column
  gap: $gap-row

.dropdown-menu-radio-item
  +menu-row
  padding-left: 2rem

  // radio circle indicator
  > .dropdown-menu-radio-item__indicator
    position: absolute
    left: 0.5rem
    width: 0.625rem
    height: 0.625rem
    border-radius: 9999px
    border: 1px solid $border

    .dropdown-menu-radio-item[data-state="checked"] > &
      border-color: $fg-accent
      background-color: $fg-accent
      box-shadow: inset 0 0 0 2px $bg-popover
```

## DropdownMenuLabel

```sass
.dropdown-menu-label
  padding: 0.375rem 0.5rem
  font-size: 0.6875rem
  font-weight: 600
  letter-spacing: 0.05em
  text-transform: uppercase
  color: $fg-muted

  &[data-inset="true"]
    padding-left: $item-padding-inset
```

## DropdownMenuSeparator

```sass
.dropdown-menu-separator
  height: 1px
  margin: 0.25rem 0
  background-color: $border
```

## DropdownMenuShortcut

```sass
.dropdown-menu-shortcut
  margin-left: auto
  display: inline-flex
  align-items: center
  gap: 0.125rem
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
  font-size: 0.6875rem
  color: $fg-muted

  > kbd
    display: inline-flex
    align-items: center
    justify-content: center
    min-width: 1.25rem
    height: 1.25rem
    padding: 0 0.25rem
    border: 1px solid $border
    border-radius: 0.25rem
    background-color: transparent
    font-size: 0.625rem
```

## DropdownMenuSubTrigger / SubContent

A sub-menu opens nested inside the same popover.

```sass
.dropdown-menu-sub-trigger
  +menu-row
  padding-left: $item-padding-x

  > .dropdown-menu-item__caret
    margin-left: auto
    transform: rotate(-90deg)

.dropdown-menu-sub-content
  z-index: $z-menu
  min-width: $min-width
  padding: $padding-menu
  border: 1px solid $ring-foreground-10
  border-radius: $radius-md
  background-color: $bg-popover
  color: $fg-popover
  box-shadow: $shadow-md
  outline: none
  +same entry/exit as DropdownMenuContent
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-popover-dark:        hsl(222 47% 6%)
  $bg-accent-dark:         hsl(217 33% 17%)
  $bg-destructive-20-dark: hsl(0 84% 60% / 0.2)
  $fg-dark:                hsl(210 40% 98%)
  $fg-muted-dark:          hsl(215 16% 65%)
  $fg-destructive-dark:    hsl(0 84% 70%)
  $border-dark:            hsl(217 33% 17%)
  $ring-dark:              hsl(210 40% 98% / 0.1)

  .dropdown-menu-content
    background-color: $bg-popover-dark
    color: $fg-dark
    border-color: $ring-dark

  .dropdown-menu-item
    &[data-highlighted],
    &:focus-visible
      background-color: $bg-accent-dark
      color: $fg-dark
    &[data-variant="destructive"]
      color: $fg-destructive-dark
      &[data-highlighted]
        background-color: $bg-destructive-20-dark

  .dropdown-menu-label
    color: $fg-muted-dark

  .dropdown-menu-separator
    background-color: $border-dark

  .dropdown-menu-shortcut > kbd
    border-color: $border-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<button class="button button--outline" type="button">Open menu</button>

<div class="dropdown-menu-content">
  <div class="dropdown-menu-label">My account</div>
  <div class="dropdown-menu-separator"></div>

  <div class="dropdown-menu-item">Profile</div>
  <div class="dropdown-menu-item">Settings</div>
  <div class="dropdown-menu-item">
    Keyboard shortcuts
    <span class="dropdown-menu-shortcut"><kbd>⌘</kbd><kbd>K</kbd></span>
  </div>

  <div class="dropdown-menu-separator"></div>

  <div class="dropdown-menu-item" data-variant="destructive">Sign out</div>
</div>
```
