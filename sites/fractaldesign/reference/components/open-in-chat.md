---
title: Open In Chat
description: A dropdown menu that lets the user open the current message in another AI chat product (ChatGPT, Claude, v0, Scira, T3 chat, GitHub Copilot). Each item deep-links with the current prompt pre-filled into the target tool.
---

# Open In Chat

The `OpenIn` family is a thin wrapper around the underlying `DropdownMenu` primitive that:

1. Tracks the current prompt via context.
2. Renders an "Open in chat" trigger button.
3. Renders a menu of provider-specific deep links (ChatGPT, Claude, v0, Scira, T3, GitHub).

Each provider-specific item is its own component (`OpenInChatGPT`, `OpenInClaude`, etc.) that uses the shared context to build the correct URL.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-accent:          hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$shadow-lg:          0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -4px hsl(0 0% 0% / 0.1)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$menu-min-width:     210px
$item-padding:       0.5rem 0.625rem
$gap-row:            0.5rem
$icon-size:          1em
```

## Mixins

```sass
=focus-ring
  outline: 2px solid $fg
  outline-offset: 2px

=menu-row
  display: flex
  align-items: center
  gap: 0.5rem
  padding: $item-padding
  border-radius: $radius-md
  cursor: pointer
  font-size: 0.875rem
  color: $fg
  user-select: none
  -webkit-user-select: none
  transition: background-color $transition, color $transition
```

## OpenIn (root — dropdown menu wrapper)

```sass
.open-in
  position: relative
  display: inline-block
```

### OpenIn dropdown content

```sass
.open-in-content
  z-index: 50
  min-width: $menu-min-width
  overflow: hidden
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg
  color: $fg
  padding: 0.25rem
  box-shadow: $shadow-lg
```

## OpenInTrigger

The button that opens the menu. Defaults to an outline button labeled "Open in chat" with a chevron-down.

```sass
.open-in-trigger
  display: inline-flex
  align-items: center
  gap: 0.5rem
  height: 2.25rem
  padding: 0 0.75rem
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg
  color: $fg
  font-size: 0.875rem
  font-weight: 500
  cursor: pointer
  transition: background-color $transition, border-color $transition

  &:hover
    background-color: $bg-muted

  &:focus-visible
    +focus-ring

  > svg
    width: 1rem
    height: 1rem
    margin-left: 0.5rem
    color: $fg-muted
```

## OpenInItem

A single menu row. Wraps the underlying link/button so the row visually highlights on hover but stays semantic.

```sass
.open-in-item
  +menu-row()

  &[data-highlighted],
  &:hover
    background-color: $bg-accent
    color: $fg

  &[data-disabled]
    opacity: 0.5
    cursor: not-allowed

  > a
    display: flex
    align-items: center
    gap: $gap-row
    width: 100%
    color: inherit
    text-decoration: none

    &:focus-visible
      +focus-ring

  // trailing external-link icon
  > svg:last-child
    width: 1rem
    height: 1rem
    color: $fg-muted
    margin-left: auto
    flex-shrink: 0

  // brand icon slot
  > .open-in-item__icon
    flex-shrink: 0
    display: inline-flex
    align-items: center
    justify-content: center
    width: $icon-size
    height: $icon-size
    color: $fg-muted

  > .open-in-item__label
    flex: 1 1 auto
```

## OpenInLabel

A non-interactive section heading inside the menu.

```sass
.open-in-label
  padding: 0.375rem 0.625rem
  font-size: 0.6875rem
  font-weight: 600
  letter-spacing: 0.05em
  text-transform: uppercase
  color: $fg-muted
```

## OpenInSeparator

A 1px hairline between groups.

```sass
.open-in-separator
  height: 1px
  margin: 0.25rem 0
  background-color: $border
```

## Provider-specific items (OpenInChatGPT, OpenInClaude, OpenInV0, OpenInScira, OpenInT3, OpenInClaude …)

These all share the `.open-in-item` styling and just supply a different brand icon and target URL.

```sass
.open-in-chatgpt
  @extend .open-in-item

.open-in-claude
  @extend .open-in-item

.open-in-v0
  @extend .open-in-item

.open-in-scira
  @extend .open-in-item

.open-in-t3
  @extend .open-in-item

.open-in-github
  @extend .open-in-item
```

> Note: `@extend` is valid in indented Sass. If you prefer not to use `@extend`, simply copy the `.open-in-item` block into each provider rule.

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:       hsl(222 47% 6%)
  $bg-muted-dark: hsl(217 33% 17%)
  $bg-accent-dark: hsl(217 33% 17%)
  $fg-dark:       hsl(210 40% 98%)
  $fg-muted-dark: hsl(215 16% 65%)
  $border-dark:   hsl(217 33% 17%)

  .open-in-content
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark

  .open-in-trigger
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark
    &:hover
      background-color: $bg-muted-dark

  .open-in-item
    color: $fg-dark
    &[data-highlighted],
    &:hover
      background-color: $bg-accent-dark

  .open-in-label
    color: $fg-muted-dark

  .open-in-separator
    background-color: $border-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<span class="open-in">
  <button class="open-in-trigger" type="button">
    Open in chat
    <ChevronDown />
  </button>

  <div class="open-in-content">
    <div class="open-in-label">AI providers</div>

    <div class="open-in-chatgpt">
      <a href="https://chatgpt.com/?q={query}" target="_blank" rel="noopener">
        <span class="open-in-item__icon"><ChatGPTIcon /></span>
        <span class="open-in-item__label">ChatGPT</span>
      </a>
    </div>

    <div class="open-in-claude">
      <a href="https://claude.ai/new?q={query}" target="_blank" rel="noopener">
        <span class="open-in-item__icon"><ClaudeIcon /></span>
        <span class="open-in-item__label">Claude</span>
      </a>
    </div>

    <div class="open-in-separator"></div>

    <div class="open-in-v0">
      <a href="https://v0.dev?text={query}" target="_blank" rel="noopener">
        <span class="open-in-item__icon"><V0Icon /></span>
        <span class="open-in-item__label">v0</span>
      </a>
    </div>
  </div>
</span>
```
