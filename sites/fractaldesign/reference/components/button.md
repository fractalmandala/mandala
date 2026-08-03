---
title: Button
description: The foundational interactive primitive — a button or anchor element with five visual variants (default, outline, secondary, ghost, destructive, link) and seven sizes (default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg). Used everywhere a clickable affordance is needed.
---

# Button

The `Button` component is the workhorse interactive element. It renders as either a `<button>` (default) or an `<a>` (when an `href` is provided). It supports a `variant` prop and a `size` prop, both backed by a design token system.

The styling below is pure indented Sass. Variants and sizes are reproduced as named modifier classes that can be combined freely.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-primary:         hsl(222 47% 11%)
$bg-primary-hover:   hsl(222 47% 15%)
$bg-secondary:       hsl(210 40% 96%)
$bg-secondary-hover: hsl(210 40% 92%)
$bg-muted:           hsl(210 40% 96%)
$bg-muted-hover:     hsl(210 40% 92%)
$bg-destructive-10:  hsl(0 84% 60% / 0.1)
$bg-destructive-20:  hsl(0 84% 60% / 0.2)
$bg-input-30:        hsl(217 33% 17% / 0.3)
$bg-input-50:        hsl(217 33% 17% / 0.5)

$fg:                 hsl(222 47% 11%)
$fg-primary:         hsl(222 47% 11%)
$fg-primary-fg:      hsl(210 40% 98%)
$fg-muted:           hsl(215 16% 47%)
$fg-destructive:     hsl(0 84% 60%)
$fg-destructive-90:  hsl(0 84% 60% / 0.9)

$border:             hsl(214 32% 91%)
$border-input:       hsl(217 33% 17%)
$border-ring:        hsl(222 47% 11% / 0.5)

$radius-md:          0.375rem
$radius-8:           8px

$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$shadow-xs:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$ring-width:         3px

$font-size-default:  0.875rem    // text-sm
$font-size-xs:       0.75rem     // text-xs
$font-weight:        500
```

## Mixins

```sass
=focus-ring($color: $border-ring)
  outline: none
  box-shadow: 0 0 0 $ring-width hsl(0 0% 100% / 0), 0 0 0 $ring-width $color

=disabled
  pointer-events: none
  opacity: 0.5

=button-base
  display: inline-flex
  flex-shrink: 0
  align-items: center
  justify-content: center
  border: 1px solid transparent
  border-radius: $radius-md
  background-clip: padding-box
  font-weight: $font-weight
  white-space: nowrap
  cursor: pointer
  user-select: none
  -webkit-user-select: none
  transition: all $transition
  outline: none

  &:focus-visible
    +focus-ring

  &:disabled
    +disabled

  // when nested in a button-group, snap corners to align with siblings
  [data-slot="button-group"] > &
    border-radius: $radius-md

  // nested SVG
  > svg
    pointer-events: none
    flex-shrink: 0
    width: 1rem
    height: 1rem
```

## Button (root — default variant + default size)

```sass
.button
  +button-base
  height: 2.25rem        // 36px — `h-9`
  gap: 0.375rem          // 6px   — `gap-1.5`
  padding: 0 0.625rem    // 10px  — `px-2.5`
  font-size: $font-size-default
  background-color: $bg-primary
  color: $fg-primary-fg

  &:hover:not(:disabled)
    background-color: $bg-primary-hover

  &:active:not([aria-haspopup])
    transform: translateY(1px)

  &[aria-invalid="true"]
    border-color: $fg-destructive
    box-shadow: 0 0 0 $ring-width hsl(0 84% 60% / 0.2)
```

## Variants

```sass
.button--default
  background-color: $bg-primary
  color: $fg-primary-fg
  &:hover:not(:disabled)
    background-color: $bg-primary-hover

.button--outline
  border-color: $border
  background-color: $bg
  color: $fg
  box-shadow: $shadow-xs
  &:hover:not(:disabled)
    background-color: $bg-muted
    color: $fg
  &[aria-expanded="true"]
    background-color: $bg-muted
    color: $fg

.button--secondary
  background-color: $bg-secondary
  color: $fg
  &:hover:not(:disabled)
    background-color: $bg-secondary-hover
  &[aria-expanded="true"]
    background-color: $bg-secondary
    color: $fg

.button--ghost
  background-color: transparent
  color: $fg
  &:hover:not(:disabled)
    background-color: $bg-muted
    color: $fg
  &[aria-expanded="true"]
    background-color: $bg-muted
    color: $fg

.button--destructive
  background-color: $bg-destructive-10
  color: $fg-destructive
  &:hover:not(:disabled)
    background-color: $bg-destructive-20
  &:focus-visible
    box-shadow: 0 0 0 $ring-width hsl(0 84% 60% / 0.2)

.button--link
  background-color: transparent
  color: $fg-primary
  text-underline-offset: 4px
  &:hover:not(:disabled)
    text-decoration: underline
```

## Sizes

```sass
.button--size-default
  height: 2.25rem
  gap: 0.375rem
  padding: 0 0.625rem
  font-size: $font-size-default

  // if a sibling element is detected to the left of the button (icon-start), drop the left padding
  &:has([data-icon="inline-start"])
    padding-left: 0.5rem
  &:has([data-icon="inline-end"])
    padding-right: 0.5rem

.button--size-xs
  height: 1.5rem
  gap: 0.25rem
  padding: 0 0.5rem
  font-size: $font-size-xs
  border-radius: min($radius-md, $radius-8)

  &:has([data-icon="inline-start"])
    padding-left: 0.375rem
  &:has([data-icon="inline-end"])
    padding-right: 0.375rem

  > svg
    width: 0.75rem
    height: 0.75rem

.button--size-sm
  height: 2rem
  gap: 0.25rem
  padding: 0 0.625rem
  font-size: $font-size-default
  border-radius: min($radius-md, 10px)

.button--size-lg
  height: 2.5rem
  gap: 0.375rem
  padding: 0 0.625rem
  font-size: $font-size-default

.button--size-icon
  width: 2.25rem
  padding: 0

.button--size-icon-xs
  width: 1.5rem
  height: 1.5rem
  padding: 0
  border-radius: min($radius-md, $radius-8)
  > svg
    width: 0.75rem
    height: 0.75rem

.button--size-icon-sm
  width: 2rem
  height: 2rem
  padding: 0
  border-radius: min($radius-md, 10px)

.button--size-icon-lg
  width: 2.5rem
  height: 2.5rem
  padding: 0
```

## Anchor-as-button (when `href` is set)

```sass
a.button
  text-decoration: none

  &[aria-disabled="true"]
    pointer-events: none
    opacity: 0.5
```

## Dark mode overrides

```sass
@media (prefers-color-scheme: dark)
  .button--outline
    background-color: $bg-input-30
    border-color: $border-input
    &:hover:not(:disabled)
      background-color: $bg-input-50

  .button--ghost
    &:hover:not(:disabled)
      background-color: hsl(217 33% 17% / 0.5)

  .button--destructive
    background-color: hsl(0 84% 60% / 0.2)
    &:hover:not(:disabled)
      background-color: hsl(0 84% 60% / 0.3)
    &:focus-visible
      box-shadow: 0 0 0 $ring-width hsl(0 84% 60% / 0.4)
```

## Usage skeleton (Svelte, for reference)

```svelte
<button class="button button--default button--size-default" type="button">
  Save changes
</button>

<a class="button button--outline button--size-sm" href="/docs">
  Read docs
  <ArrowRight />
</a>

<button class="button button--ghost button--size-icon" type="button" aria-label="Settings">
  <Settings />
</button>
```
