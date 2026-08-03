---
title: Command
description: A search-as-you-type command palette primitive. Renders an input pinned at the top, a scrollable list of selectable items (with grouping, separators, and shortcut hints) below, and an empty state. Used by `ModelSelector` and the site-wide search modal.
---

# Command

The `Command` family is the cmdk-style search palette that backs `ModelSelector` and the docs site search. It is keyboard-first, fully accessible (ARIA `combobox` / `listbox`), and supports nested groups.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-popover:         hsl(0 0% 100%)
$bg-input-30:        hsl(217 33% 17% / 0.3)
$bg-muted:           hsl(210 40% 96%)
$bg-accent:          hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-popover:         hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-accent:          hsl(222 47% 11%)
$border:             hsl(214 32% 91%)
$border-input-30:    hsl(217 33% 17% / 0.3)
$ring-foreground-10: hsl(222 47% 11% / 0.1)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$radius-xl:          0.75rem
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$input-height:       2rem        // 32px — `h-8`
$list-max-height:    18rem       // 288px — `max-h-72`
$gap-row:            0.125rem
```

## Command (root)

```sass
.command
  display: flex
  width: 100%
  height: 100%
  flex-direction: column
  overflow: hidden
  padding: 0.25rem
  border-radius: $radius-xl
  background-color: $bg-popover
  color: $fg-popover
```

## CommandInput (wrapper)

The wrapper holds the search input + a leading magnifier icon and a clear button.

```sass
.command-input-wrapper
  padding: 0.25rem 0.25rem 0

.command-input
  display: flex
  align-items: center
  height: $input-height
  padding: 0 0.5rem
  border: 1px solid $border-input-30
  border-radius: $radius-lg
  background-color: $bg-input-30
  color: $fg
  font-size: 0.875rem
  outline: none
  box-shadow: none

  &::placeholder
    color: $fg-muted

  &:focus-visible
    outline: none

  &:disabled
    cursor: not-allowed
    opacity: 0.5

  > .command-input__search-icon
    width: 1rem
    height: 1rem
    margin-right: 0.5rem
    color: $fg-muted
    flex-shrink: 0
```

## CommandList

```sass
.command-list
  max-height: $list-max-height
  overflow-x: hidden
  overflow-y: auto
  scroll-padding: 0.25rem
  outline: none

  // hide the native scrollbar visually
  &::-webkit-scrollbar
    width: 6px

  &::-webkit-scrollbar-thumb
    background-color: $border
    border-radius: 9999px
```

## CommandEmpty

```sass
.command-empty
  padding: 1.5rem 1rem
  text-align: center
  font-size: 0.875rem
  color: $fg-muted
```

## CommandLoading

```sass
.command-loading
  padding: 1rem
  text-align: center
  font-size: 0.875rem
  color: $fg-muted
```

## CommandGroup

```sass
.command-group
  display: flex
  flex-direction: column
  gap: $gap-row
  padding: $gap-row 0
  overflow: hidden
  color: $fg-popover

  // group heading
  &__heading
    padding: 0.375rem 0.5rem
    font-size: 0.6875rem
    font-weight: 600
    letter-spacing: 0.05em
    text-transform: uppercase
    color: $fg-muted
```

## CommandItem

```sass
.command-item
  position: relative
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0.375rem 0.5rem
  border-radius: $radius-md
  font-size: 0.875rem
  line-height: 1.25
  cursor: default
  user-select: none
  -webkit-user-select: none
  outline: none
  transition: background-color $transition, color $transition

  &[data-selected="true"],
  &[aria-selected="true"]
    background-color: $bg-muted
    color: $fg

    > svg
      color: $fg

  &[data-disabled="true"]
    pointer-events: none
    opacity: 0.5

  > svg
    width: 1rem
    height: 1rem
    color: $fg-muted
    flex-shrink: 0
    pointer-events: none

  // check indicator (right edge, shown when item is selected)
  > .command-item__check
    margin-left: auto
    width: 1rem
    height: 1rem
    color: $fg
    opacity: 0
    transition: opacity $transition

    .command-item[data-selected="true"] &
      opacity: 1

  // hide the check when a shortcut is present (saves space)
  .command-item:has([data-slot="command-shortcut"]) > .command-item__check
    display: none

  // special rounded corners when rendered inside a Dialog
  [data-slot="dialog-content"] &
    border-radius: $radius-lg
```

## CommandShortcut

```sass
.command-shortcut
  margin-left: auto
  display: inline-flex
  align-items: center
  gap: 0.125rem
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
  font-size: 0.6875rem
  color: $fg-muted

  > kbd
    display: inline-flex
    align-items: center
    justify-content: center
    min-width: 1.25rem
    height: 1.25rem
    padding: 0 0.25rem
    border: 1px solid $border
    border-radius: 0.25rem
    background-color: $bg
    font-size: 0.625rem
    color: $fg-muted
```

## CommandSeparator

```sass
.command-separator
  height: 1px
  margin: 0.25rem 0
  background-color: $border
```

## CommandDialog

A pre-composed dialog + command palette. Floats centered with a strong shadow.

```sass
.command-dialog
  position: fixed
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  z-index: 50
  width: 90vw
  max-width: 32rem
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg-popover
  color: $fg-popover
  box-shadow: $shadow-md
  outline: none
  overflow: hidden
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-popover-dark:    hsl(222 47% 6%)
  $bg-muted-dark:      hsl(217 33% 17%)
  $bg-input-30-dark:   hsl(217 33% 22% / 0.3)
  $border-dark:        hsl(217 33% 17%)
  $border-input-30-dark: hsl(217 33% 22% / 0.5)
  $fg-dark:            hsl(210 40% 98%)
  $fg-muted-dark:      hsl(215 16% 65%)
  $ring-dark:          hsl(210 40% 98% / 0.1)

  .command
    background-color: $bg-popover-dark
    color: $fg-dark

  .command-input
    background-color: $bg-input-30-dark
    border-color: $border-input-30-dark
    color: $fg-dark
    &::placeholder
      color: $fg-muted-dark

  .command-item
    &[data-selected="true"],
    &[aria-selected="true"]
      background-color: $bg-muted-dark
      color: $fg-dark

  .command-shortcut > kbd
    background-color: $bg-popover-dark
    border-color: $border-dark
    color: $fg-muted-dark

  .command-separator
    background-color: $border-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="command">
  <div class="command-input-wrapper">
    <div class="command-input">
      <Search class="command-input__search-icon" />
      <input placeholder="Type a command…" />
    </div>
  </div>

  <div class="command-list">
    <div class="command-group">
      <div class="command-group__heading">Suggestions</div>

      <div class="command-item">
        <Calendar />
        <span>Calendar</span>
        <span class="command-shortcut"><kbd>⌘</kbd><kbd>C</kbd></span>
      </div>

      <div class="command-item">
        <Smile />
        <span>Emoji</span>
      </div>
    </div>

    <div class="command-separator"></div>

    <div class="command-empty">No results found.</div>
  </div>
</div>
```
