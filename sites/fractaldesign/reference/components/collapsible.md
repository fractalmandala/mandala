---
title: Collapsible
description: The foundational disclosure primitive — an open/close container with a trigger and content slot. Powers `ChainOfThought`, `Plan`, `Reasoning`, `Sources`, `Task`, `Tool`, `Queue`, and many others.
---

# Collapsible

The `Collapsible` family is a thin wrapper around the `bits-ui` primitive that exposes a `data-state` attribute on the content element (`open` / `closed`) and `aria-expanded` on the trigger. Most other components in the library target those attributes for their open/close animations.

The styling below is pure indented Sass.

## Tokens

```sass
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$transition:         200ms cubic-bezier(0.4, 0, 0.2, 1)
$icon-size:          1rem
$chevron-rotation:   180deg
```

## Mixins

```sass
=focus-ring
  outline: 2px solid $fg
  outline-offset: 2px

=collapsible-fade-slide
  display: grid
  grid-template-rows: 1fr
  overflow: hidden
  transition: grid-template-rows $transition

  &[data-state="closed"]
    grid-template-rows: 0fr

  &[data-state="open"]
    grid-template-rows: 1fr

  > div
    min-height: 0

  // entry / exit fade + slide
  &[data-state="open"]
    animation: collapsible-in 250ms $transition forwards
  &[data-state="closed"]
    animation: collapsible-out 200ms $transition forwards

@keyframes collapsible-in
  from
    opacity: 0
    transform: translateY(-8px)
  to
    opacity: 1
    transform: translateY(0)

@keyframes collapsible-out
  from
    opacity: 1
    transform: translateY(0)
  to
    opacity: 0
    transform: translateY(-8px)
```

## Collapsible (root)

The root is a plain container — it owns the open/closed state but renders no DOM of its own beyond what the trigger and content slots add.

```sass
.collapsible
  display: flex
  flex-direction: column
  color: $fg
```

## CollapsibleTrigger

The interactive element that toggles the content.

```sass
.collapsible-trigger
  display: inline-flex
  align-items: center
  gap: 0.5rem
  padding: 0
  border: 0
  background: transparent
  color: inherit
  font: inherit
  cursor: pointer
  transition: color $transition

  &:focus-visible
    +focus-ring
    border-radius: $radius-md

  // chevron rotation when open
  > svg:last-of-type
    width: $icon-size
    height: $icon-size
    transition: transform $transition
    transform: rotate(0deg)

  &[aria-expanded="true"] > svg:last-of-type
    transform: rotate($chevron-rotation)
```

## CollapsibleContent

The content panel. Uses the grid-template-rows trick to animate height smoothly.

```sass
.collapsible-content
  +collapsible-fade-slide

  > div
    padding-top: 0.5rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)

  .collapsible
    color: $fg-dark

  .collapsible-trigger
    &:focus-visible
      outline-color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="collapsible">
  <button
    class="collapsible-trigger"
    type="button"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span>Show details</span>
    <ChevronDown />
  </button>

  <div class="collapsible-content" data-state={open ? "open" : "closed"}>
    <div>
      <p>Hidden content revealed when expanded.</p>
    </div>
  </div>
</div>
```
