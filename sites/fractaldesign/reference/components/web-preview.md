---
title: Web Preview
description: An in-conversation iframe preview of a generated website. Shows a URL bar with back/forward/reload navigation, a sandboxed iframe body, and an optional collapsible console panel that surfaces the preview's runtime logs.
---

# Web Preview

The `WebPreview` family is a small embedded browser used to display generated HTML/CSS/JS in real time:

- `WebPreview` — root frame
- `WebPreviewNavigation` — toolbar row with back / forward / reload buttons
- `WebPreviewNavigationButton` — single nav button (used inside the toolbar)
- `WebPreviewUrl` — the address bar (commits URL on Enter)
- `WebPreviewBody` — the sandboxed iframe
- `WebPreviewConsole` — collapsible panel of browser log entries

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-secondary:       hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$nav-button-size:    2rem        // 32px — `h-8 w-8`
$url-height:         2rem
$gap-row:            0.25rem
$iframe-min-height:  18rem
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
  width: $nav-button-size
  height: $nav-button-size
  padding: 0
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
    +focus-ring

  &:disabled
    pointer-events: none
    opacity: 0.4

  > svg
    width: 1rem
    height: 1rem
    flex-shrink: 0
```

## WebPreview (root frame)

```sass
.web-preview
  display: flex
  width: 100%
  height: 100%
  flex-direction: column
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg-card
  color: $fg
  overflow: hidden
```

## WebPreviewNavigation

The toolbar row pinned to the top — contains the back / forward / reload buttons and the URL bar.

```sass
.web-preview-navigation
  display: flex
  align-items: center
  gap: $gap-row
  padding: 0.5rem
  border-bottom: 1px solid $border
  background-color: $bg-card
  flex-shrink: 0
```

## WebPreviewNavigationButton

A small square nav button. Each instance wraps a `Tooltip` so the icon is annotated.

```sass
.web-preview-navigation-button
  +icon-ghost-button()
```

## WebPreviewUrl

The address bar. Commits the new URL when the user presses Enter.

```sass
.web-preview-url
  display: flex
  align-items: center
  flex: 1 1 auto
  height: $url-height
  padding: 0 0.625rem
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg
  color: $fg
  font-size: 0.8125rem
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
  outline: none
  transition: border-color $transition, box-shadow $transition

  &::placeholder
    color: $fg-muted

  &:focus-visible
    border-color: $fg
    box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.1)

  &:disabled
    cursor: not-allowed
    opacity: 0.5
```

## WebPreviewBody

The iframe area. Fills the remaining vertical space.

```sass
.web-preview-body
  position: relative
  flex: 1 1 auto
  min-height: $iframe-min-height
  overflow: hidden
  background-color: $bg

  iframe
    width: 100%
    height: 100%
    border: 0
    display: block

  // loading overlay (consumers can drop a spinner child here)
  &__loading
    position: absolute
    inset: 0
    display: flex
    align-items: center
    justify-content: center
    background-color: hsl(0 0% 100% / 0.6)
    backdrop-filter: blur(2px)
    -webkit-backdrop-filter: blur(2px)
```

## WebPreviewConsole

A collapsible panel pinned to the bottom of the preview that lists `console.log` / `console.error` entries from inside the iframe.

```sass
.web-preview-console
  display: flex
  flex-direction: column
  flex-shrink: 0
  max-height: 12rem
  border-top: 1px solid $border
  background-color: $bg-card
  color: $fg
  overflow: hidden

  &__trigger
    display: flex
    align-items: center
    justify-content: space-between
    width: 100%
    padding: 0.5rem 0.75rem
    border: 0
    background-color: $bg-secondary
    color: $fg-muted
    font-size: 0.75rem
    font-weight: 500
    text-align: left
    cursor: pointer
    transition: background-color $transition, color $transition

    &:hover
      background-color: $bg-muted
      color: $fg

    > svg
      width: 1rem
      height: 1rem
      transition: transform $transition

    &[aria-expanded="true"] > svg
      transform: rotate(180deg)

  &__content
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
      max-height: 10rem
      overflow-y: auto
      padding: 0.5rem 0.75rem
      display: flex
      flex-direction: column
      gap: 0.125rem
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
      font-size: 0.75rem

  // log entry variants
  &__entry
    display: flex
    gap: 0.5rem
    padding: 0.125rem 0
    color: $fg
    line-height: 1.4
    border-bottom: 1px solid hsl(214 32% 91% / 0.5)

    &:last-child
      border-bottom: 0

    &__level
      flex-shrink: 0
      width: 4rem
      font-weight: 600
      text-transform: uppercase
      letter-spacing: 0.04em
      color: $fg-muted

    &--log &__level
      color: hsl(217 91% 60%)

    &--warn &__level
      color: hsl(38 92% 50%)

    &--error &__level
      color: hsl(0 84% 60%)

    &__message
      flex: 1 1 auto
      white-space: pre-wrap
      word-break: break-word
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:            hsl(222 47% 6%)
  $bg-card-dark:       hsl(222 47% 6%)
  $bg-muted-dark:      hsl(217 33% 17%)
  $bg-secondary-dark:  hsl(217 33% 17%)
  $fg-dark:            hsl(210 40% 98%)
  $fg-muted-dark:      hsl(215 16% 65%)
  $border-dark:        hsl(217 33% 17%)

  .web-preview
    background-color: $bg-card-dark
    border-color: $border-dark
    color: $fg-dark

  .web-preview-navigation
    border-bottom-color: $border-dark

  .web-preview-navigation-button
    color: $fg-muted-dark
    &:hover:not(:disabled)
      background-color: $bg-muted-dark
      color: $fg-dark

  .web-preview-url
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark
    &::placeholder
      color: $fg-muted-dark

  .web-preview-body
    background-color: $bg-dark
    &__loading
      background-color: hsl(222 47% 6% / 0.6)

  .web-preview-console
    border-top-color: $border-dark
    background-color: $bg-card-dark
    &__trigger
      background-color: $bg-secondary-dark
      color: $fg-muted-dark
      &:hover
        background-color: $bg-muted-dark
        color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="web-preview">
  <div class="web-preview-navigation">
    <button class="web-preview-navigation-button" aria-label="Back" disabled={!canBack} onclick={goBack}>
      <ArrowLeft />
    </button>
    <button class="web-preview-navigation-button" aria-label="Forward" disabled={!canForward} onclick={goForward}>
      <ArrowRight />
    </button>
    <button class="web-preview-navigation-button" aria-label="Reload" onclick={reload}>
      <RotateCw />
    </button>

    <input
      class="web-preview-url"
      placeholder="https://example.com"
      value={url}
      onkeydown={(e) => e.key === "Enter" && setUrl((e.target as HTMLInputElement).value)}
    />
  </div>

  <div class="web-preview-body">
    <iframe src={url} sandbox="allow-scripts allow-same-origin allow-forms" title="Preview"></iframe>
  </div>

  <div class="web-preview-console">
    <button class="web-preview-console__trigger" aria-expanded={open} onclick={() => (open = !open)}>
      Console ({logs.length})
      <ChevronDown />
    </button>
    <div class="web-preview-console__content" data-state={open ? "open" : "closed"}>
      <div>
        {#each logs as log}
          <div class="web-preview-console__entry web-preview-console__entry--{log.level}">
            <span class="web-preview-console__entry__level">{log.level}</span>
            <span class="web-preview-console__entry__message">{log.message}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
```
