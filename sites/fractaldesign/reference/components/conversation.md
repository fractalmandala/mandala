---
title: Conversation
description: A scrollable chat container that auto-sticks to the bottom of the message list as new messages stream in. Used as the root wrapper for chat message threads.
---

# Conversation

The `Conversation` family provides the outer scroll container for a chat transcript, the inner scrollable content area, a placeholder empty state, and a floating "scroll to bottom" button. Built on top of a small "stick-to-bottom" store that tracks scroll position and forces the view to the bottom when new content arrives.

In the original implementation the components rely entirely on Tailwind utility classes and shadcn primitives. Below is the equivalent pure-Sass (indented syntax) styling that recreates the same look and behavior without any Tailwind, shadcn, or utility-class dependency. All colors, radii, and motion timings are pulled from design tokens that mirror shadcn's `--*` CSS variables.

## Tokens

```sass
// design tokens that mirror shadcn / tailwind defaults
$bg:                 hsl(0 0% 100%)
$bg-elevated:        hsl(0 0% 100%)
$bg-overlay:         hsl(0 0% 100% / 0.8)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$border-strong:      hsl(214 32% 91% / 0.5)
$shadow-sm:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$shadow-lg:          0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -4px hsl(0 0% 0% / 0.1)
$shadow-xl:          0 20px 25px -5px hsl(0 0% 0% / 0.1), 0 8px 10px -6px hsl(0 0% 0% / 0.1)
$radius-md:          0.375rem
$radius-full:        9999px
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$backdrop-blur:      8px
$breakpoint-sm:      640px
```

## Mixins

```sass
=flex-center
  display: flex
  align-items: center
  justify-content: center

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

=fade-in-up($y: 10px, $duration: 300ms)
  opacity: 0
  transform: translateY($y)
  animation: fadeInUp $duration cubic-bezier(0.34, 1.56, 0.64, 1) forwards

@keyframes fadeInUp
  to
    opacity: 1
    transform: translateY(0)

@keyframes fadeOutDown
  from
    opacity: 1
    transform: translateY(0)
  to
    opacity: 0
    transform: translateY(10px)
```

## Conversation (root container)

```sass
.conversation
  position: relative
  display: flex
  height: 100%
  flex-direction: column
  overflow: hidden
  background-color: $bg
  color: $fg
```

## ConversationContent

The inner scroller. It is a normal flex column that grows to fill the root, with smooth-scroll behavior so the stick-to-bottom logic can animate.

```sass
.conversation-content
  display: flex
  flex: 1 1 auto
  flex-direction: column
  gap: 1rem
  overflow-y: auto
  padding: 1rem
  scroll-behavior: smooth

  // when new content arrives while the user is parked at the bottom
  &.is-at-bottom
    scroll-behavior: smooth

  // user has scrolled up — preserve their position, don't force-jump
  &.is-scrolled-up
    scroll-behavior: auto
```

## ConversationEmptyState

Centered placeholder shown when the transcript is empty. Stacks an optional icon, a title and a muted description.

```sass
.conversation-empty-state
  display: flex
  width: 100%
  height: 100%
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 0.75rem
  padding: 2rem
  text-align: center
  color: $fg

  &__icon
    color: $fg-muted

    > svg
      width: 1.5rem
      height: 1.5rem

  &__text
    display: flex
    flex-direction: column
    gap: 0.25rem

  &__title
    margin: 0
    font-size: 0.875rem
    font-weight: 500
    line-height: 1.25
    color: $fg

  &__description
    margin: 0
    font-size: 0.875rem
    line-height: 1.25
    color: $fg-muted
```

## ConversationScrollButton

A floating, pill-shaped "jump to bottom" trigger that appears in the center-bottom of the viewport only when the user has scrolled up. Uses a backdrop blur, a circular border, and an arrow icon. Animates in with a subtle upward fly and out with a downward fly.

```sass
.conversation-scroll-button-wrapper
  position: absolute
  bottom: 1rem
  left: 50%
  transform: translateX(-50%)
  z-index: 10

  // entry transition — flies up and fades in
  &--entering
    +fade-in-up(10px, 300ms)

  // exit transition — flies down and fades out
  &--leaving
    animation: fadeOutDown 200ms cubic-bezier(0.4, 0, 1, 1) forwards

.conversation-scroll-button
  display: inline-flex
  align-items: center
  justify-content: center
  width: 2.25rem
  height: 2.25rem
  border-radius: $radius-full
  border: 1px solid $border-strong
  background-color: $bg-overlay
  color: $fg
  box-shadow: $shadow-lg
  backdrop-filter: blur($backdrop-blur)
  -webkit-backdrop-filter: blur($backdrop-blur)
  cursor: pointer
  transition: background-color $transition, box-shadow $transition, transform $transition

  &:hover
    background-color: hsl(0 0% 100% / 0.9)
    box-shadow: $shadow-xl

  &:active
    transform: translateY(1px)

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px

  &:disabled
    pointer-events: none
    opacity: 0.5

  > svg
    width: 1rem
    height: 1rem
    pointer-events: none
    flex-shrink: 0
```

## Dark mode overrides

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:            hsl(222 47% 6%)
  $fg-dark:            hsl(210 40% 98%)
  $fg-muted-dark:      hsl(215 16% 65%)
  $border-dark:        hsl(217 33% 17%)
  $border-strong-dark: hsl(217 33% 17% / 0.5)
  $bg-overlay-dark:    hsl(222 47% 6% / 0.8)

  .conversation
    background-color: $bg-dark
    color: $fg-dark

  .conversation-empty-state
    color: $fg-dark
    &__title
      color: $fg-dark
    &__description
      color: $fg-muted-dark
    &__icon
      color: $fg-muted-dark

  .conversation-scroll-button
    background-color: $bg-overlay-dark
    border-color: $border-strong-dark
    color: $fg-dark

    &:hover
      background-color: hsl(222 47% 6% / 0.9)
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="conversation" bind:this={ref}>
  <ConversationContent class="conversation-content">
    {#each messages as m}
      <Message from={m.role}>{m.content}</Message>
    {/each}
  </ConversationContent>

  {#if !isAtBottom}
    <div class="conversation-scroll-button-wrapper">
      <button class="conversation-scroll-button" onclick={scrollToBottom}>
        <ArrowDown />
      </button>
    </div>
  {/if}
</div>
```
