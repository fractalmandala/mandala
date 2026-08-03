---
title: Badge
description: A small pill-shaped label used to annotate or categorize content. Six variants (default, secondary, destructive, outline, ghost, link) and renders as an anchor when `href` is provided.
---

# Badge

The `Badge` component is a compact label rendered as either a `<span>` (default) or an `<a>` (when an `href` is provided). It is used everywhere a small tag-style indicator is needed — for status, counts, source hosts, etc.

The styling below is pure indented Sass.

## Tokens

```sass
$bg-primary:         hsl(222 47% 11%)
$bg-primary-80:      hsl(222 47% 15%)
$bg-secondary:       hsl(210 40% 96%)
$bg-secondary-80:    hsl(210 40% 92%)
$bg-destructive-10:  hsl(0 84% 60% / 0.1)
$bg-destructive-20:  hsl(0 84% 60% / 0.2)
$bg-destructive-20-dark: hsl(0 84% 60% / 0.2)
$bg-muted:           hsl(210 40% 96%)
$bg-muted-50:        hsl(217 33% 17% / 0.5)

$fg:                 hsl(222 47% 11%)
$fg-primary:         hsl(222 47% 11%)
$fg-primary-fg:      hsl(210 40% 98%)
$fg-muted:           hsl(215 16% 47%)
$fg-destructive:     hsl(0 84% 60%)
$fg-secondary-fg:    hsl(222 47% 11%)

$border:             hsl(214 32% 91%)
$border-input:       hsl(217 33% 17%)
$border-ring:        hsl(222 47% 11% / 0.5)
$border-destructive-20: hsl(0 84% 60% / 0.2)
$border-destructive-40: hsl(0 84% 60% / 0.4)

$radius-full:        9999px
$radius-md:          0.375rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$ring-width:         3px

$height:             1.25rem       // 20px — `h-5`
$padding-x:          0.5rem        // 8px  — `px-2`
$padding-y:          0.125rem      // 2px  — `py-0.5`
$gap-row:            0.25rem
$font-size:          0.75rem       // 12px — `text-xs`
$font-weight:        500
```

## Mixins

```sass
=focus-ring
  outline: none
  box-shadow: 0 0 0 $ring-width $border-ring

=disabled
  pointer-events: none
  opacity: 0.5

=badge-base
  display: inline-flex
  flex-shrink: 0
  align-items: center
  justify-content: center
  gap: $gap-row
  height: $height
  width: fit-content
  padding: $padding-y $padding-x
  border: 1px solid transparent
  border-radius: $radius-full
  font-size: $font-size
  font-weight: $font-weight
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  user-select: none
  -webkit-user-select: none
  cursor: default
  transition: all $transition, color $transition

  &:focus-visible
    +focus-ring

  &[aria-invalid="true"]
    border-color: $fg-destructive
    box-shadow: 0 0 0 $ring-width $border-destructive-20

  > svg
    pointer-events: none
    flex-shrink: 0
    width: 0.75rem
    height: 0.75rem

  // when an inline icon is detected, drop the corresponding side padding
  &:has([data-icon="inline-start"])
    padding-left: 0.375rem
  &:has([data-icon="inline-end"])
    padding-right: 0.375rem
```

## Badge (root — default variant)

```sass
.badge
  +badge-base
  background-color: $bg-primary
  color: $fg-primary-fg

  // nested anchor (when href is set)
  a &
    cursor: pointer
    &:hover
      background-color: $bg-primary-80
```

## Variants

```sass
.badge--default
  background-color: $bg-primary
  color: $fg-primary-fg
  a:hover
    background-color: $bg-primary-80

.badge--secondary
  background-color: $bg-secondary
  color: $fg-secondary-fg
  a:hover
    background-color: $bg-secondary-80

.badge--destructive
  background-color: $bg-destructive-10
  color: $fg-destructive
  a:hover
    background-color: $bg-destructive-20
  &:focus-visible
    box-shadow: 0 0 0 $ring-width $border-destructive-20

.badge--outline
  border-color: $border
  color: $fg
  background-color: transparent
  a:hover
    background-color: $bg-muted
    color: $fg-muted

.badge--ghost
  background-color: transparent
  color: $fg-muted
  &:hover
    background-color: $bg-muted
    color: $fg-muted

.badge--link
  background-color: transparent
  color: $fg-primary
  text-underline-offset: 4px
  &:hover
    text-decoration: underline
```

## Dark mode overrides

```sass
@media (prefers-color-scheme: dark)
  $bg-destructive-20: hsl(0 84% 60% / 0.2)
  $border-destructive-40: hsl(0 84% 60% / 0.4)
  $bg-muted-50: hsl(217 33% 17% / 0.5)

  .badge--destructive
    background-color: $bg-destructive-20
    &:focus-visible
      box-shadow: 0 0 0 $ring-width $border-destructive-40

  .badge--ghost
    &:hover
      background-color: $bg-muted-50

  .badge--outline
    border-color: $border-input
```

## Usage skeleton (Svelte, for reference)

```svelte
<span class="badge badge--default">New</span>

<a class="badge badge--secondary" href="https://example.com">
  <Globe />
  example.com
</a>

<span class="badge badge--destructive">Failed</span>
```
