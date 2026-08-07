---
title: Inline Citation
description: Renders inline citations for assistant-generated text — a superscript-style source badge that opens a hover-card with the cited quote, source title, and URL. When multiple citations cluster, a carousel lets the user browse them.
---

# Inline Citation

The `InlineCitation` family attaches structured source attribution to a passage of generated text:

- `InlineCitation` — the inline wrapper around the cited span
- `InlineCitationText` — the highlighted, hover-aware text segment
- `InlineCitationQuote` — the actual quoted passage shown inside the hover-card
- `InlineCitationSource` — the title / URL / description block
- `InlineCitationCard` — the hover-card wrapper
- `InlineCitationCardTrigger` — the clickable source badge (often a host badge like `anthropic.com`)
- `InlineCitationCardBody` — the popover body
- `InlineCitationCarousel*` — when multiple citations stack into a carousel

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-accent:          hsl(210 40% 96%)
$bg-secondary:       hsl(210 40% 96%)
$bg-muted:           hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$border-muted:       hsl(214 32% 91%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$popover-width:      20rem      // 320px — `w-80`
$badge-height:       1.25rem
$carousel-height:    auto
$gap-row:            0.25rem
```

## Mixins

```sass
=popover-base
  position: relative
  z-index: 50
  background-color: $bg
  color: $fg
  border: 1px solid $border
  border-radius: $radius-lg
  box-shadow: $shadow-md

=icon-ghost-button
  display: inline-flex
  align-items: center
  justify-content: center
  width: 2rem
  height: 2rem
  border: 1px solid transparent
  border-radius: $radius-md
  background-color: transparent
  color: $fg-muted
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    background-color: $bg-accent
    color: $fg

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px
```

## InlineCitation (inline wrapper)

```sass
.inline-citation
  display: inline
  align-items: center
  gap: 0.25rem
```

## InlineCitationText

The span that contains the cited text. On hover of the parent group, the background lifts to accent color to give visual feedback that the citation is interactive.

```sass
.inline-citation-text
  display: inline
  background-color: transparent
  border-radius: 0.125rem
  padding: 0 0.125rem
  transition: background-color $transition

  .group:hover > &
    background-color: $bg-accent
```

## InlineCitationQuote

A small blockquote rendered inside the hover-card. Slim left border, italic muted text.

```sass
.inline-citation-quote
  margin: 0
  padding: 0 0 0 0.75rem
  border-left: 2px solid $border-muted
  font-size: 0.875rem
  font-style: italic
  line-height: 1.4
  color: $fg-muted
```

## InlineCitationSource

The structured source block inside the card body. Title truncates to a single line, URL uses the muted-foreground color.

```sass
.inline-citation-source
  display: flex
  flex-direction: column
  gap: $gap-row

  &__title
    margin: 0
    font-size: 0.875rem
    font-weight: 500
    line-height: 1.25
    color: $fg
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap

  &__url
    margin: 0
    font-size: 0.75rem
    color: $fg-muted
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap

    a
      color: inherit
      text-decoration: underline
      text-underline-offset: 2px

      &:hover
        color: $fg

  &__description
    margin: 0
    font-size: 0.8125rem
    line-height: 1.4
    color: $fg-muted
```

## InlineCitationCard

The hover-card wrapper. Floats above the inline text with a small offset.

```sass
.inline-citation-card
  position: relative
  display: inline-block
```

## InlineCitationCardTrigger

The source badge — a small pill that displays the host (e.g. `anthropic.com`) and `+N` if multiple sources cluster.

```sass
.inline-citation-card-trigger
  display: inline-flex
  align-items: center
  gap: 0.25rem
  height: $badge-height
  padding: 0 0.5rem
  border: 1px solid transparent
  border-radius: 9999px
  background-color: $bg-secondary
  color: $fg-muted
  font-size: 0.75rem
  font-weight: 400
  line-height: 1rem
  white-space: nowrap
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    background-color: hsl(210 40% 92%)
    color: $fg

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px

  // optional trailing chevron
  > svg
    width: 0.75rem
    height: 0.75rem
    flex-shrink: 0

  // variant overrides
  &--default
    background-color: $fg
    color: $bg

    &:hover
      background-color: hsl(222 47% 15%)

  &--destructive
    background-color: hsl(0 84% 60% / 0.1)
    color: hsl(0 84% 60%)

  &--outline
    background-color: transparent
    border-color: $border
```

## InlineCitationCardBody

The popover body — a fixed 320px wide card with no internal padding (so children like `source` and `quote` can use their own gutters).

```sass
.inline-citation-card-body
  +popover-base()
  position: absolute
  width: $popover-width
  padding: 0
  overflow: hidden
```

## InlineCitationCarousel

A carousel that rotates through multiple citations stacked behind a single trigger badge.

```sass
.inline-citation-carousel
  display: flex
  flex-direction: column
  gap: 0.5rem

  &__content
    overflow: hidden
    width: 100%

  &__item
    flex: 0 0 100%
    min-width: 0
    display: flex
    flex-direction: column
    gap: 0.5rem
    padding: 1rem

  &__header
    display: flex
    align-items: center
    justify-content: space-between
    gap: 0.5rem
    padding: 0 1rem
    margin-top: 0.5rem

  &__index
    font-size: 0.75rem
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    color: $fg-muted

  &__nav
    display: flex
    align-items: center
    gap: 0.25rem

  &__prev,
  &__next
    +icon-ghost-button()
    width: 1.75rem
    height: 1.75rem

    > svg
      width: 0.875rem
      height: 0.875rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:         hsl(222 47% 6%)
  $bg-accent-dark:  hsl(217 33% 17%)
  $bg-secondary-dark: hsl(217 33% 17%)
  $fg-dark:         hsl(210 40% 98%)
  $fg-muted-dark:   hsl(215 16% 65%)
  $border-dark:     hsl(217 33% 17%)

  .inline-citation-text
    .group:hover > &
      background-color: $bg-accent-dark

  .inline-citation-quote
    border-left-color: $border-dark
    color: $fg-muted-dark

  .inline-citation-source
    &__title
      color: $fg-dark
    &__url,
    &__description
      color: $fg-muted-dark
      a:hover
        color: $fg-dark

  .inline-citation-card-body
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark

  .inline-citation-card-trigger
    background-color: $bg-secondary-dark
    color: $fg-muted-dark
    &:hover
      background-color: hsl(217 33% 22%)
      color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<p>
  According to the latest research
  <span class="inline-citation group">
    <span class="inline-citation-text">context windows above 200k tokens</span>

    <InlineCitationCard>
      <InlineCitationCardTrigger sources={["https://example.com/paper"]} />
      <InlineCitationCardBody>
        <InlineCitationSource
          title="Long-context LLM survey"
          url="https://example.com/paper"
          description="A 2024 survey of long-context techniques."
        />
        <blockquote class="inline-citation-quote">
          "We find that sparse attention remains competitive at 200k tokens…"
        </blockquote>
      </InlineCitationCardBody>
    </InlineCitationCard>
  </span>
  results are still mixed.
</p>
```
