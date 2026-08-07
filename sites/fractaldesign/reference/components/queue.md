---
title: Queue
description: A scrollable, collapsible list of pending tool calls or background tasks. Each item shows a completion indicator, the call description, and a contextual action (cancel, retry). Sections can be collapsed/expanded so a long queue stays scannable.
---

# Queue

The `Queue` family renders the "what's still running" panel — typically shown above or alongside the chat transcript while the assistant is executing several tool calls in parallel.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-muted-40:        hsl(210 40% 96% / 0.4)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-muted-20:        hsl(215 16% 47% / 0.2)
$fg-muted-10:        hsl(215 16% 47% / 0.1)
$fg-muted-50:        hsl(215 16% 47% / 0.5)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$radius-lg:          0.75rem
$shadow-xs:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$padding-card:       0.5rem 0.75rem
$gap-row:            0.5rem
$indicator-size:     0.625rem      // 10px — `size-2.5`
$list-max-height:    10rem         // 160px — `max-h-40`
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
  width: 1.5rem
  height: 1.5rem
  border: 0
  border-radius: $radius-md
  background-color: transparent
  color: $fg-muted
  cursor: pointer
  opacity: 0
  transition: opacity $transition, background-color $transition, color $transition

  &:hover
    background-color: $fg-muted-10
    color: $fg

  &:focus-visible
    +focus-ring
    opacity: 1

  > svg
    width: 0.875rem
    height: 0.875rem
```

## Queue (root)

The card-style container for the queue.

```sass
.queue
  display: flex
  flex-direction: column
  gap: 0.5rem
  padding: $padding-card
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg
  color: $fg
  box-shadow: $shadow-xs
```

## QueueList

A scrollable list with a hard cap on visible height. Items past the cap are reachable via a native scrollbar.

```sass
.queue-list
  margin-top: 0.5rem
  margin-bottom: -0.25rem

  > [data-slot="scroll-area-viewport"] > *
    max-height: $list-max-height
    padding-right: 1rem

  ul
    list-style: none
    margin: 0
    padding: 0
```

## QueueSection (collapsible wrapper)

Wraps one or more items under a header.

```sass
.queue-section
  display: flex
  flex-direction: column
  gap: 0.25rem
```

## QueueSectionTrigger

The header row. Hovering lifts the background to muted; chevron rotates when expanded.

```sass
.queue-section-trigger
  display: flex
  width: 100%
  align-items: center
  justify-content: space-between
  padding: 0.5rem 0.75rem
  border: 0
  border-radius: $radius-md
  background-color: $bg-muted-40
  color: $fg-muted
  font-size: 0.875rem
  font-weight: 500
  text-align: left
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
    transition: transform $transition
    transform: rotate(0deg)

  &[aria-expanded="true"] > svg
    transform: rotate(180deg)
```

## QueueSectionLabel

Inline label inside the trigger, with optional leading icon and trailing count badge.

```sass
.queue-section-label
  display: inline-flex
  align-items: center
  gap: 0.5rem
  font-size: 0.875rem
  font-weight: 500
  color: inherit

  &__icon
    display: inline-flex
    align-items: center
    justify-content: center
    width: 1rem
    height: 1rem
    flex-shrink: 0
    color: $fg-muted

  &__count
    margin-left: 0.25rem
    display: inline-flex
    align-items: center
    justify-content: center
    min-width: 1.25rem
    height: 1.25rem
    padding: 0 0.375rem
    border-radius: 9999px
    background-color: $fg-muted-10
    color: $fg-muted
    font-size: 0.6875rem
    font-weight: 600
    line-height: 1
```

## QueueSectionContent

The collapsible body. Animates from `0fr` (collapsed) to `1fr` (open).

```sass
.queue-section-content
  display: grid
  grid-template-rows: 1fr
  overflow: hidden
  transition: grid-template-rows $transition

  &[data-state="closed"]
    grid-template-rows: 0fr

  &[data-state="open"]
    grid-template-rows: 1fr

  > div
    min-height: 0
    display: flex
    flex-direction: column
    gap: 0.25rem
```

## QueueItem

A single row representing one queued task.

```sass
.queue-item
  display: flex
  flex-direction: column
  gap: 0.25rem
  padding: 0.25rem 0.75rem
  border-radius: $radius-md
  font-size: 0.875rem
  color: $fg
  transition: background-color $transition
  list-style: none

  &:hover
    background-color: $bg-muted
```

## QueueItemIndicator

A small dot on the left of the row. Empty (outlined) while the task is in flight; filled-in-muted with reduced contrast once complete.

```sass
.queue-item-indicator
  display: inline-block
  flex-shrink: 0
  margin-top: 0.125rem
  width: $indicator-size
  height: $indicator-size
  border-radius: 9999px
  border: 1px solid $fg-muted-50
  background-color: transparent

  // active / in-flight — pulse subtly
  &[data-completed="false"]
    animation: queue-pulse 1.5s ease-in-out infinite

  &[data-completed="true"]
    border-color: $fg-muted-20
    background-color: $fg-muted-10

@keyframes queue-pulse
  0%, 100%
    opacity: 1
  50%
    opacity: 0.5
```

## QueueItemContent

The description text. Single-line truncated; line-through when complete.

```sass
.queue-item-content
  flex: 1 1 auto
  font-size: 0.875rem
  line-height: 1.4
  color: $fg-muted
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  word-break: break-word

  &[data-completed="true"]
    text-decoration: line-through
    color: $fg-muted-50
```

## QueueItemActions / QueueItemAction

A small row of action buttons (cancel, retry) that fade in on hover.

```sass
.queue-item-actions
  display: flex
  align-items: center
  gap: 0.25rem
  flex-shrink: 0

.queue-item-action
  +icon-ghost-button()

  // fade in on row hover
  .queue-item:hover &
    opacity: 1
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:            hsl(222 47% 6%)
  $bg-muted-dark:      hsl(217 33% 17%)
  $bg-muted-40-dark:   hsl(217 33% 17% / 0.4)
  $fg-dark:            hsl(210 40% 98%)
  $fg-muted-dark:      hsl(215 16% 65%)
  $fg-muted-20-dark:   hsl(215 16% 65% / 0.2)
  $fg-muted-10-dark:   hsl(215 16% 65% / 0.1)
  $fg-muted-50-dark:   hsl(215 16% 65% / 0.5)
  $border-dark:        hsl(217 33% 17%)

  .queue
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark

  .queue-section-trigger
    background-color: $bg-muted-40-dark
    color: $fg-muted-dark
    &:hover
      background-color: $bg-muted-dark
      color: $fg-dark

  .queue-item
    color: $fg-dark
    &:hover
      background-color: $bg-muted-dark

  .queue-item-indicator
    border-color: $fg-muted-50-dark
    &[data-completed="true"]
      border-color: $fg-muted-20-dark
      background-color: $fg-muted-10-dark

  .queue-item-content
    color: $fg-muted-dark
    &[data-completed="true"]
      color: $fg-muted-50-dark

  .queue-item-action
    color: $fg-muted-dark
    &:hover
      background-color: $fg-muted-10-dark
      color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="queue">
  <button class="queue-section-trigger" type="button" aria-expanded={open}>
    <span class="queue-section-label">
      <span class="queue-section-label__icon"><Loader /></span>
      Running
      <span class="queue-section-label__count">3</span>
    </span>
    <ChevronDown />
  </button>

  {#if open}
    <div class="queue-section-content" data-state="open">
      <div>
        <ul>
          <li class="queue-item">
            <span class="queue-item-indicator" data-completed="false"></span>
            <span class="queue-item-content">Reading src/server.ts…</span>
            <div class="queue-item-actions">
              <button class="queue-item-action" aria-label="Cancel"><X /></button>
            </div>
          </li>

          <li class="queue-item">
            <span class="queue-item-indicator" data-completed="true"></span>
            <span class="queue-item-content" data-completed="true">Searched the web</span>
          </li>
        </ul>
      </div>
    </div>
  {/if}
</div>
```
