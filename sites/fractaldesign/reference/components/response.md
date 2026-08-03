---
title: Response
description: A streaming markdown renderer used for the final assistant answer. Wraps `Streamdown` with theme-aware Shiki configuration and removes the top/bottom margin of the first/last child for tight nesting inside a message bubble.
---

# Response

The `Response` component is the top-level markdown wrapper for the assistant's final answer. It is a thin pass-through over `Streamdown` (a streaming-aware markdown parser) with two opinionated defaults:

1. Shiki dual-themes (`github-light-default` + `github-dark-default`), toggled by `mode-watcher`.
2. Zero top/bottom margin on first/last child so the response nests cleanly inside a message bubble.

The styling below is pure indented Sass.

## Tokens

```sass
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$bg:                 hsl(0 0% 100%)
$border:             hsl(214 32% 91%)
$font-body:          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
$font-mono:          ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
$radius-md:          0.375rem
$radius-lg:          0.5rem
$prose-margin:       1rem
```

## Mixins

```sass
=prose-flush
  > *:first-child
    margin-top: 0

  > *:last-child
    margin-bottom: 0
```

## Response (root)

```sass
.response
  width: 100%
  height: 100%
  color: $fg
  font-family: $font-body
  font-size: 0.875rem
  line-height: 1.6
  +prose-flush

  // paragraph spacing
  p
    margin: $prose-margin 0

  // inline code
  &:not(:has(pre))
    code
      padding: 0.125rem 0.375rem
      border: 1px solid $border
      border-radius: $radius-md
      background-color: hsl(210 40% 96%)
      font-family: $font-mono
      font-size: 0.85em
      color: $fg

  // code blocks (rendered by Shiki)
  pre.shiki
    overflow-x: auto
    border-radius: $radius-lg
    padding: 1rem
    margin: $prose-margin 0
    font-family: $font-mono
    font-size: 0.875rem
    line-height: 1.5

  // headings
  h1, h2, h3, h4, h5, h6
    margin: 1.25rem 0 0.5rem
    font-weight: 600
    line-height: 1.25
    color: $fg

  h1
    font-size: 1.5rem
  h2
    font-size: 1.25rem
  h3
    font-size: 1.125rem
  h4
    font-size: 1rem

  // lists
  ul, ol
    margin: $prose-margin 0
    padding-left: 1.5rem

    li
      margin: 0.25rem 0

  // blockquote
  blockquote
    margin: $prose-margin 0
    padding: 0.25rem 0 0.25rem 1rem
    border-left: 3px solid $border
    color: $fg-muted
    font-style: italic

  // tables
  table
    width: 100%
    margin: $prose-margin 0
    border-collapse: collapse
    font-size: 0.8125rem

    th, td
      padding: 0.5rem 0.75rem
      border: 1px solid $border
      text-align: left

    th
      background-color: hsl(210 40% 96%)
      font-weight: 600

  // links
  a
    color: hsl(217 91% 60%)
    text-decoration: underline
    text-underline-offset: 2px

    &:hover
      color: hsl(217 91% 50%)

  // horizontal rule
  hr
    margin: $prose-margin 0
    border: 0
    border-top: 1px solid $border
```

## Dark mode (Shiki dual-theme)

Shiki emits two CSS variables per token: `--shiki-light` and `--shiki-dark`. In dark mode we read the dark ones and apply a slightly different palette to the surrounding chrome.

```sass
@media (prefers-color-scheme: dark)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)
  $border-dark:    hsl(217 33% 17%)

  .response
    color: $fg-dark

    &:not(:has(pre)) code
      background-color: hsl(217 33% 17%)
      border-color: $border-dark
      color: $fg-dark

    pre.shiki, pre.shiki span
      color: var(--shiki-dark) !important
      font-style: var(--shiki-dark-font-style) !important
      font-weight: var(--shiki-dark-font-weight) !important
      text-decoration: var(--shiki-dark-text-decoration) !important

    h1, h2, h3, h4, h5, h6
      color: $fg-dark

    blockquote
      border-left-color: $border-dark
      color: $fg-muted-dark

    table
      th, td
        border-color: $border-dark
      th
        background-color: hsl(217 33% 17%)

    a
      color: hsl(217 91% 70%)

    hr
      border-top-color: $border-dark
```

## Streaming caret

A subtle cursor that appears at the end of the response while content is still streaming in.

```sass
.response-caret
  display: inline-block
  width: 0.5rem
  height: 1em
  margin-left: 0.125rem
  vertical-align: text-bottom
  background-color: currentColor
  animation: caret-blink 1s steps(2, start) infinite

@keyframes caret-blink
  to
    visibility: hidden
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="response">
  {@html renderedMarkdown}
  {#if streaming}
    <span class="response-caret" aria-hidden="true"></span>
  {/if}
</div>
```
