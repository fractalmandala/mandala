---
title: Sources
description: A collapsible disclosure that lists the external sources the model consulted (web search results, RAG documents). The trigger shows a count badge; the content renders a vertical list of source rows with title, host, and link.
---

# Sources

The `Sources` family surfaces the citations behind a response. The trigger shows `Used N sources` with a chevron; the content renders a vertical list of `Source` rows, each a link to the original document.

The styling below is pure indented Sass.

## Tokens

```sass
$fg:                 hsl(222 47% 11%)
$fg-primary:         hsl(217 91% 60%)
$fg-muted:           hsl(215 16% 47%)
$bg:                 hsl(0 0% 100%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$transition:         200ms cubic-bezier(0.4, 0, 0.2, 1)
$icon-size:          1rem
$gap-row:            0.5rem
$gap-block:          0.75rem
```

## Mixins

```sass
=focus-ring
  outline: 2px solid $fg
  outline-offset: 2px

=collapsible-fade-slide
  &[data-state="open"]
    animation: sources-in 250ms $transition forwards
  &[data-state="closed"]
    animation: sources-out 200ms $transition forwards

@keyframes sources-in
  from
    opacity: 0
    transform: translateY(-8px)
  to
    opacity: 1
    transform: translateY(0)

@keyframes sources-out
  from
    opacity: 1
    transform: translateY(0)
  to
    opacity: 0
    transform: translateY(-8px)
```

## Sources (root)

```sass
.sources
  display: flex
  flex-direction: column
  margin-bottom: 1rem
  font-size: 0.75rem
  color: $fg-primary
```

## SourcesTrigger

The header row.

```sass
.sources-trigger
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0
  border: 0
  background: transparent
  color: inherit
  font: inherit
  cursor: pointer
  transition: color $transition

  &:hover
    text-decoration: underline
    text-underline-offset: 2px

  &:focus-visible
    +focus-ring
    border-radius: $radius-md

  > svg
    width: $icon-size
    height: $icon-size
    flex-shrink: 0
    transition: transform $transition
    transform: rotate(0deg)

  &[aria-expanded="true"] > svg
    transform: rotate(180deg)
```

## SourcesContent

The collapsible body. Uses the grid-template-rows 0fr/1fr trick to animate height smoothly.

```sass
.sources-content
  display: grid
  grid-template-rows: 1fr
  margin-top: 0.75rem
  overflow: hidden
  transition: grid-template-rows $transition
  width: fit-content

  &[data-state="closed"]
    grid-template-rows: 0fr

  &[data-state="open"]
    grid-template-rows: 1fr

  > div
    min-height: 0
    display: flex
    flex-direction: column
    gap: $gap-block

  +collapsible-fade-slide
```

## Source (single row)

A horizontal row with a small book icon and the source title. Renders as an anchor opening in a new tab.

```sass
.source
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0
  font-size: 0.75rem
  color: $fg-primary
  text-decoration: none
  transition: color $transition

  &:hover
    text-decoration: underline
    text-underline-offset: 2px

  &:focus-visible
    +focus-ring
    border-radius: $radius-md

  > svg
    width: $icon-size
    height: $icon-size
    flex-shrink: 0
    color: $fg-muted

  > span
    display: block
    font-weight: 500
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    max-width: 32rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $fg-primary-dark: hsl(217 91% 70%)
  $fg-muted-dark:   hsl(215 16% 65%)

  .sources
    color: $fg-primary-dark

  .source
    color: $fg-primary-dark
    > svg
      color: $fg-muted-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="sources">
  <button class="sources-trigger" type="button" aria-expanded={open} onclick={() => (open = !open)}>
    Used {count} sources
    <ChevronDown />
  </button>

  <div class="sources-content" data-state={open ? "open" : "closed"}>
    <div>
      <a class="source" href="https://example.com/paper-1" target="_blank" rel="noreferrer">
        <Book />
        <span>Long-context LLM survey (2024)</span>
      </a>
      <a class="source" href="https://example.com/paper-2" target="_blank" rel="noreferrer">
        <Book />
        <span>Sparse attention at scale</span>
      </a>
    </div>
  </div>
</div>
```
