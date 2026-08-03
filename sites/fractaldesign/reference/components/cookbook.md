---
title: Cookbook
description: Recipe-site chrome used by the cookbook section of the site — prev/next pagination between recipes and an API-key management card for OpenRouter / AI Gateway credentials.
---

# Cookbook

The `Cookbook` family is the chrome surrounding the recipe-site pages. It includes:

- `ApiKeyCard` — a settings card for entering OpenRouter / AI Gateway API keys
- `CookbookPrevNext` — a two-column prev/next pager rendered at the bottom of every recipe

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-muted-50:        hsl(210 40% 96% / 0.5)
$bg-secondary:       hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-primary:         hsl(217 91% 60%)
$border:             hsl(214 32% 91%)
$border-input:       hsl(217 33% 17%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$radius-xl:          0.75rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$font-size:          0.875rem
$gap-row:            1rem
$gap-col:            0.75rem
$padding-card:       1.5rem
$item-height:        4rem     // 64px
```

## ApiKeyCard (settings card)

A bordered card with a key icon, title, description, and an inline input + save / clear / view affordances.

```sass
.api-key-card
  display: flex
  flex-direction: column
  gap: $gap-row
  padding: $padding-card
  border: 1px solid $border
  border-radius: $radius-xl
  background-color: $bg-card
  color: $fg

  &__header
    display: flex
    align-items: center
    gap: 0.5rem

    > svg
      width: 1.25rem
      height: 1.25rem
      color: $fg-muted

  &__title
    margin: 0
    font-size: 1rem
    font-weight: 600
    color: $fg

  &__description
    margin: 0
    font-size: $font-size
    line-height: 1.5
    color: $fg-muted

  &__row
    display: grid
    gap: 0.5rem

    @media (min-width: 768px)
      grid-template-columns: 1fr auto

  &__actions
    display: inline-flex
    align-items: center
    gap: 0.5rem

  // the "saved" badge / pill shown when a key is stored
  &__saved
    display: inline-flex
    align-items: center
    gap: 0.375rem
    padding: 0.25rem 0.625rem
    border: 1px solid hsl(142 76% 36% / 0.3)
    border-radius: 9999px
    background-color: hsl(142 76% 36% / 0.08)
    color: hsl(142 76% 36%)
    font-size: 0.75rem
    font-weight: 500

    > svg
      width: 0.875rem
      height: 0.875rem

  // the external-link link next to the title
  &__link
    display: inline-flex
    align-items: center
    gap: 0.25rem
    margin-left: auto
    font-size: 0.75rem
    color: $fg-primary
    text-decoration: underline
    text-underline-offset: 2px

    > svg
      width: 0.75rem
      height: 0.75rem
```

## CookbookPrevNext (prev/next pager)

```sass
.cookbook-prev-next
  margin-top: 3rem          // 48px — `mt-12`
  border-top: 1px solid $border
  padding-top: 1.5rem        // 24px — `pt-6`

  &__grid
    display: grid
    gap: 1rem
    grid-template-columns: 1fr

    @media (min-width: 640px)
      grid-template-columns: 1fr 1fr

.cookbook-prev,
.cookbook-next
  display: flex
  border: 1px solid $border
  border-radius: $radius-xl
  background-color: $bg-card
  padding: 1rem 1.25rem
  text-decoration: none
  color: $fg
  transition: background-color $transition, border-color $transition

  &:hover
    background-color: $bg-muted-50
    border-color: $border

  &__inner
    display: flex
    align-items: center
    gap: 0.75rem
    width: 100%

  &__icon
    width: 1rem
    height: 1rem
    color: $fg-muted
    flex-shrink: 0
    transition: color $transition

    .cookbook-prev:hover &, .cookbook-next:hover &
      color: $fg

  &__direction
    margin: 0 0 0.25rem
    font-size: 0.6875rem
    text-transform: uppercase
    letter-spacing: 0.22em
    color: $fg-muted
    font-weight: 500

  &__title
    margin: 0
    font-size: 0.9375rem
    font-weight: 500
    color: $fg
    line-height: 1.25
    transition: color $transition

.cookbook-next
  &__inner
    justify-content: flex-end
    text-align: right
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-card-dark:        hsl(222 47% 6%)
  $bg-muted-50-dark:    hsl(217 33% 17% / 0.5)
  $fg-dark:             hsl(210 40% 98%)
  $fg-muted-dark:       hsl(215 16% 65%)
  $border-dark:         hsl(217 33% 17%)
  $border-input-dark:   hsl(217 33% 22%)

  .api-key-card
    background-color: $bg-card-dark
    border-color: $border-dark
    color: $fg-dark

  .cookbook-prev-next
    border-top-color: $border-dark

  .cookbook-prev,
  .cookbook-next
    background-color: $bg-card-dark
    border-color: $border-dark
    color: $fg-dark
    &:hover
      background-color: $bg-muted-50-dark

    &__direction
      color: $fg-muted-dark

    &__title
      color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<nav class="cookbook-prev-next">
  <div class="cookbook-prev-next__grid">
    {#if prevRecipe}
      <a class="cookbook-prev" href="/cookbook/{prevRecipe.slug}">
        <div class="cookbook-prev__inner">
          <ChevronLeft class="cookbook-prev__icon" />
          <div>
            <p class="cookbook-prev__direction">Previous</p>
            <p class="cookbook-prev__title">{prevRecipe.title}</p>
          </div>
        </div>
      </a>
    {/if}

    {#if nextRecipe}
      <a class="cookbook-next" href="/cookbook/{nextRecipe.slug}">
        <div class="cookbook-next__inner">
          <div>
            <p class="cookbook-next__direction">Next</p>
            <p class="cookbook-next__title">{nextRecipe.title}</p>
          </div>
          <ChevronRight class="cookbook-next__icon" />
        </div>
      </a>
    {/if}
  </div>
</nav>
```
