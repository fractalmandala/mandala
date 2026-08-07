---
title: Checkpoint
description: A small horizontal bookmark rendered inline inside a message row, used to mark points the user can return to (e.g., before a tool call, after a step in a long chain). Visually it pairs an icon with a separator so multiple checkpoints read as a timeline.
---

# Checkpoint

The `Checkpoint` family is a small inline timestamp/marker. It renders a bookmark icon and (optionally) a tiny trailing separator so several checkpoints placed in a row read as a connected timeline. A `CheckpointTrigger` wraps the marker in a ghost-style icon button with a tooltip so the user can click to jump back.

The styling below is pure indented Sass. Colors, paddings, and gaps mirror the original Tailwind tokens.

## Tokens

```sass
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$bg-hover:           hsl(210 40% 96%)
$bg:                 hsl(0 0% 100%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$icon-size:          1rem        // 16px — `size-4`
$trigger-size:       2rem        // 32px — `size-8`
$gap:                0.125rem    // 2px  — `gap-0.5`
```

## Mixins

```sass
=icon-ghost-button
  display: inline-flex
  align-items: center
  justify-content: center
  width: $trigger-size
  height: $trigger-size
  padding: 0
  border: 1px solid transparent
  border-radius: $radius-md
  background-color: transparent
  color: $fg-muted
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    background-color: $bg-hover
    color: $fg

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px

  > svg
    width: $icon-size
    height: $icon-size
    pointer-events: none
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

## Checkpoint (root row)

A horizontal inline row that hosts a `CheckpointTrigger` followed by a trailing vertical separator. By default it lays out at the trailing edge of a message bubble — i.e., it appears as a "step marker" at the end of a paragraph.

```sass
.checkpoint
  display: inline-flex
  align-items: center
  gap: $gap
  overflow: hidden
  color: $fg-muted
  vertical-align: middle
```

The trailing separator is created with a 1px-wide, 1rem-tall pseudo-element so it visually divides adjacent checkpoints without extra markup:

```sass
.checkpoint + .checkpoint::before
  content: ""
  display: inline-block
  width: 1px
  height: 1rem
  background-color: $border
  margin: 0 0.25rem
```

## CheckpointIcon

A 16×16 bookmark glyph. The default slot uses the lucide `bookmark` icon, but consumers can replace it with any other 16×16 icon.

```sass
.checkpoint-icon
  display: inline-flex
  align-items: center
  justify-content: center
  width: $icon-size
  height: $icon-size
  flex-shrink: 0
  color: inherit

  > svg
    width: 100%
    height: 100%
```

## CheckpointTrigger

The clickable bookmark button. Defaults to ghost variant and `size="sm"`, with an optional tooltip.

```sass
.checkpoint-trigger
  +icon-ghost-button()
  font-size: 0.75rem

  // inner SVG stays the standard 1rem size
  > svg
    width: 1rem
    height: 1rem

  // visually-hidden label
  &__label
    +visually-hidden

  // state — when the bookmark is "active" / "checked"
  &--active
    color: $fg
    background-color: $bg-hover
```

### Tooltip wrapper

If `tooltip` is provided, the trigger is wrapped in a tooltip overlay. The tooltip floats above and slightly to the right, with a small arrow.

```sass
.checkpoint-tooltip
  position: relative
  display: inline-block

  &__content
    position: absolute
    bottom: calc(100% + 0.5rem)
    left: 50%
    transform: translateX(-50%)
    padding: 0.375rem 0.625rem
    border-radius: $radius-md
    background-color: hsl(222 47% 11%)
    color: hsl(210 40% 98%)
    font-size: 0.75rem
    line-height: 1rem
    white-space: nowrap
    pointer-events: none
    z-index: 50
    box-shadow: 0 4px 12px hsl(0 0% 0% / 0.15)
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)
  $bg-hover-dark:  hsl(217 33% 17%)
  $border-dark:    hsl(217 33% 17%)

  .checkpoint
    color: $fg-muted-dark

  .checkpoint + .checkpoint::before
    background-color: $border-dark

  .checkpoint-trigger
    color: $fg-muted-dark
    &:hover
      background-color: $bg-hover-dark
      color: $fg-dark
    &--active
      color: $fg-dark
      background-color: $bg-hover-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<span class="checkpoint">
  <button class="checkpoint-trigger" type="button" aria-label="Jump to step 1">
    <Bookmark class="checkpoint-icon" />
    <span class="checkpoint-trigger__label">Jump to step 1</span>
  </button>
</span>

<span class="checkpoint">
  <button class="checkpoint-trigger" type="button" aria-label="Jump to step 2">
    <Bookmark class="checkpoint-icon" />
    <span class="checkpoint-trigger__label">Jump to step 2</span>
  </button>
</span>
```
