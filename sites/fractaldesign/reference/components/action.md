---
title: Action
description: A compact icon button (with optional tooltip) used inside message rows or toolbars to trigger quick actions like copy, regenerate, like, or share.
---

# Action

The `Action` family provides a small icon-only button (`Action`) and a horizontal row container (`Actions`) for laying out multiple actions next to each other. `Action` supports an optional tooltip wrapper around a shadcn-style button and exposes a screen-reader-only label for accessibility.

The styling below recreates the same appearance in pure indented Sass — a 36×36 ghost-style button with a 1.5px-internal padding, muted foreground color that lifts to the regular foreground on hover, and a tight `gap` between adjacent actions.

## Tokens

```sass
$fg:                hsl(222 47% 11%)
$fg-muted:          hsl(215 16% 47%)
$bg:                hsl(0 0% 100%)
$bg-hover:          hsl(210 40% 96%)
$border:            transparent
$radius-md:         0.375rem
$transition:        150ms cubic-bezier(0.4, 0, 0.2, 1)
$action-size:       2.25rem       // 36px  — matches `size-9`
$action-padding:    0.375rem      // 6px   — matches `p-1.5`
$action-icon-size:  1rem          // 16px  — matches shadcn default inner svg size
$gap:               0.25rem       // 4px   — matches `gap-1`
```

## Mixins

```sass
=icon-button-base
  display: inline-flex
  align-items: center
  justify-content: center
  border: 1px solid $border
  border-radius: $radius-md
  background-color: transparent
  cursor: pointer
  transition: background-color $transition, color $transition, transform $transition
  user-select: none
  -webkit-user-select: none

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px

  &:disabled
    pointer-events: none
    opacity: 0.5

  &:active
    transform: translateY(1px)

=visually-hidden
  position: absolute
  width: 1px
  height: 1px
  padding: 0
  margin: -1px
  overflow: hidden
  clip: rect(0, 0, 0, 0)
  white-space: nowrap
  border: 0
```

## Action (the icon button)

```sass
.action
  position: relative
  +icon-button-base()
  width: $action-size
  height: $action-size
  padding: $action-padding
  color: $fg-muted

  &:hover
    background-color: $bg-hover
    color: $fg

  // inner SVG inherits color and is sized to the standard 1rem
  > svg
    width: $action-icon-size
    height: $action-icon-size
    pointer-events: none
    flex-shrink: 0

  // visually-hidden label for screen readers
  &__label
    +visually-hidden
```

### Action variants

The original `Button` primitive exposes `ghost` (default), `outline`, `secondary`, `destructive`, and `link`. The `Action` component defaults to `ghost`. The other variants are inherited directly from the underlying button — define them once on `.action` and override per instance:

```sass
.action
  // default — ghost
  // (already styled above)

  &--outline
    border-color: hsl(214 32% 91%)
    background-color: $bg

    &:hover
      background-color: $bg-hover

  &--secondary
    background-color: hsl(210 40% 96%)
    color: $fg

    &:hover
      background-color: hsl(214 32% 91%)

  &--destructive
    background-color: hsl(0 84% 60% / 0.1)
    color: hsl(0 84% 60%)

    &:hover
      background-color: hsl(0 84% 60% / 0.2)
```

## Actions (row container)

```sass
.actions
  display: flex
  align-items: center
  gap: $gap
```

## Tooltip wrapper

`Action` optionally wraps itself in a tooltip. The tooltip is rendered through a portal that floats above all other content with a small offset and a dark, rounded background.

```sass
.tooltip
  position: relative
  display: inline-block

  &__trigger
    display: inline-flex

  &__content
    position: absolute
    bottom: calc(100% + 0.5rem)
    left: 50%
    transform: translateX(-50%)
    padding: 0.375rem 0.625rem
    border-radius: $radius-md
    background-color: hsl(222 47% 11%)
    color: hsl(210 40% 98%)
    font-size: 0.75rem
    line-height: 1rem
    white-space: nowrap
    pointer-events: none
    z-index: 50
    box-shadow: 0 4px 12px hsl(0 0% 0% / 0.15)

    &::after
      content: ""
      position: absolute
      top: 100%
      left: 50%
      transform: translateX(-50%)
      border: 4px solid transparent
      border-top-color: hsl(222 47% 11%)
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $fg-dark:       hsl(210 40% 98%)
  $fg-muted-dark: hsl(215 16% 65%)
  $bg-hover-dark: hsl(217 33% 17%)

  .action
    color: $fg-muted-dark

    &:hover
      background-color: $bg-hover-dark
      color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="actions">
  <button class="action" type="button" aria-label="Copy message">
    <Copy />
    <span class="action__label">Copy message</span>
  </button>

  <button class="action" type="button" aria-label="Regenerate">
    <Refresh />
    <span class="action__label">Regenerate</span>
  </button>
</div>
```
