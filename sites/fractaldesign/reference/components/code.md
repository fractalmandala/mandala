---
title: Code
description: A syntax-highlighted code block for streaming code generations. Wraps Shiki's highlighted HTML in a card-style container, supports an optional overflow-collapse mode with a fade and "Expand" button, and ships with a copy-to-clipboard affordance pinned to the top-right corner.
---

# Code

The `Code` family renders the model's streamed code output:

- `Code` — root container that scrolls and frames the highlighted HTML
- `CodeOverflow` — collapsible shell that caps the visible height at 300px and overlays a fade + "Expand" button when collapsed
- `CodeCopyButton` — small ghost button absolutely-positioned in the top-right of the code block
- `CopyButton` — the lower-level copy button used internally

The styling below is pure indented Sass. Shiki's per-token color is preserved by reading the `--shiki-dark` CSS variables set inline on each `<span>`.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$bg-secondary-50:    hsl(210 40% 96% / 0.5)
$bg-muted:           hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$border-transparent: transparent
$radius-md:          0.375rem
$radius-lg:          0.5rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$code-max-height:    650px
$code-collapsed:     300px
$copy-button-offset: 0.5rem
$font-mono:          ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
$font-mono-size:     0.875rem
$line-number-width:  1.8rem
$line-number-margin: 1.4rem
```

## Mixins

```sass
=visually-hidden
  position: absolute
  width: 1px
  height: 1px
  padding: 0
  margin: -1px
  overflow: hidden
  clip: rect(0, 0, 0, 0)
  white-space: nowrap
  border: 0

=icon-ghost-button
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
    background-color: $bg-muted
    color: $fg

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px
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
  font-size: $font-mono-size
  line-height: 1.5

  // the inner wrapper holds the shiki output and any child slots (e.g. copy button)
  &__wrapper
    position: relative

  // shiki pre/code styling
  pre.shiki
    overflow-x: auto
    border-radius: $radius-lg
    background-color: inherit
    padding: 1rem 0
    margin: 0

    &:not([data-code-overflow] *)
    &:not([data-code-overflow])
      overflow-y: auto
      max-height: min(100%, $code-max-height)

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

  // line numbers — emitted as CSS counters
  pre.line-numbers
    counter-reset: step
    counter-increment: step 0

  pre.line-numbers .line::before
    content: counter(step)
    counter-increment: step
    display: inline-block
    width: $line-number-width
    margin-right: $line-number-margin
    text-align: right
    color: $fg-muted

  // highlighted line emphasis
  pre .line.line--highlighted
    position: relative
    background-color: $bg-muted

  // variants
  &--default
    background-color: $bg-card
    border-color: $border

  &--secondary
    background-color: $bg-secondary-50
    border-color: $border-transparent
```

### Dark mode (Shiki dual-theme)

Shiki emits two CSS variables per token: `--shiki-light` and `--shiki-dark`. In dark mode we read the dark ones.

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

## CodeOverflow

The collapsible shell. When `data-collapsed="true"`, the inner content is clipped to 300px and a fade gradient + "Expand" button overlay the bottom edge.

```sass
.code-overflow
  position: relative
  overflow-y: hidden

  &[data-collapsed="true"]
    max-height: $code-collapsed

  // the gradient mask sitting at the bottom edge while collapsed
  &__fade
    position: absolute
    bottom: 0
    left: 0
    z-index: 10
    width: 100%
    height: 100%
    background-image: linear-gradient(to top, $bg 0%, transparent 100%)
    pointer-events: none

  // the expand / collapse toggle
  &__toggle
    position: absolute
    bottom: 0
    left: 50%
    z-index: 20
    transform: translateX(-50%)

  &[data-collapsed="true"] &__toggle
    bottom: 0

  &[data-collapsed="false"] &__toggle
    bottom: 1.5rem
```

## CodeCopyButton

A small ghost icon button absolutely-positioned at the top-right of the code block. It is paired with a low-level `CopyButton` that handles clipboard interaction and swaps its icon between `copy` → `check` → `x`.

```sass
.code-copy-button
  position: absolute
  top: $copy-button-offset
  right: $copy-button-offset
  z-index: 5
```

## CopyButton

The shared copy primitive. Default renders a square icon button; when `children` are passed it expands to the default button height and shows a label.

```sass
.copy-button
  +icon-ghost-button()
  display: inline-flex
  align-items: center
  gap: 0.5rem
  font-size: 0.875rem

  // the icon container scales in on state change
  > .copy-button__icon
    display: inline-flex
    align-items: center
    justify-content: center
    width: 1rem
    height: 1rem

    > svg
      width: 1rem
      height: 1rem
      stroke-width: 1.8

  // visually-hidden status label
  &__label
    +visually-hidden

  // states — the icon swaps but the layout stays the same width
  &--success > .copy-button__icon
    color: hsl(142 76% 36%)

  &--failure > .copy-button__icon
    color: hsl(0 84% 60%)

  // variant overrides
  &--outline
    border-color: $border
    background-color: transparent
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="code code--default">
  <div class="code__wrapper">
    <CodeOverflow class="code-overflow">
      <pre class="shiki"><code>{highlightedHtml}</code></pre>
    </CodeOverflow>

    <CodeCopyButton class="code-copy-button" />
  </div>
</div>
```
