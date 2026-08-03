---
title: Prompt Input
description: The composer at the bottom of the chat — a multi-region form with a header (attachments / selected tools), a body (textarea), and a toolbar (submit button, model picker, slash-menu). Supports drag-and-drop file attachments and a global paste listener.
---

# Prompt Input

The `PromptInput` family is the chat composer:

- `PromptInput` (root form) — wraps the whole composer and handles attachments + submit
- `PromptInputProvider` — provides controller state when no `<form>` wrapper is needed
- `PromptInputHeader` — top slot for attachments / active tool chips
- `PromptInputBody` — middle slot, typically contains the textarea
- `PromptInputTools` — bottom-left slot, contains action-menu items (e.g. attach file)
- `PromptInputToolbar` — bottom row that contains the tools slot + submit button
- `PromptInputActionMenu*` — popover menu of available actions
- `PromptInputAttachments*` — the strip of attached files / images

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-secondary:       hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$placeholder:        hsl(215 16% 65%)
$border:             hsl(214 32% 91%)
$border-strong:      hsl(214 32% 91% / 0.5)
$radius-md:          0.5rem
$radius-lg:          0.75rem
$shadow-sm:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$attachment-size:    6rem
$gap-row:            0.25rem
$textarea-min-height: 3rem
$textarea-max-height: 12rem
```

## Mixins

```sass
=focus-ring
  outline: 2px solid $fg
  outline-offset: 2px

=icon-ghost-button
  display: inline-flex
  align-items: center
  justify-content: center
  width: 2rem
  height: 2rem
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
    +focus-ring

  > svg
    width: 1rem
    height: 1rem
```

## PromptInput (root form)

```sass
.prompt-input
  position: relative
  display: flex
  flex-direction: column
  width: 100%
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg-card
  color: $fg
  box-shadow: $shadow-sm
  overflow: hidden
  transition: border-color $transition, box-shadow $transition

  &:focus-within
    border-color: $fg
    box-shadow: $shadow-md
```

## PromptInputProvider (no form, just controller)

The provider variant doesn't render a wrapper; it just sets up context and renders children.

```sass
.prompt-input-provider
  display: contents
```

## PromptInputBody

The middle slot.

```sass
.prompt-input-body
  display: flex
  flex-direction: column
  flex: 1 1 auto
  min-height: 0
```

## PromptInputHeader

The top slot — used for attachments and tool chips. Wraps the items in a small padded row.

```sass
.prompt-input-header
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: $gap-row
  padding: 0.25rem
  border-bottom: 1px solid $border
```

## PromptInputTools

The bottom-left slot — typically contains the action-menu trigger.

```sass
.prompt-input-tools
  display: flex
  align-items: center
  gap: $gap-row

  // the first child gets a squared bottom-left corner so it nests into the form
  > button:first-child
    border-bottom-left-radius: $radius-lg
```

## PromptInputToolbar

The bottom row. Space-between so tools sit left and submit sits right.

```sass
.prompt-input-toolbar
  display: flex
  align-items: center
  justify-content: space-between
  gap: 0.5rem
  padding: 0.25rem
```

## PromptInputTextarea

The auto-growing textarea. Sits in the body.

```sass
.prompt-input-textarea
  display: block
  width: 100%
  min-height: $textarea-min-height
  max-height: $textarea-max-height
  padding: 0.75rem 1rem
  border: 0
  background-color: transparent
  color: $fg
  font-family: inherit
  font-size: 0.875rem
  line-height: 1.5
  resize: none
  outline: none

  &::placeholder
    color: $placeholder

  &:disabled
    cursor: not-allowed
    opacity: 0.5
```

## PromptInputSubmit

The submit button — circular, primary, with a send arrow. Sits at the trailing end of the toolbar.

```sass
.prompt-input-submit
  display: inline-flex
  align-items: center
  justify-content: center
  width: 2rem
  height: 2rem
  border: 0
  border-radius: 9999px
  background-color: $fg
  color: $bg
  cursor: pointer
  transition: background-color $transition, transform $transition

  &:hover:not(:disabled)
    background-color: hsl(222 47% 15%)

  &:focus-visible
    +focus-ring

  &:active
    transform: translateY(1px)

  &:disabled
    pointer-events: none
    opacity: 0.5

  > svg
    width: 1rem
    height: 1rem
```

## PromptInputAttachments (strip)

The horizontal strip of attached files. Sits in the header.

```sass
.prompt-input-attachments
  display: flex
  flex-wrap: wrap
  gap: 0.5rem
  padding: 0.25rem
  width: 100%
```

## PromptInputAttachment (single tile)

```sass
.prompt-input-attachment
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.25rem
  width: $attachment-size
  padding: 0.5rem
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg-muted
  color: $fg
  overflow: hidden

  &__preview
    width: 100%
    aspect-ratio: 1
    object-fit: cover
    border-radius: $radius-md

  &__placeholder
    display: flex
    align-items: center
    justify-content: center
    width: 100%
    aspect-ratio: 1
    border-radius: $radius-md
    background-color: $bg-secondary
    color: $fg-muted

    > svg
      width: 1.5rem
      height: 1.5rem

  &__name
    width: 100%
    font-size: 0.6875rem
    text-align: center
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    color: $fg-muted

  &__remove
    position: absolute
    top: 0.25rem
    right: 0.25rem
    display: inline-flex
    align-items: center
    justify-content: center
    width: 1rem
    height: 1rem
    border: 0
    border-radius: 9999px
    background-color: hsl(0 0% 0% / 0.6)
    color: hsl(0 0% 100%)
    cursor: pointer
    opacity: 0
    transition: opacity $transition

    > svg
      width: 0.625rem
      height: 0.625rem

  &:hover &__remove,
  &:focus-within &__remove
    opacity: 1
```

## PromptInputActionMenu (popover)

The popover for slash-commands and tools.

```sass
.prompt-input-action-menu
  position: absolute
  bottom: calc(100% + 0.5rem)
  left: 0
  z-index: 50
  min-width: 12rem
  max-height: 16rem
  overflow-y: auto
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg
  color: $fg
  box-shadow: $shadow-md
  padding: 0.25rem

  // each item is a slim row
  &__item
    display: flex
    align-items: center
    gap: 0.5rem
    padding: 0.5rem 0.625rem
    border-radius: $radius-md
    cursor: pointer
    font-size: 0.875rem
    color: $fg
    transition: background-color $transition, color $transition

    &[data-highlighted],
    &:hover
      background-color: $bg-muted
      color: $fg

    > svg
      width: 1rem
      height: 1rem
      color: $fg-muted
      flex-shrink: 0

    > span
      flex: 1 1 auto
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:        hsl(222 47% 6%)
  $bg-card-dark:   hsl(222 47% 6%)
  $bg-muted-dark:  hsl(217 33% 17%)
  $bg-secondary-dark: hsl(217 33% 17%)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)
  $border-dark:    hsl(217 33% 17%)

  .prompt-input
    background-color: $bg-card-dark
    border-color: $border-dark
    color: $fg-dark

  .prompt-input-header
    border-bottom-color: $border-dark

  .prompt-input-textarea
    color: $fg-dark
    &::placeholder
      color: $fg-muted-dark

  .prompt-input-submit
    background-color: $fg-dark
    color: $bg-dark
    &:hover:not(:disabled)
      background-color: hsl(210 40% 95%)

  .prompt-input-tools button,
  .prompt-input-action-menu__item
    color: $fg-muted-dark
    &:hover
      background-color: $bg-muted-dark
      color: $fg-dark

  .prompt-input-attachment
    background-color: $bg-secondary-dark
    border-color: $border-dark

    &__name
      color: $fg-muted-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<form class="prompt-input" onsubmit={handleSubmit}>
  <div class="prompt-input-header">
    {#if attachments.length}
      <div class="prompt-input-attachments">
        {#each attachments as att}
          <div class="prompt-input-attachment">
            <img class="prompt-input-attachment__preview" src={att.url} />
            <span class="prompt-input-attachment__name">{att.name}</span>
            <button class="prompt-input-attachment__remove" type="button" aria-label="Remove">
              <X />
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="prompt-input-body">
    <textarea
      class="prompt-input-textarea"
      placeholder="Send a message…"
      bind:value={text}
    ></textarea>
  </div>

  <div class="prompt-input-toolbar">
    <div class="prompt-input-tools">
      <button class="prompt-input-tools button" type="button" aria-label="Add attachment">
        <Paperclip />
      </button>
    </div>

    <button class="prompt-input-submit" type="submit" disabled={!text}>
      <ArrowUp />
    </button>
  </div>
</form>
```
