---
title: Hover Card
description: A non-modal popover that opens on hover/focus after a configurable delay. Used to surface preview content (citation quotes, model info, token usage) without cluttering the trigger element.
---

# Hover Card

The `HoverCard` family is a delayed popover — opens when the user hovers (or focuses) the trigger and closes after they move away (or blur). It is used for `Context`, `InlineCitation`, and similar preview-style affordances.

The styling below is pure indented Sass.

## Tokens

```sass
$bg-popover:         hsl(0 0% 100%)
$fg-popover:         hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$ring-foreground-10: hsl(222 47% 11% / 0.1)
$radius-lg:          0.5rem
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$transition:         100ms ease-out
$z-tooltip:          50
$width-default:      16rem      // 256px — `w-64`
$padding:            1rem
$font-size:          0.875rem
$gap-row:            0.5rem
```

## HoverCardContent

```sass
.hover-card-content
  z-index: $z-tooltip
  width: $width-default
  padding: $padding
  border: 1px solid $ring-foreground-10
  border-radius: $radius-lg
  background-color: $bg-popover
  color: $fg-popover
  font-size: $font-size
  box-shadow: $shadow-md
  outline: none
  transform-origin: var(--transform-origin, center)

  &[data-state="open"]
    animation: hover-card-in $transition forwards
  &[data-state="closed"]
    animation: hover-card-out $transition forwards

  // side-aware slide
  &[data-side="bottom"]
    animation-name: hover-card-in-bottom
  &[data-side="top"]
    animation-name: hover-card-in-top
  &[data-side="left"]
    animation-name: hover-card-in-left
  &[data-side="right"]
    animation-name: hover-card-in-right

@keyframes hover-card-in
  from
    opacity: 0
    transform: scale(0.95)
  to
    opacity: 1
    transform: scale(1)

@keyframes hover-card-out
  from
    opacity: 1
    transform: scale(1)
  to
    opacity: 0
    transform: scale(0.95)

@keyframes hover-card-in-bottom
  from
    opacity: 0
    transform: translateY(-0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateY(0) scale(1)

@keyframes hover-card-in-top
  from
    opacity: 0
    transform: translateY(0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateY(0) scale(1)

@keyframes hover-card-in-left
  from
    opacity: 0
    transform: translateX(0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateX(0) scale(1)

@keyframes hover-card-in-right
  from
    opacity: 0
    transform: translateX(-0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateX(0) scale(1)
```

## HoverCardTrigger

The hover/focus target. Wraps any inline element; no visual treatment of its own.

```sass
.hover-card-trigger
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

  .hover-card-content
    background-color: $bg-popover-dark
    color: $fg-dark
    border-color: $ring-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<span class="hover-card-trigger" tabindex="0">
  @kevin
</span>

<div class="hover-card-content" data-state="open" data-side="bottom">
  <strong>Kevin</strong>
  <p>Software engineer based in Berlin. Working on AI tooling.</p>
</div>
```
