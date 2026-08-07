---
title: Model Selector
description: A combobox-style picker for choosing the active model. Opens a dialog with a search-as-you-type input, grouped lists of providers and models, and shortcut hints. Each model item shows its logo, name, and any badges (e.g. "new", "beta").
---

# Model Selector

The `ModelSelector` family is a command-palette dialog that lets the user switch the underlying LLM at runtime:

- `ModelSelector` — the dialog root
- `ModelSelectorTrigger` — the button that opens it
- `ModelSelectorContent` — the dialog content (a `Command` palette)
- `ModelSelectorInput` — the search input
- `ModelSelectorList`, `ModelSelectorGroup`, `ModelSelectorItem` — the result rows
- `ModelSelectorLogo`, `ModelSelectorLogoGroup`, `ModelSelectorName`, `ModelSelectorShortcut`, `ModelSelectorSeparator`, `ModelSelectorEmpty` — supporting primitives

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-secondary:       hsl(210 40% 96%)
$bg-muted:           hsl(210 40% 96%)
$bg-accent:          hsl(210 40% 96%)
$bg-accent-strong:   hsl(214 32% 91%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$shadow-lg:          0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -4px hsl(0 0% 0% / 0.1)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$dialog-max-width:   32rem         // 512px
$dialog-max-height:  min(85vh, 600px)
$item-padding:       0.5rem 0.75rem
$item-radius:        $radius-md
$logo-size:          1rem
$gap-row:            0.25rem
```

## Mixins

```sass
=focus-ring
  outline: 2px solid $fg
  outline-offset: 2px

=item-row
  display: flex
  align-items: center
  gap: 0.5rem
  padding: $item-padding
  border-radius: $item-radius
  cursor: pointer
  font-size: 0.875rem
  user-select: none
  -webkit-user-select: none
  transition: background-color $transition, color $transition
```

## ModelSelector (dialog root)

The trigger opens a centered modal dialog with backdrop overlay.

```sass
.model-selector
  // dialog overlay
  &__overlay
    position: fixed
    inset: 0
    z-index: 50
    background-color: hsl(0 0% 0% / 0.5)
    backdrop-filter: blur(4px)
    -webkit-backdrop-filter: blur(4px)
```

## ModelSelectorTrigger

The trigger button. Looks like a plain button with the active model name and a chevron-down.

```sass
.model-selector-trigger
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
    color: $fg-muted
```

## ModelSelectorContent

The command palette inside the dialog. Floats with a strong shadow, has no internal padding (children manage their own).

```sass
.model-selector-content
  position: fixed
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  z-index: 50
  display: flex
  flex-direction: column
  width: 90vw
  max-width: $dialog-max-width
  max-height: $dialog-max-height
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg
  color: $fg
  box-shadow: $shadow-lg
  overflow: hidden
  outline: 1px solid $border
```

## ModelSelectorInput

The search-as-you-type input pinned to the top. Slightly taller than the standard command input to accommodate a clear button.

```sass
.model-selector-input
  width: 100%
  height: auto
  padding: 0.875rem 1rem
  border: 0
  border-bottom: 1px solid $border
  background-color: transparent
  color: $fg
  font-size: 0.875rem
  outline: none

  &::placeholder
    color: $fg-muted

  &:focus-visible
    outline: none
```

## ModelSelectorList

The scrollable list of results below the input.

```sass
.model-selector-list
  flex: 1 1 auto
  overflow-y: auto
  padding: 0.5rem
```

## ModelSelectorGroup

A grouped section (one per provider, e.g. "Anthropic", "OpenAI"). The heading is small caps muted text.

```sass
.model-selector-group
  display: flex
  flex-direction: column
  gap: $gap-row

  &__heading
    padding: 0.5rem 0.75rem 0.25rem
    font-size: 0.6875rem
    font-weight: 600
    line-height: 1rem
    letter-spacing: 0.05em
    text-transform: uppercase
    color: $fg-muted
```

## ModelSelectorItem

A single selectable model row. Shows logo, name, optional shortcut hint, optional badge.

```sass
.model-selector-item
  +item-row()
  color: $fg

  &[data-highlighted],
  &:hover
    background-color: $bg-accent
    color: $fg

  &[data-selected="true"]
    background-color: $bg-accent-strong
    color: $fg

  &[data-disabled="true"]
    opacity: 0.5
    cursor: not-allowed

  &__logo
    width: $logo-size
    height: $logo-size
    flex-shrink: 0
    border-radius: 0.25rem

  &__name
    flex: 1 1 auto
    font-weight: 500

  &__shortcut
    margin-left: auto
    display: inline-flex
    align-items: center
    gap: 0.125rem
    padding: 0 0.375rem
    border: 1px solid $border
    border-radius: 0.25rem
    background-color: $bg-secondary
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    font-size: 0.6875rem
    color: $fg-muted
    line-height: 1.25rem

  &__badge
    display: inline-flex
    align-items: center
    padding: 0 0.375rem
    border-radius: 9999px
    background-color: hsl(280 70% 55% / 0.1)
    color: hsl(280 70% 55%)
    font-size: 0.625rem
    font-weight: 600
    text-transform: uppercase
    letter-spacing: 0.04em
```

## ModelSelectorLogo

A 16×16 logo glyph (provider brand). Default slot.

```sass
.model-selector-logo
  width: $logo-size
  height: $logo-size
  flex-shrink: 0
  border-radius: 0.25rem
  overflow: hidden

  > svg, > img
    width: 100%
    height: 100%
    object-fit: contain
```

## ModelSelectorLogoGroup

A horizontal stack of overlapping logos (used when a model is hosted by multiple providers).

```sass
.model-selector-logo-group
  display: inline-flex
  align-items: center

  > .model-selector-logo
    margin-left: -0.375rem
    border: 2px solid $bg

    &:first-child
      margin-left: 0
```

## ModelSelectorName

```sass
.model-selector-name
  flex: 1 1 auto
  font-weight: 500
  color: inherit
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
```

## ModelSelectorShortcut

```sass
.model-selector-shortcut
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
    background-color: $bg-secondary
    font-size: 0.625rem
    color: $fg-muted
```

## ModelSelectorSeparator

A thin divider between groups inside the list.

```sass
.model-selector-separator
  height: 1px
  margin: 0.25rem 0
  background-color: $border
```

## ModelSelectorEmpty

A muted message shown when the search yields no matches.

```sass
.model-selector-empty
  padding: 1.5rem 1rem
  text-align: center
  font-size: 0.875rem
  color: $fg-muted
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:            hsl(222 47% 6%)
  $bg-muted-dark:      hsl(217 33% 17%)
  $bg-accent-dark:     hsl(217 33% 17%)
  $bg-accent-strong-dark: hsl(217 33% 22%)
  $bg-secondary-dark:  hsl(217 33% 17%)
  $fg-dark:            hsl(210 40% 98%)
  $fg-muted-dark:      hsl(215 16% 65%)
  $border-dark:        hsl(217 33% 17%)

  .model-selector-trigger
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark
    &:hover
      background-color: $bg-muted-dark

  .model-selector-content
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark

  .model-selector-input
    border-bottom-color: $border-dark
    color: $fg-dark
    &::placeholder
      color: $fg-muted-dark

  .model-selector-item
    &[data-highlighted],
    &:hover
      background-color: $bg-accent-dark
      color: $fg-dark
    &[data-selected="true"]
      background-color: $bg-accent-strong-dark
      color: $fg-dark

  .model-selector-logo-group > .model-selector-logo
    border-color: $bg-dark

  .model-selector-shortcut > kbd
    border-color: $border-dark
    background-color: $bg-secondary-dark
    color: $fg-muted-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<button class="model-selector-trigger" onclick={() => open = true}>
  Claude 3.5 Sonnet
  <ChevronDown />
</button>

{#if open}
  <div class="model-selector__overlay"></div>
  <div class="model-selector-content">
    <input class="model-selector-input" placeholder="Search models…" />

    <div class="model-selector-list">
      <div class="model-selector-group">
        <div class="model-selector-group__heading">Anthropic</div>

        <div class="model-selector-item">
          <img class="model-selector-logo" src="claude.svg" />
          <span class="model-selector-name">Claude 3.5 Sonnet</span>
          <span class="model-selector-shortcut"><kbd>⌘</kbd><kbd>1</kbd></span>
        </div>
      </div>

      <div class="model-selector-separator"></div>

      <div class="model-selector-group">
        <div class="model-selector-group__heading">OpenAI</div>
        <div class="model-selector-item">
          <img class="model-selector-logo" src="openai.svg" />
          <span class="model-selector-name">GPT-4o</span>
        </div>
      </div>
    </div>
  </div>
{/if}
```
