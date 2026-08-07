---
title: Context
description: A hover-card that surfaces the model's current token usage. The trigger shows a percentage; the card breaks down used vs. max tokens by category (input, output, reasoning, cache) and estimates dollar cost.
---

# Context

The `Context` family is a small status indicator that surfaces token-budget consumption for the active conversation. It pairs a trigger (a button showing the percentage of the context window used) with a hover-card popover that breaks the usage down by category and reports an estimated cost.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-track:           hsl(210 40% 96%)
$bg-progress:        hsl(222 47% 11%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$popover-min-width:  15rem
$gap-row:            0.5rem
```

## Mixins

```sass
=icon-ghost-button
  display: inline-flex
  align-items: center
  justify-content: center
  height: 2rem
  padding: 0 0.5rem
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

## Context (root — hover-card wrapper)

```sass
.context
  position: relative
  display: inline-block
```

## ContextTrigger

The button pinned to the chat header that opens the popover on hover. Shows the percentage in muted text and a small context-window icon to the right.

```sass
.context-trigger
  +icon-ghost-button()
  gap: 0.375rem
  font-size: 0.875rem

  // percent label — semibold, muted
  > .context-trigger__percent
    font-weight: 500
    color: $fg-muted

  // icon slot
  > svg
    width: 1rem
    height: 1rem
    flex-shrink: 0
```

## ContextContent

The hover-card popover. Floats above the trigger with a small offset, a soft shadow, and three stacked sections separated by 1px dividers.

```sass
.context-content
  position: absolute
  z-index: 50
  min-width: $popover-min-width
  overflow: hidden
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg
  color: $fg
  box-shadow: $shadow-md

  // the three logical sections (header / body / footer) are separated by dividers
  & > * + *
    border-top: 1px solid $border
```

## ContextContentHeader

The top section. Holds a horizontal layout with the percentage on the left and the raw `used / max` token count on the right in a monospace muted font, plus a progress bar underneath.

```sass
.context-content-header
  display: flex
  flex-direction: column
  gap: $gap-row
  padding: 0.75rem

  &__row
    display: flex
    align-items: center
    justify-content: space-between
    gap: 0.75rem
    font-size: 0.75rem
    line-height: 1rem

  &__percent
    font-weight: 500
    color: $fg

  &__tokens
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    color: $fg-muted
    font-size: 0.75rem
```

### Progress bar

A small horizontal track with a fill that grows from 0 → 100%.

```sass
.context-progress
  position: relative
  width: 100%
  height: 0.375rem
  overflow: hidden
  border-radius: 9999px
  background-color: $bg-track

  &__fill
    height: 100%
    background-color: $bg-progress
    transition: width $transition ease-out

    // warn state — past 80%
    .context-progress--warn &__fill
      background-color: hsl(38 92% 50%)

    // danger state — past 95%
    .context-progress--danger &__fill
      background-color: hsl(0 84% 60%)
```

## ContextContentBody

A vertical stack of "category rows" — one per usage type (input, output, reasoning, cache). Each row has a small color dot and the token count.

```sass
.context-content-body
  display: flex
  flex-direction: column
  gap: 0.5rem
  padding: 0.75rem

  &__row
    display: flex
    align-items: center
    justify-content: space-between
    gap: 0.5rem
    font-size: 0.75rem

  &__label
    display: inline-flex
    align-items: center
    gap: 0.375rem
    color: $fg-muted

  &__dot
    width: 0.5rem
    height: 0.5rem
    border-radius: 9999px
    background-color: $fg-muted
    flex-shrink: 0

    // category colors
    .context-row--input &     background-color: hsl(217 91% 60%)
    .context-row--output &    background-color: hsl(142 76% 36%)
    .context-row--reasoning & background-color: hsl(280 70% 55%)
    .context-row--cache &     background-color: hsl(38 92% 50%)

  &__value
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    color: $fg
```

## ContextContentFooter

A single-line row showing the estimated dollar cost.

```sass
.context-content-footer
  padding: 0.75rem

  &__row
    display: flex
    align-items: center
    justify-content: space-between
    gap: 0.5rem
    font-size: 0.75rem

  &__label
    color: $fg-muted

  &__cost
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    font-weight: 500
    color: $fg
```

## ContextIcon

A small inline SVG used inside the trigger.

```sass
.context-icon
  display: inline-flex
  align-items: center
  justify-content: center
  width: 1rem
  height: 1rem
  color: inherit

  > svg
    width: 100%
    height: 100%
```

## ContextCacheUsage / ContextInputUsage / ContextOutputUsage / ContextReasoningUsage

These are specialized row components that share the same visual structure as `ContextContentBody__row` but pre-bind the category color:

```sass
.context-row
  display: flex
  align-items: center
  justify-content: space-between
  gap: 0.5rem
  font-size: 0.75rem

  &__label
    display: inline-flex
    align-items: center
    gap: 0.375rem
    color: $fg-muted

  &__dot
    width: 0.5rem
    height: 0.5rem
    border-radius: 9999px

  &__value
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    color: $fg

.context-row--input     .context-row__dot  background-color: hsl(217 91% 60%)
.context-row--output    .context-row__dot  background-color: hsl(142 76% 36%)
.context-row--reasoning .context-row__dot  background-color: hsl(280 70% 55%)
.context-row--cache     .context-row__dot  background-color: hsl(38 92% 50%)
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:       hsl(222 47% 6%)
  $bg-muted-dark: hsl(217 33% 17%)
  $fg-dark:       hsl(210 40% 98%)
  $fg-muted-dark: hsl(215 16% 65%)
  $border-dark:   hsl(217 33% 17%)

  .context-content
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark

    & > * + *
      border-top-color: $border-dark

  .context-trigger
    color: $fg-muted-dark
    &:hover
      background-color: $bg-muted-dark
      color: $fg-dark

  .context-content-header
    &__percent
      color: $fg-dark
    &__tokens
      color: $fg-muted-dark

  .context-progress
    background-color: $bg-muted-dark
    &__fill
      background-color: $fg-dark

  .context-content-body
    &__label
      color: $fg-muted-dark
    &__value
      color: $fg-dark

  .context-content-footer
    &__label
      color: $fg-muted-dark
    &__cost
      color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<span class="context">
  <button class="context-trigger" type="button">
    <span class="context-trigger__percent">42%</span>
    <ContextIcon />
  </button>

  <div class="context-content" role="dialog">
    <div class="context-content-header">
      <div class="context-content-header__row">
        <span class="context-content-header__percent">42%</span>
        <span class="context-content-header__tokens">84k / 200k</span>
      </div>
      <div class="context-progress">
        <div class="context-progress__fill" style="width: 42%"></div>
      </div>
    </div>

    <div class="context-content-body">
      <div class="context-row context-row--input">
        <span class="context-row__label"><span class="context-row__dot"></span>Input</span>
        <span class="context-row__value">12,480</span>
      </div>
      <div class="context-row context-row--output">
        <span class="context-row__label"><span class="context-row__dot"></span>Output</span>
        <span class="context-row__value">3,210</span>
      </div>
    </div>

    <div class="context-content-footer">
      <div class="context-content-footer__row">
        <span class="context-content-footer__label">Estimated cost</span>
        <span class="context-content-footer__cost">$0.012</span>
      </div>
    </div>
  </div>
</span>
```
