---
title: Tabs
description: A horizontal or vertical switcher between content panels. Two visual variants (default pill, line) and full keyboard navigation.
---

# Tabs

The `Tabs` family is a thin wrapper around the `bits-ui` tabs primitive. It supports a `default` pill variant (a single rounded background containing all triggers) and a `line` variant (each trigger is a separate item with an animated underline that follows the active one).

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-input-30:        hsl(217 33% 17% / 0.3)
$bg-foreground:      hsl(222 47% 11%)
$fg:                 hsl(222 47% 11%)
$fg-foreground:      hsl(222 47% 11%)
$fg-foreground-60:   hsl(222 47% 11% / 0.6)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$border-input:       hsl(217 33% 17%)
$border-ring-50:     hsl(222 47% 11% / 0.5)
$ring-foreground-10: hsl(222 47% 11% / 0.1)

$radius-md:          0.375rem
$radius-lg:          0.5rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$ring-width:         3px

$list-height:        2.25rem     // 36px — `h-9`
$trigger-padding-x:  0.5rem      // 8px  — `px-2`
$trigger-padding-y:  0.25rem     // 4px  — `py-1`
$font-size:          0.875rem
$gap-row:            0.5rem
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
```

## Tabs (root)

```sass
.tabs
  display: flex
  flex-direction: column
  gap: $gap-row
  width: 100%
  color: $fg-foreground-60
  outline: none

  &[data-orientation="horizontal"]
    flex-direction: column

  &[data-orientation="vertical"]
    flex-direction: row
    gap: 1rem
```

## TabsList

A rounded background strip containing the triggers.

```sass
.tabs-list
  display: inline-flex
  align-items: center
  justify-content: center
  padding: 0.1875rem     // 3px — `p-[3px]`
  border-radius: $radius-lg
  background-color: $bg-muted
  color: $fg-muted

  // horizontal orientation
  &[data-orientation="horizontal"]
    height: $list-height

  // vertical orientation — stack columns
  &[data-orientation="vertical"]
    flex-direction: column
    height: fit-content

  // line variant
  &[data-variant="line"]
    background-color: transparent
    border-radius: 0
    padding: 0
    gap: 0.25rem

  &[data-orientation="horizontal"][data-variant="line"]
    border-bottom: 1px solid $border
```

## TabsTrigger

A single tab.

```sass
.tabs-trigger
  position: relative
  display: inline-flex
  flex: 1 1 0%
  align-items: center
  justify-content: center
  gap: 0.375rem
  height: calc(100% - 1px)
  padding: $trigger-padding-y $trigger-padding-x
  border: 1px solid transparent
  border-radius: $radius-md
  background-color: transparent
  color: $fg-foreground-60
  font-size: $font-size
  font-weight: 500
  white-space: nowrap
  cursor: pointer
  outline: none
  user-select: none
  -webkit-user-select: none
  transition: all $transition

  &:focus-visible
    +focus-ring

  &[data-state="active"],
  &[data-active="true"]
    background-color: $bg
    color: $fg-foreground
    box-shadow: 0 1px 2px 0 hsl(0 0% 0% / 0.05)

  &[data-disabled]
    +disabled

  > svg
    width: 1rem
    height: 1rem
    flex-shrink: 0
    pointer-events: none

  // line variant — animated underline
  .tabs-list[data-variant="line"] &::after
    content: ""
    position: absolute
    background-color: $fg-foreground
    opacity: 0
    transition: opacity $transition

  .tabs-list[data-orientation="horizontal"][data-variant="line"] &::after
    right: 0
    bottom: -0.3125rem       // -5px — `bottom-[-5px]`
    left: 0
    height: 0.125rem         // 2px   — `h-0.5`

  .tabs-list[data-orientation="vertical"][data-variant="line"] &::after
    top: 0
    bottom: 0
    right: -0.25rem          // -4px
    width: 0.125rem

  .tabs-list[data-variant="line"] &[data-state="active"]::after
    opacity: 1
```

## TabsContent

The panel shown when a trigger is active.

```sass
.tabs-content
  flex: 1 1 auto
  outline: none
  font-size: $font-size
  color: $fg

  &:focus-visible
    +focus-ring
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-muted-dark:        hsl(217 33% 17%)
  $bg-input-30-dark:     hsl(217 33% 22% / 0.3)
  $bg-foreground-dark:   hsl(210 40% 98%)
  $fg-foreground-dark:   hsl(210 40% 98%)
  $fg-foreground-60-dark: hsl(210 40% 98% / 0.6)
  $fg-muted-dark:        hsl(215 16% 65%)
  $border-input-dark:    hsl(217 33% 22%)
  $border-dark:          hsl(217 33% 17%)
  $ring-dark:            hsl(210 40% 98% / 0.1)

  .tabs
    color: $fg-foreground-60-dark

  .tabs-list
    background-color: $bg-muted-dark
    color: $fg-muted-dark
    &[data-variant="line"]
      background-color: transparent
    &[data-orientation="horizontal"][data-variant="line"]
      border-bottom-color: $border-dark

  .tabs-trigger
    color: $fg-muted-dark
    &:hover
      color: $fg-foreground-dark
    &[data-state="active"]
      background-color: $bg-input-30-dark
      color: $fg-foreground-dark
      border-color: $border-input-dark

    .tabs-list[data-variant="line"] &::after
      background-color: $fg-foreground-dark

  .tabs-content
    color: $fg-foreground-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="tabs">
  <div class="tabs-list" data-orientation="horizontal" data-variant="default" role="tablist">
    <button class="tabs-trigger" data-state="active" type="button" role="tab" aria-selected="true">
      Account
    </button>
    <button class="tabs-trigger" type="button" role="tab" aria-selected="false">
      Password
    </button>
  </div>

  <div class="tabs-content" role="tabpanel">
    <p>Account settings content.</p>
  </div>
</div>
```
