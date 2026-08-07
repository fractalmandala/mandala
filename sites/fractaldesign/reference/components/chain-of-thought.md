---
title: Chain of Thought
description: A collapsible disclosure that reveals the assistant's intermediate reasoning steps. Each step is a row with a status indicator (complete / active / pending), an icon, and an optional description. Useful for transparency, debugging, and surfacing tool traces.
---

# Chain of Thought

The `ChainOfThought` family renders the model's "scratchpad" — a brain-icon header that toggles open and closed, followed by an indented list of reasoning steps. Each step has its own state (complete, active, pending) and animates in with a staggered fade when the disclosure opens.

The original implementation leans heavily on shadcn's `Collapsible` primitive plus Tailwind's `data-` state variants. The styling below recreates the same interaction in pure indented Sass using a `[aria-expanded]` / `[data-state]` attribute pattern and a stagger-friendly animation.

## Tokens

```sass
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-muted-50:        hsl(215 16% 47% / 0.5)
$fg-soft:            hsl(222 47% 11% / 0.9)
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$transition:         200ms cubic-bezier(0.4, 0, 0.2, 1)
$step-gap:           0.75rem
$step-indent:        1rem
$icon-size:          1rem
$stagger-step:       60ms
```

## Mixins

```sass
=fade-slide-in($y: -8px, $duration: 250ms)
  opacity: 0
  transform: translateY($y)
  animation: cot-fade-slide $duration $transition forwards

=fade-slide-out($y: -8px, $duration: 200ms)
  opacity: 1
  transform: translateY(0)
  animation: cot-fade-slide-out $duration $transition forwards

@keyframes cot-fade-slide
  to
    opacity: 1
    transform: translateY(0)

@keyframes cot-fade-slide-out
  to
    opacity: 0
    transform: translateY(-8px)

@keyframes cot-step-in
  from
    opacity: 0
    transform: translateX(-6px)
  to
    opacity: 1
    transform: translateX(0)
```

## ChainOfThought (root)

```sass
.chain-of-thought
  display: flex
  flex-direction: column
  gap: 0.5rem
  color: $fg
```

## ChainOfThoughtHeader

The always-visible trigger that toggles the disclosure. Renders a brain icon, a title, and a chevron that rotates 180° when open.

```sass
.chain-of-thought-header
  display: flex
  width: 100%
  align-items: center
  gap: 0.5rem
  padding: 0
  border: 0
  background: transparent
  font-size: 0.875rem
  color: $fg-muted
  cursor: pointer
  text-align: left
  transition: color $transition

  &:hover
    color: $fg

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px
    border-radius: $radius-md

  // icon area (brain)
  > svg:first-of-type
    width: $icon-size
    height: $icon-size
    flex-shrink: 0

  // title text — takes remaining horizontal space
  > span
    flex: 1 1 auto

  // chevron
  > svg:last-of-type
    width: $icon-size
    height: $icon-size
    flex-shrink: 0
    transition: transform $transition
    transform: rotate(0deg)

  &[aria-expanded="true"] > svg:last-of-type
    transform: rotate(180deg)
```

## ChainOfThoughtContent

The collapsible body. Uses CSS Grid to animate `grid-template-rows` between `0fr` and `1fr` — this is the modern technique for animating to "auto" height without hardcoding a value.

```sass
.chain-of-thought-content
  display: grid
  grid-template-rows: 1fr
  margin-top: 0.5rem
  transition: grid-template-rows $transition, opacity $transition
  overflow: hidden

  > div
    min-height: 0
    display: flex
    flex-direction: column
    gap: 0.75rem
    color: $fg

  &[data-state="closed"]
    grid-template-rows: 0fr
    opacity: 0

  &[data-state="open"]
    grid-template-rows: 1fr
    opacity: 1
```

### State-driven entry/exit animations (mirroring tailwind `data-[state=open]:animate-in` etc.)

```sass
.chain-of-thought-content
  // open
  &[data-state="open"]
    +fade-slide-in(-8px, 250ms)

  // closed
  &[data-state="closed"]
    +fade-slide-out(-8px, 200ms)
```

## ChainOfThoughtStep

A single reasoning row. Indented from the header, with a small icon, label, optional description, and a color that reflects the step's status. Each step fades in with a slight stagger as the parent disclosure opens.

```sass
.chain-of-thought-step
  position: relative
  display: flex
  align-items: flex-start
  gap: 0.5rem
  padding-left: $step-indent
  font-size: 0.875rem
  color: $fg-muted

  // staggered entry — each subsequent step is delayed by 60ms
  // The data attribute is set inline as data-stagger="0" | "1" | "2" …
  @for $i from 0 through 12
    &[data-stagger="#{$i}"]
      animation: cot-step-in 250ms $transition forwards
      animation-delay: $i * $stagger-step

  // status variants
  &--complete
    color: $fg-muted

  &--active
    color: $fg

  &--pending
    color: $fg-muted-50

  // icon
  > svg
    width: $icon-size
    height: $icon-size
    flex-shrink: 0
    margin-top: 0.125rem

  // text block
  &__body
    display: flex
    flex: 1 1 auto
    flex-direction: column
    gap: 0.125rem

  &__label
    font-weight: 500
    line-height: 1.25

  &__description
    font-size: 0.8125rem
    color: $fg-muted
```

## ChainOfThoughtSearchResults

A small horizontal row of pill badges used to show what sources the model consulted for a given step.

```sass
.chain-of-thought-search-results
  display: flex
  align-items: center
  gap: 0.5rem
  padding-left: $step-indent
```

## ChainOfThoughtSearchResult

A pill-style badge — secondary tint, smaller padding, relaxed font weight.

```sass
.chain-of-thought-search-result
  display: inline-flex
  align-items: center
  gap: 0.25rem
  padding: 0.125rem 0.5rem
  border-radius: 9999px
  background-color: $bg-muted
  color: $fg-muted
  font-size: 0.75rem
  font-weight: 400
  line-height: 1rem
  white-space: nowrap
```

## ChainOfThoughtImage

A framed preview of an image or screenshot produced during a step. Caption sits beneath in muted small text.

```sass
.chain-of-thought-image
  display: flex
  flex-direction: column
  gap: 0.5rem
  margin-top: 0.5rem
  padding-left: $step-indent

  &__frame
    position: relative
    display: flex
    align-items: center
    justify-content: center
    max-height: 22rem
    overflow: hidden
    border-radius: $radius-lg
    background-color: $bg-muted
    padding: 0.75rem

    > img
      max-width: 100%
      max-height: 100%
      object-fit: contain

  &__caption
    margin: 0
    font-size: 0.75rem
    line-height: 1rem
    color: $fg-muted
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:       hsl(222 47% 6%)
  $bg-muted-dark: hsl(217 33% 17%)
  $fg-dark:       hsl(210 40% 98%)
  $fg-muted-dark: hsl(215 16% 65%)
  $border-dark:   hsl(217 33% 17%)

  .chain-of-thought-header
    color: $fg-muted-dark
    &:hover
      color: $fg-dark

  .chain-of-thought-step
    color: $fg-muted-dark
    &--active
      color: $fg-dark
    &--pending
      color: hsl(215 16% 65% / 0.5)
    &__description
      color: $fg-muted-dark

  .chain-of-thought-search-result
    background-color: $bg-muted-dark
    color: $fg-muted-dark

  .chain-of-thought-image
    &__frame
      background-color: $bg-muted-dark
    &__caption
      color: $fg-muted-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="chain-of-thought">
  <button class="chain-of-thought-header" aria-expanded={open} onclick={() => (open = !open)}>
    <Brain />
    <span>Chain of Thought</span>
    <ChevronDown />
  </button>

  <div class="chain-of-thought-content" data-state={open ? "open" : "closed"}>
    <div>
      <div class="chain-of-thought-step chain-of-thought-step--complete" data-stagger="0">
        <Dot />
        <div class="chain-of-thought-step__body">
          <span class="chain-of-thought-step__label">Searching for React docs</span>
          <span class="chain-of-thought-step__description">3 results found</span>
        </div>
      </div>

      <div class="chain-of-thought-step chain-of-thought-step--active" data-stagger="1">
        <Loader />
        <div class="chain-of-thought-step__body">
          <span class="chain-of-thought-step__label">Drafting answer</span>
        </div>
      </div>
    </div>
  </div>
</div>
```
