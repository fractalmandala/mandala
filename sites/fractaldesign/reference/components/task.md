---
title: Task
description: A collapsible disclosure for a single sub-task within a larger job — e.g. a search query, a file read, or a discrete computation. Mirrors the visual pattern of `Tool` but with a more compact body suitable for short status text and inline file chips.
---

# Task

The `Task` family is the lightweight cousin of `Tool` — used when the model reports a single discrete operation (a search query, a function call) rather than a full tool invocation. The trigger shows a search icon and the task title; the content renders a left-bordered column of result items.

The styling below is pure indented Sass.

## Tokens

```sass
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-popover:         hsl(222 47% 11%)
$bg:                 hsl(0 0% 100%)
$bg-secondary:       hsl(210 40% 96%)
$border:             hsl(214 32% 91%)
$border-muted:       hsl(214 32% 91%)
$radius-md:          0.375rem
$transition:         200ms cubic-bezier(0.4, 0, 0.2, 1)
$icon-size:          1rem
$gap-row:            0.5rem
$indent-pl:          1rem         // 16px — `pl-4`
$border-indent:      2px
$file-padding-x:     0.375rem     // 6px — `px-1.5`
$file-padding-y:     0.125rem     // 2px — `py-0.5`
```

## Mixins

```sass
=focus-ring
  outline: 2px solid $fg
  outline-offset: 2px

=collapsible-fade-slide
  &[data-state="open"]
    animation: task-in 250ms $transition forwards
  &[data-state="closed"]
    animation: task-out 200ms $transition forwards

@keyframes task-in
  from
    opacity: 0
    transform: translateY(-8px)
  to
    opacity: 1
    transform: translateY(0)

@keyframes task-out
  from
    opacity: 1
    transform: translateY(0)
  to
    opacity: 0
    transform: translateY(-8px)
```

## Task (root)

```sass
.task
  display: flex
  flex-direction: column
  width: 100%
  color: $fg
  +collapsible-fade-slide
```

## TaskTrigger

The header row. Search icon, title text, chevron that rotates on open.

```sass
.task-trigger
  display: flex
  width: 100%
  align-items: center
  gap: 0.5rem
  padding: 0
  border: 0
  background: transparent
  text-align: left
  cursor: pointer

  &__inner
    display: flex
    width: 100%
    align-items: center
    gap: 0.5rem
    color: $fg-muted
    font-size: 0.875rem
    transition: color $transition

  &:hover &__inner
    color: $fg

  &:focus-visible
    +focus-ring
    border-radius: $radius-md

  > svg:first-of-type
    width: $icon-size
    height: $icon-size
    flex-shrink: 0

  > p
    margin: 0
    flex: 1 1 auto
    font-size: 0.875rem
    color: inherit

  > svg:last-of-type
    width: $icon-size
    height: $icon-size
    flex-shrink: 0
    transition: transform $transition
    transform: rotate(0deg)

  &[aria-expanded="true"] > svg:last-of-type
    transform: rotate(180deg)
```

## TaskContent

The collapsible body. Indented column with a left vertical rule.

```sass
.task-content
  display: grid
  grid-template-rows: 1fr
  overflow: hidden
  transition: grid-template-rows $transition
  color: $fg-popover

  &[data-state="closed"]
    grid-template-rows: 0fr

  &[data-state="open"]
    grid-template-rows: 1fr

  > div
    min-height: 0
    margin-top: 1rem
    padding-left: $indent-pl
    border-left: $border-indent solid $border-muted
    display: flex
    flex-direction: column
    gap: $gap-row

  +collapsible-fade-slide
```

## TaskItem

A single line of result text inside the content area.

```sass
.task-item
  font-size: 0.875rem
  line-height: 1.4
  color: $fg-muted
```

## TaskItemFile

A small inline pill that represents a referenced file inside a task item.

```sass
.task-item-file
  display: inline-flex
  align-items: center
  gap: 0.25rem
  padding: $file-padding-y $file-padding-x
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg-secondary
  color: $fg
  font-size: 0.75rem
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
  white-space: nowrap

  > svg
    width: 0.75rem
    height: 0.75rem
    color: $fg-muted
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)
  $bg-secondary-dark: hsl(217 33% 17%)
  $border-dark:    hsl(217 33% 17%)

  .task
    color: $fg-dark

  .task-trigger__inner
    color: $fg-muted-dark
    &:hover
      color: $fg-dark

  .task-content
    color: $fg-muted-dark
    > div
      border-left-color: $border-dark

  .task-item
    color: $fg-muted-dark

  .task-item-file
    background-color: $bg-secondary-dark
    border-color: $border-dark
    color: $fg-dark
    > svg
      color: $fg-muted-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="task">
  <button class="task-trigger" type="button" aria-expanded={open} onclick={() => (open = !open)}>
    <span class="task-trigger__inner">
      <Search />
      <p>Searching for "long-context survey"</p>
      <ChevronDown />
    </span>
  </button>

  <div class="task-content" data-state={open ? "open" : "closed"}>
    <div>
      <div class="task-item">Found 4 results</div>
      <div class="task-item">
        Read
        <span class="task-item-file">src/server.ts</span>
        and
        <span class="task-item-file">src/utils.ts</span>
      </div>
    </div>
  </div>
</div>
```
