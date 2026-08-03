---
title: Scroll Area
description: A custom-styled scroll container with cross-browser hidden native scrollbars but preserved scroll behavior. Used wherever a fixed-height region needs to scroll inside a card, modal, or panel.
---

# Scroll Area

The `ScrollArea` family is a thin wrapper around `bits-ui`'s custom scrollbars. It hides the native scrollbar visuals but keeps scroll behavior intact.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$fg:                 hsl(222 47% 11%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$scrollbar-size:     0.625rem     // 10px — `w-2.5`
$scrollbar-thumb-bg: hsl(215 16% 65%)
```

## ScrollArea (root)

```sass
.scroll-area
  position: relative
  width: 100%
  height: 100%
  overflow: hidden
  outline: none
```

## ScrollAreaViewport

```sass
.scroll-area-viewport
  width: 100%
  height: 100%
  border-radius: inherit

  // size variants — enable native scrollbar only when needed
  &--vertical-only
    overflow-x: hidden
    overflow-y: auto

  &--horizontal-only
    overflow-x: auto
    overflow-y: hidden

  &--both
    overflow: auto
```

## ScrollAreaScrollbar

A custom-rendered scrollbar. Sits overlaid on the viewport edge.

```sass
.scroll-area-scrollbar
  display: flex
  user-select: none
  touch-action: none
  padding: 0.125rem
  background-color: transparent
  transition: background-color 150ms ease-out

  &:hover
    background-color: hsl(215 16% 47% / 0.1)

  &[data-orientation="vertical"]
    width: $scrollbar-size

  &[data-orientation="horizontal"]
    flex-direction: column
    height: $scrollbar-size
```

## ScrollAreaThumb

The draggable thumb inside the scrollbar.

```sass
.scroll-area-thumb
  position: relative
  flex: 1 1 0%
  border-radius: $radius-md
  background-color: $scrollbar-thumb-bg

  // expand on hover/active
  &::before
    content: ""
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    width: 100%
    height: 100%
    min-width: 2.25rem
    min-height: 2.25rem

  .scroll-area-scrollbar:hover &
    background-color: hsl(215 16% 50%)
```

## ScrollAreaCorner

The corner where two scrollbars meet.

```sass
.scroll-area-corner
  background-color: transparent
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  .scroll-area-scrollbar:hover
    background-color: hsl(215 16% 65% / 0.1)

  .scroll-area-thumb
    background-color: hsl(215 16% 45%)
    .scroll-area-scrollbar:hover &
      background-color: hsl(215 16% 60%)
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="scroll-area">
  <div class="scroll-area-viewport scroll-area-viewport--vertical-only">
    <!-- long content -->
  </div>
  <div class="scroll-area-scrollbar" data-orientation="vertical">
    <div class="scroll-area-thumb"></div>
  </div>
</div>
```
