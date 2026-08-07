---
title: Tool
description: A collapsible disclosure that surfaces a single tool call made by the model — header shows the tool name and current state (Pending / Running / Completed / Error), body shows the input arguments and output result.
---

# Tool

The `Tool` family is the visual surface for the AI SDK's `toolUIPart` — every time the model invokes a tool (search, file read, code execution), a `Tool` block is rendered into the message transcript.

States are visually encoded by both a colored status badge and an icon:

- `input-streaming` → empty circle, "Pending" badge
- `input-available` → clock, "Running" badge
- `output-available` → check-circle, "Completed" badge
- `output-error` → x-circle, "Error" badge

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-secondary:       hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-popover:         hsl(222 47% 11%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$transition:         200ms cubic-bezier(0.4, 0, 0.2, 1)
$icon-size:          1rem
$badge-height:       1.25rem
$gap-row:            0.5rem
$gap-block:          0.75rem
```

## Mixins

```sass
=focus-ring
  outline: 2px solid $fg
  outline-offset: 2px

=status-badge($bg, $fg, $border)
  display: inline-flex
  align-items: center
  gap: 0.25rem
  height: $badge-height
  padding: 0 0.5rem
  border: 1px solid $border
  border-radius: 9999px
  background-color: $bg
  color: $fg
  font-size: 0.6875rem
  font-weight: 500
  white-space: nowrap

  > svg
    width: 0.75rem
    height: 0.75rem
    flex-shrink: 0

=collapsible-fade-slide
  &[data-state="open"]
    animation: tool-in 250ms $transition forwards
  &[data-state="closed"]
    animation: tool-out 200ms $transition forwards

@keyframes tool-in
  from
    opacity: 0
    transform: translateY(-8px)
  to
    opacity: 1
    transform: translateY(0)

@keyframes tool-out
  from
    opacity: 1
    transform: translateY(0)
  to
    opacity: 0
    transform: translateY(-8px)
```

## Tool (root)

```sass
.tool
  display: flex
  flex-direction: column
  width: 100%
  margin-bottom: 1rem
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg
  color: $fg
```

## ToolHeader

The always-visible header. Two columns: left has a wrench icon and the tool name in semibold; right has the status badge.

```sass
.tool-header
  display: flex
  align-items: center
  justify-content: space-between
  gap: 0.5rem
  width: 100%
  padding: 0.5rem 0.75rem
  border: 0
  background: transparent
  cursor: pointer
  text-align: left

  &:focus-visible
    +focus-ring
    border-radius: $radius-md

  &__left
    display: flex
    align-items: center
    gap: 0.5rem
    flex: 1 1 auto
    min-width: 0

  &__name
    margin: 0
    font-size: 0.875rem
    font-weight: 600
    line-height: 1.25
    color: $fg
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap

  > svg.tool-header__chevron
    width: $icon-size
    height: $icon-size
    color: $fg-muted
    flex-shrink: 0
    transition: transform $transition
    transform: rotate(0deg)

  &[aria-expanded="true"] > svg.tool-header__chevron
    transform: rotate(180deg)

  // leading icon slot (wrench by default)
  > svg:first-of-type
    width: $icon-size
    height: $icon-size
    color: $fg-muted
    flex-shrink: 0
```

### ToolHeader status badges

```sass
.tool-badge
  &--pending
    +status-badge(transparent, $fg-muted, $border)

  &--running
    +status-badge(hsl(217 91% 60% / 0.1), hsl(217 91% 60%), hsl(217 91% 60% / 0.3))

  &--completed
    +status-badge(hsl(142 76% 36% / 0.1), hsl(142 76% 36%), hsl(142 76% 36% / 0.3))

  &--error
    +status-badge(hsl(0 84% 60% / 0.1), hsl(0 84% 60%), hsl(0 84% 60% / 0.3))
```

## ToolContent

The collapsible body. Animates between `0fr` (closed) and `1fr` (open).

```sass
.tool-content
  display: grid
  grid-template-rows: 1fr
  overflow: hidden
  transition: grid-template-rows $transition
  color: $fg-popover
  border-top: 1px solid $border

  &[data-state="closed"]
    grid-template-rows: 0fr

  &[data-state="open"]
    grid-template-rows: 1fr

  > div
    min-height: 0
    padding: 0.75rem
    display: flex
    flex-direction: column
    gap: $gap-block

  +collapsible-fade-slide
```

## ToolInput

A labelled JSON block showing the arguments passed to the tool.

```sass
.tool-input
  display: flex
  flex-direction: column
  gap: 0.25rem

  &__label
    margin: 0
    font-size: 0.6875rem
    font-weight: 600
    text-transform: uppercase
    letter-spacing: 0.05em
    color: $fg-muted

  &__code
    margin: 0
    padding: 0.75rem
    border-radius: $radius-md
    background-color: $bg-secondary
    color: $fg
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    font-size: 0.8125rem
    line-height: 1.5
    overflow-x: auto
    white-space: pre-wrap
    word-break: break-word
```

## ToolOutput

A labelled block showing the tool's return value. Renders nothing when the tool is still pending/running.

```sass
.tool-output
  display: flex
  flex-direction: column
  gap: 0.25rem

  &__label
    margin: 0
    font-size: 0.6875rem
    font-weight: 600
    text-transform: uppercase
    letter-spacing: 0.05em
    color: $fg-muted

  &__code
    margin: 0
    padding: 0.75rem
    border-radius: $radius-md
    background-color: $bg-secondary
    color: $fg
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    font-size: 0.8125rem
    line-height: 1.5
    overflow-x: auto
    white-space: pre-wrap
    word-break: break-word

  // error state — red-tinted
  &--error &__code
    background-color: hsl(0 84% 60% / 0.05)
    color: hsl(0 84% 60%)
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:         hsl(222 47% 6%)
  $bg-secondary-dark: hsl(217 33% 17%)
  $fg-dark:         hsl(210 40% 98%)
  $fg-muted-dark:   hsl(215 16% 65%)
  $border-dark:     hsl(217 33% 17%)

  .tool
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark

  .tool-header
    &__name
      color: $fg-dark
    > svg
      color: $fg-muted-dark

  .tool-badge
    &--pending
      +status-badge(transparent, $fg-muted-dark, $border-dark)
    &--running
      +status-badge(hsl(217 91% 60% / 0.15), hsl(217 91% 70%), hsl(217 91% 60% / 0.4))
    &--completed
      +status-badge(hsl(142 76% 36% / 0.15), hsl(142 76% 60%), hsl(142 76% 36% / 0.4))
    &--error
      +status-badge(hsl(0 84% 60% / 0.15), hsl(0 84% 70%), hsl(0 84% 60% / 0.4))

  .tool-content
    border-top-color: $border-dark
    color: $fg-dark

  .tool-input,
  .tool-output
    &__label
      color: $fg-muted-dark
    &__code
      background-color: $bg-secondary-dark
      color: $fg-dark

  .tool-output--error &__code
    background-color: hsl(0 84% 60% / 0.1)
    color: hsl(0 84% 70%)
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="tool">
  <button class="tool-header" type="button" aria-expanded={open} onclick={() => (open = !open)}>
    <span class="tool-header__left">
      <Wrench />
      <p class="tool-header__name">getWeatherInformation</p>
    </span>

    <span class="tool-badge tool-badge--running">
      <Clock />
      Running
    </span>

    <ChevronDown class="tool-header__chevron" />
  </button>

  <div class="tool-content" data-state={open ? "open" : "closed"}>
    <div>
      <div class="tool-input">
        <p class="tool-input__label">Arguments</p>
        <pre class="tool-input__code">{`{ "city": "San Francisco" }`}</pre>
      </div>

      {#if output}
        <div class="tool-output">
          <p class="tool-output__label">Result</p>
          <pre class="tool-output__code">{output}</pre>
        </div>
      {/if}
    </div>
  </div>
</div>
```
