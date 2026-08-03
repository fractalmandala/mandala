---
title: Code (UI)
description: A low-level code-block primitive used by the docs site (distinct from the AI-streaming `Code` component). Renders Shiki-highlighted HTML inside a bordered card, supports a default and secondary variant, and can host children like a copy button.
---

# Code (UI primitive)

This is the documentation-site counterpart to the AI-streaming `Code` component. It uses the same Shiki pipeline and the same card-style framing, but is wired for static markdown content rather than streaming responses.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$bg-secondary-50:    hsl(210 40% 96% / 0.5)
$fg:                 hsl(222 47% 11%)
$border:             hsl(214 32% 91%)
$border-transparent: transparent
$radius-md:          0.375rem
$radius-lg:          0.5rem
$shadow-xs:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$font-mono:          ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
$font-size:          0.875rem
$line-height:        1.5
$max-height:         650px
$padding-y:          1rem
$padding-x:          0
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Code (root)

```sass
.code
  position: relative
  height: 100%
  overflow: auto
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg-card
  color: $fg
  font-family: $font-mono
  font-size: $font-size
  line-height: $line-height

  // inner wrapper holds the shiki output and any child slots
  &__wrapper
    position: relative

  // Shiki output
  pre.shiki
    overflow-x: auto
    border-radius: $radius-lg
    background-color: inherit
    padding: $padding-y $padding-x
    margin: 0

    // the inner code element resets to grid for line-based layouts
    code
      display: grid
      min-width: 100%
      border: 0
      background: transparent
      padding: 0
      border-radius: 0
      word-break: break-word
      counter-reset: line
      box-decoration-break: clone

  // variants
  &--default
    background-color: $bg-card
    border-color: $border

  &--secondary
    background-color: $bg-secondary-50
    border-color: $border-transparent

  // line numbers via CSS counters
  pre.line-numbers
    counter-reset: step
    counter-increment: step 0

  pre.line-numbers .line::before
    content: counter(step)
    counter-increment: step
    display: inline-block
    width: 1.8rem
    margin-right: 1.4rem
    text-align: right
    color: hsl(215 16% 47%)

  // highlighted line emphasis
  pre .line.line--highlighted
    position: relative
    background-color: hsl(210 40% 96%)

  // hard cap on height for long snippets
  pre.shiki:not([data-code-overflow] *):not([data-code-overflow])
    overflow-y: auto
    max-height: min(100%, $max-height)
```

## Dark mode (Shiki dual-theme)

```sass
@media (prefers-color-scheme: dark)
  .code
    background-color: hsl(222 47% 6%)
    border-color: hsl(217 33% 17%)
    color: hsl(210 40% 98%)

    pre.shiki, pre.shiki span
      color: var(--shiki-dark) !important
      font-style: var(--shiki-dark-font-style) !important
      font-weight: var(--shiki-dark-font-weight) !important
      text-decoration: var(--shiki-dark-text-decoration) !important

    pre .line.line--highlighted
      background-color: hsl(217 33% 17%)
```

## CopyButton (companion)

A small ghost icon button absolutely-positioned in the top-right of the code block.

```sass
.code-copy-button
  position: absolute
  top: 0.5rem
  right: 0.5rem
  z-index: 5
  display: inline-flex
  align-items: center
  justify-content: center
  width: 2rem
  height: 2rem
  border: 1px solid transparent
  border-radius: $radius-md
  background-color: transparent
  color: hsl(215 16% 47%)
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    background-color: hsl(210 40% 96%)
    color: hsl(222 47% 11%)

  &:focus-visible
    outline: 2px solid hsl(222 47% 11%)
    outline-offset: 2px

  > svg
    width: 1rem
    height: 1rem
```

## CodeOverflow

A wrapper that clips the snippet to a fixed height and overlays a fade + "Expand" button when collapsed.

```sass
.code-overflow
  position: relative
  overflow-y: hidden

  &[data-collapsed="true"]
    max-height: 300px

  &__fade
    position: absolute
    bottom: 0
    left: 0
    z-index: 10
    width: 100%
    height: 100%
    background-image: linear-gradient(to top, $bg 0%, transparent 100%)
    pointer-events: none

  &__toggle
    position: absolute
    bottom: 0
    left: 50%
    z-index: 20
    transform: translateX(-50%)
```

## MultipleFiles / SingleFile (file-tree wrappers)

```sass
.code-multiple-files
  display: flex
  flex-direction: column
  border: 1px solid $border
  border-radius: $radius-lg
  overflow: hidden
  background-color: $bg-card

.code-single-file
  display: block
  border: 1px solid $border
  border-radius: $radius-lg
  overflow: hidden
  background-color: $bg-card
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="code code--default">
  <div class="code__wrapper">
    {@html highlightedHtml}
    <button class="code-copy-button" type="button" aria-label="Copy">
      <Copy />
    </button>
  </div>
</div>
```
