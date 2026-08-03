---
title: Code Preview
description: A two-pane docs-site widget that pairs a live preview (rendered React-style component) with a file-tree + code viewer. Used on block-detail pages so the reader sees the rendered output and the source side-by-side.
---

# Code Preview

The `CodePreview` family powers the docs-site block-detail pages:

- `BlockPreview` — the left pane that hosts the rendered preview, with a title and description
- `CodeTree` — the file-tree sidebar (collapsible folders, active file highlight)
- `CodeTreeNode` — recursive node that renders a folder or a file row
- `CodeView` — the code viewer that shows the active file with Shiki highlighting and a copy-to-clipboard affordance

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$bg-neutral-50:      hsl(210 20% 98%)
$bg-muted:           hsl(210 40% 96%)
$bg-muted-50:        hsl(210 40% 96% / 0.5)
$bg-zinc-900:        hsl(220 27% 8%)
$bg-zinc-900-25:     hsl(220 27% 8% / 0.25)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-muted-2:         hsl(215 16% 47% / 0.8)
$fg-white:           hsl(0 0% 100%)
$fg-zinc-800:        hsl(220 13% 25%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$radius-xl:          0.75rem
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$font-mono:          ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
$font-size:          0.875rem
$header-padding:     0.75rem 1rem     // 12px 16px — `px-4 py-3`
$row-height:         1.75rem           // 28px — `h-7`
$file-padding-x:     0.5rem           // 8px  — `px-2`
$tree-min-width:     16rem            // 256px
$preview-min-height: 20rem            // 320px — `min-h-[20rem]`
```

## BlockPreview (left pane)

```sass
.block-preview
  display: flex
  height: 100%
  min-height: 0
  flex-direction: column
  background-color: $bg
  color: $fg

  &__header
    border-bottom: 1px solid $border
    padding: $header-padding

  &__title
    margin: 0
    font-size: $font-size
    font-weight: 500
    color: $fg

  &__description
    margin: 0.25rem 0 0
    font-size: $font-size
    color: $fg-muted

  &__body
    flex: 1 1 auto
    min-height: 0
    overflow: auto

  // empty state (no live preview available)
  &__empty
    display: flex
    align-items: center
    justify-content: center
    height: 100%
    min-height: $preview-min-height
    padding: 1.5rem

    &-inner
      max-width: 28rem
      text-align: center

    &-title
      margin: 0
      font-size: 1rem
      font-weight: 500
      color: $fg

    &-description
      margin: 0.5rem 0 0
      font-size: $font-size
      line-height: 1.5
      color: $fg-muted

    &-action
      margin-top: 1rem
      display: inline-flex
```

## CodeTree (file-tree sidebar)

```sass
.code-tree
  display: flex
  height: 100%
  min-height: 0
  flex-direction: column
  background-color: $bg-neutral-50
  color: $fg

  // dark mode override via CSS variable
  --color-background: var(--color-zinc-900)
  --color-foreground: hsl(0 0% 100%)
  --color-muted: var(--color-zinc-800)

  &__header
    border-bottom: 1px solid $border
    padding: $header-padding
    font-family: $font-mono
    font-size: $font-size
    letter-spacing: 0.05em
    color: $fg-muted

  &__body
    flex: 1 1 auto
    min-height: 0
    overflow-y: auto
    padding: 0.5rem 0

  // dark mode
  @media (prefers-color-scheme: dark)
    background-color: $bg-zinc-900-25
    color: $fg-white
```

## CodeTreeNode (recursive folder / file row)

```sass
.code-tree-node
  display: flex
  align-items: center
  gap: 0.375rem
  height: $row-height
  padding: 0 $file-padding-x
  border: 0
  border-radius: $radius-md
  background-color: transparent
  color: inherit
  font-family: $font-mono
  font-size: 0.8125rem
  cursor: pointer
  user-select: none
  -webkit-user-select: none
  transition: background-color $transition, color $transition

  // indent each level
  &--level-0
    padding-left: $file-padding-x
  &--level-1
    padding-left: calc(#{$file-padding-x} + 1rem)
  &--level-2
    padding-left: calc(#{$file-padding-x} + 2rem)
  &--level-3
    padding-left: calc(#{$file-padding-x} + 3rem)

  &:hover
    background-color: hsl(210 40% 96%)

  // the active file gets an accent background and a left rule
  &--active
    background-color: hsl(210 40% 96%)
    color: $fg
    box-shadow: inset 2px 0 0 $fg

  &__chevron
    width: 0.875rem
    height: 0.875rem
    color: $fg-muted
    flex-shrink: 0
    transition: transform $transition

    .code-tree-node--open &
      transform: rotate(90deg)

  &__icon
    width: 0.875rem
    height: 0.875rem
    color: $fg-muted
    flex-shrink: 0

  &__label
    flex: 1 1 auto
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
```

## CodeView (active file viewer)

```sass
.code-view
  display: flex
  height: 100%
  min-height: 0
  flex-direction: column

  &__toolbar
    display: flex
    align-items: center
    justify-content: space-between
    gap: 0.5rem
    padding: 0.5rem 0.75rem
    border-bottom: 1px solid $border
    background-color: $bg-card
    flex-shrink: 0

  &__filename
    display: inline-flex
    align-items: center
    gap: 0.375rem
    font-family: $font-mono
    font-size: 0.8125rem
    color: $fg

    > svg
      width: 0.875rem
      height: 0.875rem
      color: $fg-muted

  &__actions
    display: inline-flex
    align-items: center
    gap: 0.25rem

  &__copy-state
    display: inline-flex
    align-items: center
    gap: 0.25rem
    font-size: 0.75rem
    color: $fg-muted

  &__body
    flex: 1 1 auto
    min-height: 0
    overflow: auto
    background-color: $bg-card
```

## Two-pane layout (shared shell)

```sass
.code-preview-shell
  display: grid
  gap: 0
  border: 1px solid $border
  border-radius: $radius-xl
  overflow: hidden
  background-color: $bg-card
  min-height: 28rem
  height: 36rem

  @media (min-width: 1024px)
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)

  // stacked on smaller screens
  @media (max-width: 1023px)
    grid-template-rows: 18rem 1fr
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-card-dark:       hsl(222 47% 6%)
  $bg-neutral-dark:    hsl(220 27% 10%)
  $bg-muted-dark:      hsl(217 33% 17%)
  $fg-dark:            hsl(210 40% 98%)
  $fg-muted-dark:      hsl(215 16% 65%)
  $border-dark:        hsl(217 33% 17%)

  .block-preview
    background-color: $bg-card-dark
    color: $fg-dark

  .code-tree
    background-color: $bg-neutral-dark
    color: $fg-dark

  .code-tree-node
    &:hover
      background-color: $bg-muted-dark
    &--active
      background-color: $bg-muted-dark

  .code-view
    &__toolbar
      border-bottom-color: $border-dark
      background-color: $bg-card-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="code-preview-shell">
  <BlockPreview item={item} />

  <CodeTree
    codeTree={item.codeTree}
    activeFileId={activeFileId}
    openFolderIds={openFolderIds}
    onSelectFile={(id) => (activeFileId = id)}
    onToggleFolder={(id) => toggle(id)}
  />

  <CodeView activeFile={findFile(item.codeTree, activeFileId)} />
</div>
```
