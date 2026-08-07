---
title: Message Branch
description: A pagination control for messages that have multiple competing versions (e.g. after a "regenerate" produces 3 alternatives). Renders a small button group with previous / next chevrons and a `2 / 3` page indicator.
---

# Message Branch

The `MessageBranch` family is used when a single user message has been answered multiple times by the model (typically because the user clicked "regenerate" several times). It provides a tiny pager — `‹` `2 of 3` `›` — that lets the user step through the alternative replies, plus the container that renders only the active version.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-transparent:     transparent
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$branch-button-size: 1.75rem       // 28px — `size-7`
$branch-page-padding: 0 0.5rem
$gap-row:            0.5rem
```

## Mixins

```sass
=branch-button-base
  display: inline-flex
  align-items: center
  justify-content: center
  width: $branch-button-size
  height: $branch-button-size
  border: 1px solid transparent
  border-radius: $radius-md
  background-color: transparent
  color: $fg-muted
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover:not(:disabled)
    background-color: $bg-muted
    color: $fg

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px

  &:disabled
    pointer-events: none
    opacity: 0.5

  > svg
    width: 1rem
    height: 1rem
    flex-shrink: 0
```

## MessageBranch (root)

The root just hosts the branch context — no visual styling of its own is required, but it does lay out its children.

```sass
.message-branch
  display: flex
  width: 100%
  flex-direction: column
  gap: 0.5rem
```

## MessageBranchSelector

A `ButtonGroup` wrapper that joins the previous / page / next buttons into a single rounded pill.

```sass
.message-branch-selector
  display: inline-flex
  align-items: stretch
  border: 1px solid $border
  border-radius: $radius-md
  overflow: hidden

  // children get split corners so they form a connected pill
  > *:first-child
    border-top-left-radius: $radius-md
    border-bottom-left-radius: $radius-md

  > *:last-child
    border-top-right-radius: $radius-md
    border-bottom-right-radius: $radius-md

  > *:not(:first-child):not(:last-child)
    border-radius: 0
```

## MessageBranchPrevious / MessageBranchNext

Small ghost icon buttons with left/right chevrons. Disabled when there is only one branch.

```sass
.message-branch-previous
  +branch-button-base()

.message-branch-next
  +branch-button-base()
```

## MessageBranchPage

The middle text element that shows `2 of 3`. Sits between the two chevrons inside the `ButtonGroup`.

```sass
.message-branch-page
  display: inline-flex
  align-items: center
  padding: $branch-page-padding
  background-color: $bg-transparent
  border: 0
  font-size: 0.75rem
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
  color: $fg-muted
  user-select: none
  -webkit-user-select: none
```

## MessageBranchContent

A vertical stack that renders only the currently-active branch version; inactive versions are kept in the DOM (for state preservation) but hidden.

```sass
.message-branch-content
  display: flex
  flex-direction: column
  gap: 0.5rem
  width: 100%

  > .message-branch-version
    display: none
    overflow: hidden

    > .message-content
      padding-bottom: 0

    &[data-active="true"]
      display: grid
      gap: 0.5rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-muted-dark:  hsl(217 33% 17%)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)
  $border-dark:    hsl(217 33% 17%)

  .message-branch-selector
    border-color: $border-dark

  .message-branch-previous,
  .message-branch-next
    color: $fg-muted-dark
    &:hover:not(:disabled)
      background-color: $bg-muted-dark
      color: $fg-dark

  .message-branch-page
    color: $fg-muted-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="message-branch">
  <div class="message-branch-content">
    {#each versions as version, i}
      <div class="message-branch-version" data-active={i === current}>
        <div class="message-content">
          <div class="message-response">{version.text}</div>
        </div>
      </div>
    {/each}
  </div>

  <div class="message-branch-selector">
    <button class="message-branch-previous" type="button" aria-label="Previous branch" disabled={current === 0}>
      <ChevronLeft />
    </button>
    <span class="message-branch-page">{current + 1} of {versions.length}</span>
    <button class="message-branch-next" type="button" aria-label="Next branch" disabled={current === versions.length - 1}>
      <ChevronRight />
    </button>
  </div>
</div>
```
