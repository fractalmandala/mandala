---
title: Message
description: The atomic unit of a chat transcript — a single bubble (user or assistant) with role-aware alignment, an optional toolbar of message-scoped actions (copy, regenerate, like), and an attachments strip above the body.
---

# Message

The `Message` family covers every visual piece of a single chat row:

- `Message` — outer wrapper with role-aware alignment
- `MessageContent` — the bubble (different shape per role)
- `MessageResponse` — the markdown streamdown body for assistant replies
- `MessageAction` / `MessageActions` — small icon buttons (copy, regenerate, like) that appear on hover
- `MessageToolbar` — bottom-of-message bar that hosts the action row plus a branch selector
- `MessageAttachment*` — image/file attachment tiles above the body

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-secondary:       hsl(210 40% 96%)
$bg-muted:           hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$bubble-padding-x:   1rem
$bubble-padding-y:   0.75rem
$bubble-max-width:   95%
$attachment-size:    6rem           // 96px — `size-24`
$gap-row:            0.5rem
$gap-actions:        0.25rem
```

## Mixins

```sass
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
    outline: 2px solid $fg
    outline-offset: 2px

  > svg
    width: 1rem
    height: 1rem
    flex-shrink: 0

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
```

## Message (root)

```sass
.message
  display: flex
  width: 100%
  max-width: $bubble-max-width
  flex-direction: column
  gap: $gap-row

  &--user
    margin-left: auto
    align-items: flex-end
    justify-content: flex-end

  &--assistant
    margin-right: auto
    align-items: flex-start
```

## MessageContent

The bubble. User bubbles get a filled secondary background with rounded corners and padding; assistant bubbles are flush (no bubble — content flows directly because assistant responses often include code blocks and tables that need full width).

```sass
.message-content
  display: flex
  width: fit-content
  max-width: 100%
  min-width: 0
  flex-direction: column
  gap: $gap-row
  overflow: hidden
  font-size: 0.875rem
  color: $fg

  .message--user &
    margin-left: auto
    background-color: $bg-secondary
    color: $fg
    border-radius: $radius-lg
    padding: $bubble-padding-y $bubble-padding-x

  .message--assistant &
    background-color: transparent
    padding: 0
    color: $fg
```

## MessageResponse

The markdown body for assistant replies. Wraps a `Streamdown` (or any markdown renderer) and removes the top/bottom margin from the first/last child to nest cleanly inside the bubble.

```sass
.message-response
  width: 100%
  height: 100%

  // flatten outer margin of first/last child for tight nesting
  > *:first-child
    margin-top: 0

  > *:last-child
    margin-bottom: 0
```

## MessageAction

A small icon button (default `size="icon"`) with an optional tooltip and screen-reader label. Inherits from the underlying `Button` ghost variant.

```sass
.message-action
  +icon-ghost-button()

  // visually-hidden label
  &__label
    +visually-hidden
```

## MessageActions

A horizontal row of action buttons. Typically rendered above or below the bubble, anchored to the side of the message.

```sass
.message-actions
  display: flex
  align-items: center
  gap: $gap-actions
```

## MessageToolbar

A footer bar that sits at the bottom of a message, separated from the body by a 1rem gap. Aligns the action row to the left and any branch selector to the right.

```sass
.message-toolbar
  display: flex
  width: 100%
  align-items: center
  justify-content: space-between
  gap: 1rem
  margin-top: 1rem
```

## MessageAttachments

A horizontal strip of attachment tiles, anchored to the trailing edge of the message (typically for user messages).

```sass
.message-attachments
  display: flex
  margin-left: auto
  width: fit-content
  flex-wrap: wrap
  align-items: flex-start
  gap: 0.5rem
```

## MessageAttachment

A 96×96 tile with an optional remove button overlaid in the top-right corner. Image attachments fill the tile; non-image attachments show a paperclip icon and filename label.

```sass
.message-attachment
  position: relative
  width: $attachment-size
  height: $attachment-size
  overflow: hidden
  border-radius: $radius-lg
  background-color: $bg-secondary
  border: 1px solid $border

  &__preview
    width: 100%
    height: 100%
    object-fit: cover
    display: block

  &__placeholder
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    width: 100%
    height: 100%
    padding: 0.5rem
    color: $fg-muted

    > svg
      width: 1.25rem
      height: 1.25rem

    > span
      margin-top: 0.25rem
      font-size: 0.6875rem
      line-height: 1rem
      text-align: center
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap
      max-width: 100%

  &__remove
    position: absolute
    top: 0.25rem
    right: 0.25rem
    display: inline-flex
    align-items: center
    justify-content: center
    width: 1.25rem
    height: 1.25rem
    border-radius: 9999px
    background-color: hsl(0 0% 0% / 0.6)
    color: hsl(0 0% 100%)
    cursor: pointer
    opacity: 0
    transition: opacity $transition
    border: 0

    > svg
      width: 0.75rem
      height: 0.75rem

  &:hover &__remove,
  &:focus-within &__remove
    opacity: 1

  &:focus-within
    outline: 2px solid $fg
    outline-offset: 2px
```

## MessageAttachmentPreview

A larger preview dialog (used when the user clicks an attachment tile). The image is shown at its natural aspect ratio, capped to the viewport.

```sass
.message-attachment-preview
  position: fixed
  inset: 0
  z-index: 50
  display: flex
  align-items: center
  justify-content: center
  background-color: hsl(0 0% 0% / 0.8)
  padding: 2rem

  &__image
    max-width: min(94vw, 1100px)
    max-height: min(85vh, 900px)
    border-radius: $radius-md
    object-fit: contain
    background-color: $bg
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:         hsl(222 47% 6%)
  $bg-secondary-dark: hsl(217 33% 17%)
  $bg-muted-dark:   hsl(217 33% 17%)
  $fg-dark:         hsl(210 40% 98%)
  $fg-muted-dark:   hsl(215 16% 65%)
  $border-dark:     hsl(217 33% 17%)

  .message
    color: $fg-dark

  .message-content
    color: $fg-dark
    .message--user &
      background-color: $bg-secondary-dark
      color: $fg-dark

  .message-action
    color: $fg-muted-dark
    &:hover
      background-color: $bg-muted-dark
      color: $fg-dark

  .message-attachment
    background-color: $bg-secondary-dark
    border-color: $border-dark

    &__placeholder
      color: $fg-muted-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="message message--user">
  <div class="message-attachments">
    <div class="message-attachment">
      <img class="message-attachment__preview" src="..." alt="screenshot.png" />
      <button class="message-attachment__remove" type="button" aria-label="Remove">
        <X />
      </button>
    </div>
  </div>

  <div class="message-content">
    Can you summarize this?
  </div>
</div>

<div class="message message--assistant">
  <div class="message-content">
    <div class="message-response">
      <p>Sure — the screenshot shows…</p>
    </div>

    <div class="message-toolbar">
      <div class="message-actions">
        <button class="message-action" type="button" aria-label="Copy">
          <Copy />
        </button>
        <button class="message-action" type="button" aria-label="Regenerate">
          <Refresh />
        </button>
      </div>
    </div>
  </div>
</div>
```
