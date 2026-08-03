---
title: Alert
description: A notice-style banner used to surface a short, important message. Two variants: `default` (neutral card surface) and `destructive` (red-tinted text). Includes optional title, description, and action slots.
---

# Alert

The `Alert` family is a simple, accessible banner. It renders as a grid so the icon, title, description, and action slot align predictably. The component is also used internally by `Confirmation`.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$fg:                 hsl(222 47% 11%)
$fg-destructive:     hsl(0 84% 60%)
$fg-destructive-90:  hsl(0 84% 60% / 0.9)
$border:             hsl(214 32% 91%)
$radius-md:          0.5rem        // 8px — `rounded-lg`
$padding-x:          1rem          // 16px — `px-4`
$padding-y:          0.75rem       // 12px — `py-3`
$font-size:          0.875rem
$gap-row:            0.125rem
$gap-col:            0.625rem      // 10px — `gap-x-2.5`
$icon-size:          1rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Mixins

```sass
=alert-grid
  display: grid
  grid-template-columns: 1fr
  grid-auto-rows: min-content
  width: 100%
  text-align: left
  font-size: $font-size
  line-height: 1.4

  // when an SVG is the first child, expand to two columns: icon | content
  &:has(> svg)
    grid-template-columns: auto 1fr
    column-gap: $gap-col

    > svg
      grid-row: span 2
      grid-column: 1
      align-self: start
      transform: translateY(0.125rem)
      color: currentColor
      width: $icon-size
      height: $icon-size

      // any descendant svg also inherits currentColor
      ~ svg
        width: $icon-size
        height: $icon-size
```

## Alert (root)

```sass
.alert
  +alert-grid
  position: relative
  gap: $gap-row
  padding: $padding-y $padding-x
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg-card
  color: $fg

  // when an action slot is present, reserve space on the right
  &:has([data-slot="alert-action"])
    position: relative
    padding-right: 4.5rem
```

## Variants

```sass
.alert--default
  background-color: $bg-card
  color: $fg

.alert--destructive
  background-color: $bg-card
  color: $fg-destructive

  // description inherits a softer red
  [data-slot="alert-description"]
    color: $fg-destructive-90

  // inline svgs adopt the destructive color
  > svg, svg
    color: currentColor
```

## AlertTitle

```sass
.alert-title
  grid-column: 2
  margin: 0
  font-weight: 600
  line-height: 1.25
  color: inherit

  // if no description follows, let the title span both rows
  &:only-child
    grid-row: span 2
```

## AlertDescription

```sass
.alert-description
  grid-column: 2
  margin: 0
  font-size: $font-size
  line-height: 1.4
  color: inherit
  opacity: 0.9

  // first child has no extra top spacing
  > *:first-child
    margin-top: 0

  // last child has no extra bottom spacing
  > *:last-child
    margin-bottom: 0
```

## AlertAction

An action button positioned in the top-right corner of the alert.

```sass
.alert-action
  position: absolute
  top: $padding-y
  right: $padding-x
  display: inline-flex
  align-items: center
  gap: 0.5rem
  flex-shrink: 0
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-card-dark:        hsl(222 47% 6%)
  $fg-dark:             hsl(210 40% 98%)
  $fg-destructive-dark: hsl(0 84% 70%)
  $border-dark:         hsl(217 33% 17%)

  .alert
    background-color: $bg-card-dark
    border-color: $border-dark
    color: $fg-dark

  .alert--destructive
    color: $fg-destructive-dark
    [data-slot="alert-description"]
      color: hsl(0 84% 70% / 0.9)
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="alert alert--destructive" role="alert">
  <AlertTriangle />

  <h5 class="alert-title">Unable to connect</h5>

  <div class="alert-description">
    <p>We couldn't reach the server. Check your network and try again.</p>
  </div>

  <div class="alert-action">
    <button class="button button--ghost button--size-sm" type="button">Retry</button>
  </div>
</div>
```
