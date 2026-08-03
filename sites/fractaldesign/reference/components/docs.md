---
title: Docs
description: The chrome used across the docs site — table of contents, props/api tables, install instructions with package-manager tabs, package badges, page layout shell, search modal, and the top-of-page header.
---

# Docs

The `Docs` family is the chrome layer around the documentation content. It includes:

- `ApiTable` — type-signature table for component props
- `CompactApiTable` — denser version of the same
- `InfoPopover` — small popover for prop info
- `ComponentDocPage` — the page shell that hosts an install block, examples, and props
- `InstallComponent` — the install code block with package-manager tabs and a folder tree
- `PackageBadges` — a row of small badges listing the npm packages an example uses
- `Seo` — per-page `<title>` / `<meta>` injection
- `SupportWork` — call-to-action footer card
- `ContributeCard` — contribution-prompt card
- `CopyPageDropdown` — dropdown to copy the page as Markdown / open in LLM chat
- `Toc` — table of contents (root and nested)
- `AppHeader`, `AppSidebar`, `CookbookSidebar` — top nav and left rail
- `DesktopNav`, `MobileNav`, `LinkItem` — nav primitives
- `SearchNavigation` — global `⌘K` search modal
- `DocsNavigation` — body of the docs sidebar

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-muted-50:        hsl(210 40% 96% / 0.5)
$bg-secondary:       hsl(210 40% 96%)
$bg-accent:          hsl(210 40% 96%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-primary:         hsl(217 91% 60%)
$border:             hsl(214 32% 91%)
$border-input:       hsl(217 33% 17%)
$border-border-60:   hsl(214 32% 91% / 0.6)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$radius-xl:          0.75rem
$shadow-sm:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$shadow-md:          0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$font-mono:          ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
$font-size:          0.875rem
$toc-width:          14rem          // 224px — `w-56`
$header-height:      3.5rem         // 56px
$gap-row:            1rem
$padding-card:       1.5rem
```

## ApiTable (props table)

```sass
.api-table
  width: 100%
  border-collapse: collapse
  font-size: 0.875rem
  line-height: 1.4

  &__head
    border-bottom: 1px solid $border
    background-color: $bg-muted

  &__th
    padding: 0.5rem 0.75rem
    text-align: left
    font-weight: 600
    color: $fg

  &__row
    border-bottom: 1px solid $border

  &__cell
    padding: 0.5rem 0.75rem
    vertical-align: top
    color: $fg

  &__type
    font-family: $font-mono
    font-size: 0.75rem
    color: $fg-muted

  &__default
    font-family: $font-mono
    font-size: 0.75rem
    color: $fg

  &__required
    display: inline-block
    margin-left: 0.5rem
    padding: 0 0.25rem
    border-radius: $radius-md
    background-color: hsl(0 84% 60% / 0.1)
    color: hsl(0 84% 60%)
    font-size: 0.6875rem
    font-weight: 600
    text-transform: uppercase
    letter-spacing: 0.05em
```

## CompactApiTable

```sass
.api-table-compact
  @extend .api-table
  font-size: 0.75rem

  .api-table__th, .api-table__cell
    padding: 0.375rem 0.5rem
```

## InfoPopover

A small inline `?` glyph that opens a popover with extra prop context.

```sass
.info-popover
  display: inline-flex
  align-items: center
  justify-content: center
  width: 0.875rem
  height: 0.875rem
  margin-left: 0.25rem
  border-radius: 9999px
  background-color: $bg-muted
  color: $fg-muted
  cursor: help
  font-size: 0.6875rem
  font-weight: 600

  &:hover
    background-color: $bg-accent
    color: $fg
```

## ComponentDocPage (page shell)

```sass
.component-doc-page
  display: grid
  gap: 2rem
  width: 100%

  &__header
    display: flex
    flex-direction: column
    gap: 0.5rem

  &__title
    margin: 0
    font-size: 2.25rem         // 36px
    font-weight: 700
    letter-spacing: -0.02em
    line-height: 1.1
    color: $fg

  &__description
    margin: 0
    font-size: 1.125rem
    line-height: 1.5
    color: $fg-muted

  &__content
    display: grid
    gap: 3rem
```

## InstallComponent (install code block)

```sass
.install-component
  display: flex
  flex-direction: column
  gap: 1.5rem
  padding: $padding-card
  border: 1px solid $border
  border-radius: $radius-xl
  background-color: $bg-card

  &__tabs
    display: inline-flex
    width: fit-content

  &__folder-structure
    margin-top: 0.5rem

  // the line numbers inside the install code block
  &__steps
    counter-reset: install-step

  &__step
    counter-increment: install-step
    padding-left: 2.5rem
    position: relative

    &::before
      content: counter(install-step)
      position: absolute
      left: 0
      top: 0
      display: inline-flex
      align-items: center
      justify-content: center
      width: 1.5rem
      height: 1.5rem
      border-radius: 9999px
      background-color: $bg-muted
      color: $fg-muted
      font-size: 0.75rem
      font-weight: 600
```

## PackageBadges

```sass
.package-badges
  margin-top: 1rem
  display: flex
  flex-wrap: wrap
  gap: 0.5rem

  &__badge
    padding: 0.25rem 0.5rem
    border: 1px solid $border-border-60
    border-radius: 9999px
    background-color: $bg-muted-50
    color: $fg-muted
    font-family: $font-mono
    font-size: 0.75rem
    line-height: 1
```

## Toc (table of contents)

```sass
.toc
  list-style: none
  margin: 0
  padding: 0
  font-size: $font-size
  font-weight: 400

  &__item
    margin-top: 0
    padding-top: 0.5rem
    color: $fg-muted
    transition: color $transition

    &--active
      color: $fg

    > a
      display: block
      color: inherit
      text-decoration: none
      transition: color $transition

      &:hover
        color: $fg

  // nested level
  &__level
    padding-left: 1rem
```

## AppHeader (top bar)

```sass
.app-header
  position: sticky
  top: 0
  z-index: 40
  width: 100%
  height: $header-height
  border-bottom: 1px solid $border
  background-color: hsl(0 0% 100% / 0.8)
  backdrop-filter: blur(8px)
  -webkit-backdrop-filter: blur(8px)
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0 1rem

  &__logo
    margin-right: 0.5rem
    display: inline-flex
    align-items: center
    gap: 0.5rem

  &__nav
    display: none

    @media (min-width: 768px)
      display: flex
      align-items: center
      gap: 0.5rem

  &__mobile-trigger
    display: inline-flex

    @media (min-width: 768px)
      display: none

  &__actions
    margin-left: auto
    display: inline-flex
    align-items: center
    gap: 0.25rem
```

## AppSidebar (docs left rail)

```sass
.app-sidebar
  display: none
  height: calc(100vh - #{$header-height})
  width: $toc-width
  flex-shrink: 0
  border-right: 1px solid $border
  background-color: $bg-card
  position: sticky
  top: $header-height
  overflow-y: auto
  padding: 1rem 0.5rem

  @media (min-width: 768px)
    display: block
```

## SearchNavigation (global search)

A button in the header that opens a `CommandDialog` when clicked.

```sass
.search-navigation
  display: inline-flex
  align-items: center
  gap: 0.5rem
  height: 2rem
  padding: 0 0.5rem
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg-muted
  color: $fg-muted
  font-size: 0.8125rem
  cursor: pointer
  transition: background-color $transition

  &:hover
    background-color: $bg-accent
    color: $fg

  > svg
    width: 0.875rem
    height: 0.875rem

  > kbd
    margin-left: 0.5rem
    display: inline-flex
    align-items: center
    gap: 0.125rem
    padding: 0 0.25rem
    border: 1px solid $border
    border-radius: 0.25rem
    background-color: $bg-card
    color: $fg-muted
    font-family: $font-mono
    font-size: 0.625rem
    line-height: 1.25rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-card-dark:      hsl(222 47% 6%)
  $bg-muted-dark:     hsl(217 33% 17%)
  $bg-muted-50-dark:  hsl(217 33% 17% / 0.5)
  $bg-overlay-dark:   hsl(222 47% 6% / 0.8)
  $fg-dark:           hsl(210 40% 98%)
  $fg-muted-dark:     hsl(215 16% 65%)
  $border-dark:       hsl(217 33% 17%)
  $border-border-60-dark: hsl(217 33% 17% / 0.6)

  .api-table
    &__head
      background-color: $bg-muted-dark
    &__row
      border-bottom-color: $border-dark

  .package-badges
    &__badge
      background-color: $bg-muted-50-dark
      border-color: $border-border-60-dark

  .app-header
    background-color: $bg-overlay-dark
    border-bottom-color: $border-dark

  .app-sidebar
    background-color: $bg-card-dark
    border-right-color: $border-dark

  .search-navigation
    background-color: $bg-muted-dark
    border-color: $border-dark
    color: $fg-muted-dark
    &:hover
      background-color: $bg-muted-dark
      color: $fg-dark

  .toc
    &__item
      color: $fg-muted-dark
      &--active
        color: $fg-dark

  .component-doc-page
    &__title
      color: $fg-dark
    &__description
      color: $fg-muted-dark

  .install-component
    background-color: $bg-card-dark
    border-color: $border-dark

  .info-popover
    background-color: $bg-muted-dark
    color: $fg-muted-dark
    &:hover
      background-color: $bg-muted-dark
      color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<AppHeader>
  <Logo slot="logo" />
  <DesktopNav slot="nav" />
  <SearchNavigation slot="actions" />
</AppHeader>

<AppSidebar items={navItems} />

<main class="component-doc-page">
  <header class="component-doc-page__header">
    <h1 class="component-doc-page__title">Conversation</h1>
    <p class="component-doc-page__description">
      A scrollable chat container that auto-sticks to the bottom.
    </p>
    <PackageBadges packages={["ai", "@ai-sdk/svelte"]} />
  </header>

  <InstallComponent installUrl="components/conversation" />

  <ApiTable data={propsTable} />

  <Toc toc={toc} />
</main>
```
