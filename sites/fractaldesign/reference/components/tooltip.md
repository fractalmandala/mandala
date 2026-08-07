---
title: Tooltip
description: A small floating label that appears on hover/focus after a short delay. Used to annotate icon-only buttons and provide keyboard hints.
---

# Tooltip

The `Tooltip` family is a thin wrapper around the `bits-ui` tooltip primitive. It supports four anchor sides, keyboard shortcuts (rendered as a `<kbd>` inside the content), and a configurable delay.

The styling below is pure indented Sass.

## Tokens

```sass
$bg-foreground:      hsl(222 47% 11%)
$fg-background:      hsl(210 40% 98%)
$bg-popover:         hsl(0 0% 100%)
$fg-popover:         hsl(222 47% 11%)
$ring-foreground-10: hsl(222 47% 11% / 0.1)
$radius-md:          0.375rem
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$z-tooltip:          50
$padding-x:          0.75rem     // 12px — `px-3`
$padding-y:          0.375rem    // 6px  — `py-1.5`
$font-size:          0.75rem     // 12px — `text-xs`
$gap-row:            0.375rem    // 6px  — `gap-1.5`
$max-width:          24rem       // 384px — `max-w-xs`
$kbd-padding-x:      0.375rem
```

## Mixins

```sass
=tooltip-state-animations
  &[data-state="delayed-open"],
  &[data-state="instant-open"],
  &[data-state="open"]
    &[data-side="bottom"]
      animation: tooltip-in-bottom $transition forwards
    &[data-side="top"]
      animation: tooltip-in-top $transition forwards
    &[data-side="left"]
      animation: tooltip-in-left $transition forwards
    &[data-side="right"]
      animation: tooltip-in-right $transition forwards

  &[data-state="closed"]
    animation: tooltip-out $transition forwards

@keyframes tooltip-in-bottom
  from
    opacity: 0
    transform: translateY(-0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateY(0) scale(1)

@keyframes tooltip-in-top
  from
    opacity: 0
    transform: translateY(0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateY(0) scale(1)

@keyframes tooltip-in-left
  from
    opacity: 0
    transform: translateX(0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateX(0) scale(1)

@keyframes tooltip-in-right
  from
    opacity: 0
    transform: translateX(-0.5rem) scale(0.95)
  to
    opacity: 1
    transform: translateX(0) scale(1)

@keyframes tooltip-out
  from
    opacity: 1
    transform: scale(1)
  to
    opacity: 0
    transform: scale(0.95)
```

## TooltipContent

```sass
.tooltip-content
  z-index: $z-tooltip
  display: inline-flex
  align-items: center
  gap: $gap-row
  width: fit-content
  max-width: $max-width
  padding: $padding-y $padding-x
  border: 0
  border-radius: $radius-md
  background-color: $bg-foreground
  color: $fg-background
  font-size: $font-size
  font-weight: 500
  white-space: nowrap
  box-shadow: $shadow-md
  outline: none
  transform-origin: var(--transform-origin, center)
  +tooltip-state-animations

  // when a kbd shortcut is rendered inside, tighten the trailing padding
  &:has([data-slot="kbd"])
    padding-right: $kbd-padding-x

  // kbd styling for shortcut hints inside the tooltip
  [data-slot="kbd"]
    position: relative
    z-index: 50
    display: inline-flex
    align-items: center
    justify-content: center
    height: 1.125rem
    min-width: 1.125rem
    padding: 0 0.25rem
    border-radius: 0.25rem
    background-color: hsl(0 0% 100% / 0.15)
    color: inherit
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    font-size: 0.625rem

  // SVG slot
  > svg
    width: 0.875rem
    height: 0.875rem
    flex-shrink: 0
```

## TooltipArrow (optional)

```sass
.tooltip-arrow
  width: 0.625rem
  height: 0.625rem
  background-color: $bg-foreground
  transform: rotate(45deg)
  // hide on closed state to avoid jitter during exit
  [data-state="closed"] &
    display: none
```

## TooltipTrigger

```sass
.tooltip-trigger
  display: inline-block
  cursor: pointer
```

## Dark mode

Dark mode uses the same `bg-foreground` (which is dark) with light text — this is already color-inverted compared to light mode, so no overrides are needed.

## Usage skeleton (Svelte, for reference)

```svelte
<span class="tooltip-trigger" tabindex="0" aria-describedby="tt-1">
  <Settings />
</span>

<div class="tooltip-content" id="tt-1" data-state="delayed-open" data-side="bottom">
  <span>Open settings</span>
  <kbd data-slot="kbd">⌘</kbd>
  <kbd data-slot="kbd">,</kbd>
</div>
```
