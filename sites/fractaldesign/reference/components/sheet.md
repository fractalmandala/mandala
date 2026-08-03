---
title: Sheet
description: A slide-in panel that anchors to one edge of the viewport (top / right / bottom / left). Used for filters, sidebars, mobile navigation, and detail views that don't justify a full modal.
---

# Sheet

The `Sheet` family is a `Dialog` variant that slides in from one edge instead of centering. It shares the same overlay mechanics but uses side-aware slide animations.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-overlay:         hsl(0 0% 0% / 0.5)
$bg-card:            hsl(0 0% 100%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$ring-foreground-10: hsl(222 47% 11% / 0.1)
$shadow-lg:          0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -4px hsl(0 0% 0% / 0.1)
$transition:         300ms cubic-bezier(0.32, 0.72, 0, 1)
$z-sheet:            50
$width-default:      24rem     // 384px — `w-3/4 sm:max-w-sm`
$gap-row:            1.5rem    // 24px — `gap-6`
$padding:            1.5rem    // 24px — `p-6`
$backdrop-blur:      4px
```

## SheetOverlay

The backdrop. Shares the same blur treatment as `Dialog`.

```sass
.sheet-overlay
  position: fixed
  inset: 0
  z-index: $z-sheet
  background-color: $bg-overlay
  backdrop-filter: blur($backdrop-blur)
  -webkit-backdrop-filter: blur($backdrop-blur)

  &[data-state="open"]
    animation: sheet-overlay-in $transition forwards
  &[data-state="closed"]
    animation: sheet-overlay-out $transition forwards

@keyframes sheet-overlay-in
  from
    opacity: 0
  to
    opacity: 1

@keyframes sheet-overlay-out
  from
    opacity: 1
  to
    opacity: 0
```

## SheetContent

The sliding panel. Positioned on the requested edge.

```sass
.sheet-content
  position: fixed
  z-index: $z-sheet
  display: flex
  flex-direction: column
  gap: $gap-row
  padding: $padding
  background-color: $bg-card
  color: $fg
  border: 1px solid $ring-foreground-10
  box-shadow: $shadow-lg
  outline: none

  // side-specific positioning & entry/exit
  &[data-side="top"]
    top: 0
    right: 0
    left: 0
    border-bottom-width: 1px
    &[data-state="open"]
      animation: sheet-in-top $transition forwards
    &[data-state="closed"]
      animation: sheet-out-top $transition forwards

  &[data-side="right"]
    top: 0
    right: 0
    bottom: 0
    width: 75vw
    max-width: $width-default
    border-left-width: 1px
    &[data-state="open"]
      animation: sheet-in-right $transition forwards
    &[data-state="closed"]
      animation: sheet-out-right $transition forwards

  &[data-side="bottom"]
    right: 0
    bottom: 0
    left: 0
    border-top-width: 1px
    &[data-state="open"]
      animation: sheet-in-bottom $transition forwards
    &[data-state="closed"]
      animation: sheet-out-bottom $transition forwards

  &[data-side="left"]
    top: 0
    bottom: 0
    left: 0
    width: 75vw
    max-width: $width-default
    border-right-width: 1px
    &[data-state="open"]
      animation: sheet-in-left $transition forwards
    &[data-state="closed"]
      animation: sheet-out-left $transition forwards

@keyframes sheet-in-top
  from
    transform: translateY(-100%)
  to
    transform: translateY(0)

@keyframes sheet-out-top
  from
    transform: translateY(0)
  to
    transform: translateY(-100%)

@keyframes sheet-in-right
  from
    transform: translateX(100%)
  to
    transform: translateX(0)

@keyframes sheet-out-right
  from
    transform: translateX(0)
  to
    transform: translateX(100%)

@keyframes sheet-in-bottom
  from
    transform: translateY(100%)
  to
    transform: translateY(0)

@keyframes sheet-out-bottom
  from
    transform: translateY(0)
  to
    transform: translateY(100%)

@keyframes sheet-in-left
  from
    transform: translateX(-100%)
  to
    transform: translateX(0)

@keyframes sheet-out-left
  from
    transform: translateX(0)
  to
    transform: translateX(-100%)
```

## SheetClose (built-in)

```sass
.sheet-close
  position: absolute
  top: 1rem
  right: 1rem
  display: inline-flex
  align-items: center
  justify-content: center
  width: 2rem
  height: 2rem
  border: 0
  border-radius: 0.375rem
  background-color: transparent
  color: $fg-muted
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    background-color: hsl(210 40% 96%)
    color: $fg

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px

  > svg
    width: 1rem
    height: 1rem
```

## SheetHeader / SheetFooter / SheetTitle / SheetDescription

Identical to `Dialog`'s equivalents — see that file for full styles.

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-card-dark: hsl(222 47% 6%)
  $fg-dark:      hsl(210 40% 98%)
  $fg-muted-dark: hsl(215 16% 65%)
  $ring-dark:    hsl(210 40% 98% / 0.1)

  .sheet-content
    background-color: $bg-card-dark
    color: $fg-dark
    border-color: $ring-dark

  .sheet-close
    color: $fg-muted-dark
    &:hover
      background-color: hsl(217 33% 17%)
      color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="sheet-overlay" data-state="open"></div>

<div class="sheet-content" data-side="right" data-state="open">
  <h2 class="sheet-title">Edit profile</h2>
  <p class="sheet-description">Make changes to your public profile.</p>

  <!-- body -->

  <button class="sheet-close" type="button" aria-label="Close">
    <X />
  </button>
</div>
```
