---
title: Card
description: A bordered container with rounded corners and a subtle ring. The fundamental surface for grouping related content — used as the base for Plan, Tool, Confirmation, and most other framed elements in the library.
---

# Card

The `Card` family is a thin wrapper around a div that provides a consistent bordered surface. It supports a `size` prop that toggles between a default comfortable padding and a compact `sm` padding for dense layouts.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$fg:                 hsl(222 47% 11%)
$fg-card:            hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$ring-foreground-10: hsl(222 47% 11% / 0.1)
$border-radius-xl:   0.75rem      // 12px
$radius-md:          0.375rem
$shadow-xs:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$font-size-default:  0.875rem
$gap-row:            1.5rem        // 24px — `gap-6`
$gap-row-sm:         1rem          // 16px — `gap-4`
$padding-y:          1.5rem        // 24px — `py-6`
$padding-y-sm:       1rem          // 16px — `py-4`
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Card (root)

```sass
.card
  position: relative
  display: flex
  flex-direction: column
  gap: $gap-row
  padding: 0 $padding-y $padding-y
  border-radius: $border-radius-xl
  background-color: $bg-card
  color: $fg-card
  font-size: $font-size-default
  line-height: 1.5
  box-shadow: $shadow-xs
  // a 1px ring drawn via outline so it doesn't affect box-sizing
  outline: 1px solid $ring-foreground-10
  outline-offset: -1px
  overflow: hidden

  &[data-size="sm"]
    gap: $gap-row-sm
    padding: 0 $padding-y-sm $padding-y-sm

  // when an image is the first child, drop the top padding and round its corners
  &:has(> img:first-child)
    padding-top: 0

  &:has(> img:first-child) > img:first-child
    border-top-left-radius: $border-radius-xl
    border-top-right-radius: $border-radius-xl

  &:has(> img:last-child) > img:last-child
    border-bottom-left-radius: $border-radius-xl
    border-bottom-right-radius: $border-radius-xl
```

## CardHeader

A vertical stack of title / description / action, padded at the top.

```sass
.card-header
  display: grid
  grid-auto-rows: min-content
  grid-template-columns: 1fr auto
  gap: 0.375rem
  padding: $padding-y $padding-y 0
  align-items: start

  .card[data-size="sm"] &
    padding: $padding-y-sm $padding-y-sm 0
```

## CardTitle

```sass
.card-title
  grid-column: 1
  margin: 0
  font-size: 1rem          // 16px
  font-weight: 600
  line-height: 1.25
  letter-spacing: -0.01em
  color: $fg
```

## CardDescription

```sass
.card-description
  grid-column: 1
  margin: 0
  font-size: 0.8125rem    // 13px
  line-height: 1.4
  color: $fg-muted
```

## CardAction

A small slot in the top-right corner of the header.

```sass
.card-action
  grid-column: 2
  grid-row: span 2 / span 2
  align-self: center
  justify-self: end
  display: flex
  align-items: center
  gap: 0.5rem
```

## CardContent

The body of the card.

```sass
.card-content
  padding: 0 $padding-y

  .card[data-size="sm"] &
    padding: 0 $padding-y-sm
```

## CardFooter

A footer row, typically used for action buttons.

```sass
.card-footer
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0 $padding-y $padding-y
  border-top: 1px solid $ring-foreground-10
  margin-top: auto

  .card[data-size="sm"] &
    padding: 0 $padding-y-sm $padding-y-sm
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-card-dark:   hsl(222 47% 6%)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)
  $ring-dark:      hsl(210 40% 98% / 0.1)

  .card
    background-color: $bg-card-dark
    color: $fg-dark
    outline-color: $ring-dark

  .card-title
    color: $fg-dark

  .card-description
    color: $fg-muted-dark

  .card-footer
    border-top-color: $ring-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Notifications</h3>
    <p class="card-description">You have 3 unread messages.</p>
    <div class="card-action">
      <button class="button button--ghost button--size-icon-sm" aria-label="Dismiss">
        <X />
      </button>
    </div>
  </div>

  <div class="card-content">
    <p>Body content goes here.</p>
  </div>

  <div class="card-footer">
    <button class="button button--outline" type="button">Cancel</button>
    <button class="button button--default" type="button">Save</button>
  </div>
</div>
```
