---
title: Suggestion
description: Horizontally-scrolling chips displayed in the empty state of a chat — clickable prompts that auto-fill the input. Often used for example questions or quick actions.
---

# Suggestion

The `Suggestion` family is a small, horizontally-scrolling row of pre-canned prompt chips. Each `Suggestion` is a rounded pill button that fills the prompt input on click. `Suggestions` is the scroll container.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-secondary:       hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$radius-full:        9999px
$radius-md:          0.375rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$chip-padding-x:     1rem        // 16px — `px-4`
$chip-height-sm:     2rem        // 32px — `h-8`
$gap-row:            0.5rem
```

## Mixins

```sass
=focus-ring
  outline: 2px solid $fg
  outline-offset: 2px

=chip-base
  display: inline-flex
  align-items: center
  justify-content: center
  height: $chip-height-sm
  padding: 0 $chip-padding-x
  border: 1px solid $border
  border-radius: $radius-full
  background-color: $bg
  color: $fg
  font-size: 0.875rem
  font-weight: 500
  cursor: pointer
  white-space: nowrap
  user-select: none
  -webkit-user-select: none
  transition: background-color $transition, color $transition, border-color $transition
```

## Suggestion (single chip)

```sass
.suggestion
  +chip-base()

  &:hover
    background-color: $bg-muted
    color: $fg

  &:focus-visible
    +focus-ring

  &:active
    transform: translateY(1px)

  // outline variant (default)
  &--outline
    background-color: $bg
    border-color: $border

    &:hover
      background-color: $bg-muted

  // secondary
  &--secondary
    background-color: $bg-secondary
    border-color: transparent

    &:hover
      background-color: hsl(210 40% 92%)

  // ghost
  &--ghost
    background-color: transparent
    border-color: transparent

    &:hover
      background-color: $bg-muted

  // leading icon slot
  > svg
    width: 1rem
    height: 1rem
    margin-right: 0.5rem
    color: $fg-muted
```

## Suggestions (horizontal scroller)

```sass
.suggestions
  display: flex
  width: 100%
  overflow-x: auto
  overflow-y: hidden
  white-space: nowrap

  // hide scrollbar visually but keep scroll functionality
  scrollbar-width: thin
  scrollbar-color: $border transparent

  &::-webkit-scrollbar
    height: 6px

  &::-webkit-scrollbar-track
    background: transparent

  &::-webkit-scrollbar-thumb
    background-color: $border
    border-radius: 9999px

  > .suggestions__inner
    display: inline-flex
    flex-wrap: nowrap
    align-items: center
    gap: $gap-row
    width: max-content
    padding: 0.25rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:         hsl(222 47% 6%)
  $bg-muted-dark:   hsl(217 33% 17%)
  $bg-secondary-dark: hsl(217 33% 17%)
  $fg-dark:         hsl(210 40% 98%)
  $fg-muted-dark:   hsl(215 16% 65%)
  $border-dark:     hsl(217 33% 17%)

  .suggestion
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark

    &:hover
      background-color: $bg-muted-dark

    &--secondary
      background-color: $bg-secondary-dark
      &:hover
        background-color: hsl(217 33% 22%)

    &--ghost
      &:hover
        background-color: $bg-muted-dark

    > svg
      color: $fg-muted-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="suggestions">
  <div class="suggestions__inner">
    <button class="suggestion suggestion--outline" type="button" onclick={() => fill("Explain this code")}>
      Explain this code
    </button>
    <button class="suggestion suggestion--outline" type="button" onclick={() => fill("Write tests for src/utils.ts")}>
      Write tests for src/utils.ts
    </button>
    <button class="suggestion suggestion--outline" type="button" onclick={() => fill("Summarize recent commits")}>
      Summarize recent commits
    </button>
  </div>
</div>
```
