---
title: Guides
description: The blog/guides section of the site. Renders a header, intro paragraph, and a 1/2/3-column grid of `BlogCard` tiles (with a `GridFiller` to balance out the last row).
---

# Guides

The `Guides` family is the blog-index section of the site:

- `AllBlogs` — the page shell that renders the page header and the grid of cards
- `BlogCard` — a single card that anchors a blog post (image, title, date, description)

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-border:          hsl(214 32% 91%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-foreground:      hsl(222 47% 11%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$font-size:          0.875rem
$padding-card:       1.5rem
$max-width:          64rem         // 1024px — `max-w-5xl`
$gap-row:            0.5rem
$gap-grid:           1px            // gap between cells in the bordered grid
```

## AllBlogs (page shell)

```sass
.all-blogs
  width: 100%
  max-width: $max-width
  margin: 0 auto
  padding-top: 1rem

  // at lg+ a vertical rule sits on either side
  @media (min-width: 1024px)
    border-left: 1px solid $border
    border-right: 1px solid $border

  &__header
    padding: 2rem 1rem 3rem
    display: flex
    flex-direction: column
    gap: $gap-row

    @media (min-width: 768px)
      padding: 3rem 1rem

  &__title
    margin: 0
    font-size: 1.5rem
    font-weight: 600
    letter-spacing: 0.025em
    color: $fg

    @media (min-width: 768px)
      font-size: 2.25rem

  &__subtitle
    margin: 0
    font-size: $font-size
    color: $fg-muted

  // the grid below the header
  &__grid
    display: grid
    grid-template-columns: 1fr
    gap: $gap-grid
    background-color: $bg-border

    @media (min-width: 640px)
      grid-template-columns: 1fr 1fr

    @media (min-width: 768px)
      grid-template-columns: repeat(3, 1fr)
```

## BlogCard (single tile)

```sass
.blog-card
  display: block
  width: 100%
  padding: 3rem 1.5rem
  background-color: $bg-card
  color: $fg-muted
  text-decoration: none
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    background-color: $bg-muted-50
    color: $fg-foreground

  @media (min-width: 768px)
    padding: 3rem 2rem

  &__title
    margin: 0 0 0.75rem
    font-size: 1.125rem
    font-weight: 500
    line-height: 1.25
    color: $fg-foreground
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden

    @media (min-width: 768px)
      font-size: 1.25rem

  &__description
    margin: 0
    font-size: $font-size
    line-height: 1.5
    color: inherit
    display: -webkit-box
    -webkit-line-clamp: 3
    -webkit-box-orient: vertical
    overflow: hidden

  &__image
    width: 100%
    aspect-ratio: 16 / 9
    object-fit: cover
    border-radius: $radius-md
    margin-bottom: 1rem

  &__meta
    margin: 0 0 0.5rem
    display: inline-flex
    align-items: center
    gap: 0.5rem
    font-size: 0.75rem
    color: $fg-muted

  &__date
    margin: 0
    font-size: 0.75rem
    color: $fg-muted

  &__author
    display: inline-flex
    align-items: center
    gap: 0.375rem

    > img
      width: 1.25rem
      height: 1.25rem
      border-radius: 9999px
      object-fit: cover
```

## GridFiller (the trailing empty cells)

Used to fill empty cells in the last row of the grid so each card maintains its borders.

```sass
.grid-filler
  background-color: transparent

  &--vertical
    border-left: 1px solid $border

  &--horizontal
    border-top: 1px solid $border
```

## FullWidthDivider (used in `AllBlogs`)

```sass
.full-width-divider
  height: 1px
  width: 100%
  background-color: $border

  &--contained
    margin: 0 1rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-card-dark:     hsl(222 47% 6%)
  $bg-muted-50-dark: hsl(217 33% 17% / 0.5)
  $fg-dark:          hsl(210 40% 98%)
  $fg-muted-dark:    hsl(215 16% 65%)
  $border-dark:      hsl(217 33% 17%)
  $bg-border-dark:   hsl(217 33% 17%)

  .all-blogs
    border-left-color: $border-dark
    border-right-color: $border-dark

  .blog-card
    background-color: $bg-card-dark
    color: $fg-muted-dark
    &:hover
      background-color: $bg-muted-50-dark
      color: $fg-dark

  &__title
    color: $fg-dark

  .all-blogs__grid
    background-color: $bg-border-dark

  .full-width-divider
    background-color: $border-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="all-blogs">
  <header class="all-blogs__header">
    <h1 class="all-blogs__title">Latest Blogs</h1>
    <p class="all-blogs__subtitle">
      Discover the latest trends and insights in the world of design and technology.
    </p>
  </header>

  <div class="full-width-divider full-width-divider--contained"></div>

  <div class="all-blogs__grid">
    {#each blogs as blog (blog.id)}
      <a class="blog-card" href="/guides/{blog.slug}">
        <img class="blog-card__image" src={blog.image} alt="" />
        <h3 class="blog-card__title">{blog.title}</h3>
        <p class="blog-card__description">{blog.description}</p>
      </a>
    {/each}
  </div>
</div>
```
