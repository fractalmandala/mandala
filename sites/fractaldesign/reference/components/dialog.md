---
title: Dialog
description: A modal dialog primitive with a backdrop, centered content, fade + zoom entry/exit animations, and an optional built-in close button. Used by `CommandDialog`, `ModelSelector`, and various confirmation flows.
---

# Dialog

The `Dialog` family is a thin wrapper around the `bits-ui` modal primitive. It renders a backdrop overlay and a centered content panel, with shadcn-style `data-[state=open]` / `data-[state=closed]` animation hooks.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-overlay:         hsl(0 0% 0% / 0.5)
$bg-popover:         hsl(0 0% 100%)
$fg:                 hsl(222 47% 11%)
$fg-popover:         hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$ring-foreground-10: hsl(222 47% 11% / 0.1)
$radius-xl:          0.75rem
$radius-md:          0.375rem
$shadow-lg:          0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -4px hsl(0 0% 0% / 0.1)
$transition:         100ms ease-out
$max-width:          28rem       // 448px — `sm:max-w-md`
$gap-row:            1.5rem      // 24px — `gap-6`
$padding:            1.5rem      // 24px — `p-6`
$font-size:          0.875rem
$z-dialog:           50
$backdrop-blur:      4px
```

## Mixins

```sass
=focus-ring
  outline: none
  box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.4)

=dialog-state-animations
  &[data-state="open"]
    animation: dialog-in $transition forwards
  &[data-state="closed"]
    animation: dialog-out $transition forwards

@keyframes dialog-in
  from
    opacity: 0
    transform: translate(-50%, -50%) scale(0.95)
  to
    opacity: 1
    transform: translate(-50%, -50%) scale(1)

@keyframes dialog-out
  from
    opacity: 1
    transform: translate(-50%, -50%) scale(1)
  to
    opacity: 0
    transform: translate(-50%, -50%) scale(0.95)
```

## Dialog (root)

```sass
.dialog
  // the root itself is non-visual; behavior is wired in the Svelte layer
  // but expose hooks via data-slot for child styles
```

## DialogOverlay

The backdrop. Full-screen, semi-transparent black, with a backdrop blur.

```sass
.dialog-overlay
  position: fixed
  inset: 0
  z-index: $z-dialog
  background-color: $bg-overlay
  backdrop-filter: blur($backdrop-blur)
  -webkit-backdrop-filter: blur($backdrop-blur)

  &[data-state="open"]
    animation: dialog-overlay-in $transition forwards
  &[data-state="closed"]
    animation: dialog-overlay-out $transition forwards

@keyframes dialog-overlay-in
  from
    opacity: 0
  to
    opacity: 1

@keyframes dialog-overlay-out
  from
    opacity: 1
  to
    opacity: 0
```

## DialogContent

The centered panel.

```sass
.dialog-content
  position: fixed
  top: 50%
  left: 50%
  z-index: $z-dialog
  display: grid
  width: calc(100% - 2rem)
  max-width: $max-width
  gap: $gap-row
  padding: $padding
  transform: translate(-50%, -50%)
  border: 1px solid $ring-foreground-10
  border-radius: $radius-xl
  background-color: $bg-popover
  color: $fg-popover
  font-size: $font-size
  box-shadow: $shadow-lg
  outline: none
  +dialog-state-animations
```

## DialogHeader

A vertical stack of title + description at the top of the content.

```sass
.dialog-header
  display: flex
  flex-direction: column
  gap: 0.5rem
  text-align: center

  // when a DialogClose sits to the right, switch to a horizontal layout
  &:has(+ .dialog-close)
    grid-template-columns: 1fr auto
    align-items: center
```

## DialogFooter

A horizontal row of action buttons at the bottom of the content.

```sass
.dialog-footer
  display: flex
  flex-direction: column-reverse
  gap: 0.5rem

  // right-align on wider screens
  @media (min-width: 640px)
    flex-direction: row
    justify-content: flex-end
```

## DialogTitle

```sass
.dialog-title
  margin: 0
  font-size: 1.125rem
  font-weight: 600
  line-height: 1.25
  letter-spacing: -0.01em
  color: $fg
```

## DialogDescription

```sass
.dialog-description
  margin: 0
  font-size: 0.875rem
  line-height: 1.4
  color: $fg-muted
```

## DialogClose (built-in)

A small ghost icon button absolutely positioned in the top-right of the content.

```sass
.dialog-close
  position: absolute
  top: 1rem
  right: 1rem
  display: inline-flex
  align-items: center
  justify-content: center
  width: 2rem
  height: 2rem
  padding: 0
  border: 1px solid transparent
  border-radius: $radius-md
  background-color: transparent
  color: $fg-muted
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    background-color: hsl(210 40% 96%)
    color: $fg

  &:focus-visible
    +focus-ring

  > svg
    width: 1rem
    height: 1rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-popover-dark: hsl(222 47% 6%)
  $fg-dark:         hsl(210 40% 98%)
  $fg-muted-dark:   hsl(215 16% 65%)
  $ring-dark:       hsl(210 40% 98% / 0.1)

  .dialog-content
    background-color: $bg-popover-dark
    color: $fg-dark
    border-color: $ring-dark

  .dialog-title
    color: $fg-dark

  .dialog-description
    color: $fg-muted-dark

  .dialog-close
    color: $fg-muted-dark
    &:hover
      background-color: hsl(217 33% 17%)
      color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="dialog-overlay"></div>

<div class="dialog-content" role="dialog" aria-modal="true">
  <div class="dialog-header">
    <h2 class="dialog-title">Edit profile</h2>
    <p class="dialog-description">Make changes to your public profile.</p>
  </div>

  <!-- body content -->

  <div class="dialog-footer">
    <button class="button button--outline" type="button">Cancel</button>
    <button class="button button--default" type="button">Save</button>
  </div>

  <button class="dialog-close" type="button" aria-label="Close">
    <X />
  </button>
</div>
```
