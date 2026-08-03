---
title: Artifact
description: A framed container used to display an assistant's structured output — code, a generated document, a diagram — with a labeled header, scrollable body, and an actions/close affordance in the header.
---

# Artifact

The `Artifact` family is a card-style wrapper for surfacing structured AI output. It mirrors the visual language of a window: bordered frame, muted title bar, scrollable content body, and a row of small icon buttons on the right of the header for actions like copy / download / close.

The styling below recreates each part in pure indented Sass — no Tailwind, no shadcn. All colors, radii, and shadows are derived from design tokens.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-muted:           hsl(210 40% 96%)
$bg-muted-50:        hsl(210 40% 96% / 0.5)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$radius-md:          0.5rem
$radius-lg:          0.5rem
$shadow-sm:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Artifact (root frame)

```sass
.artifact
  display: flex
  flex-direction: column
  overflow: hidden
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg
  color: $fg
  box-shadow: $shadow-sm
```

## ArtifactHeader

The "title bar" of the artifact. Muted background, horizontal rule underneath, balanced space-between layout so the title sits left and the actions sit right.

```sass
.artifact-header
  display: flex
  align-items: center
  justify-content: space-between
  border-bottom: 1px solid $border
  background-color: $bg-muted-50
  padding: 0.75rem 1rem
```

## ArtifactTitle

```sass
.artifact-title
  margin: 0
  font-size: 0.875rem
  font-weight: 500
  line-height: 1.25
  color: $fg
```

## ArtifactDescription

```sass
.artifact-description
  margin: 0
  font-size: 0.875rem
  line-height: 1.25
  color: $fg-muted
```

## ArtifactContent

The scrollable body of the artifact. Fills the remaining vertical space inside the parent flex column.

```sass
.artifact-content
  flex: 1 1 auto
  overflow-y: auto
  padding: 1rem
```

## ArtifactActions

A horizontal row of small icon buttons pinned to the right side of the header.

```sass
.artifact-actions
  display: flex
  align-items: center
  gap: 0.25rem
```

## ArtifactAction

An icon-only ghost button with an optional tooltip. Defaults to a 32×32 size (the `size-8` Tailwind token). The icon inside is 16px.

```sass
.artifact-action
  display: inline-flex
  align-items: center
  justify-content: center
  width: 2rem
  height: 2rem
  padding: 0
  border: 1px solid transparent
  border-radius: 0.375rem
  background-color: transparent
  color: $fg-muted
  cursor: pointer
  transition: background-color $transition, color $transition, transform $transition

  &:hover
    color: $fg
    background-color: hsl(210 40% 96%)

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px

  &:active
    transform: translateY(1px)

  > svg
    width: 1rem
    height: 1rem
    pointer-events: none
    flex-shrink: 0

  &__label
    position: absolute
    width: 1px
    height: 1px
    padding: 0
    margin: -1px
    overflow: hidden
    clip: rect(0, 0, 0, 0)
    white-space: nowrap
    border: 0
```

## ArtifactClose

A specialized `ArtifactAction` with no icon by default — the consumer renders an "X". Same dimensions and hover treatment as `ArtifactAction`, with a subtle hover that intensifies to a destructive tint.

```sass
.artifact-close
  +artifact-action()  // see mixin below — same base as ArtifactAction

  &:hover
    color: hsl(0 84% 60%)
    background-color: hsl(0 84% 60% / 0.1)
```

### Mixin form

If you prefer to share the base rules instead of repeating them, define once and reuse:

```sass
=artifact-icon-button
  display: inline-flex
  align-items: center
  justify-content: center
  width: 2rem
  height: 2rem
  padding: 0
  border: 1px solid transparent
  border-radius: 0.375rem
  background-color: transparent
  color: $fg-muted
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    color: $fg
    background-color: hsl(210 40% 96%)

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 2px

  > svg
    width: 1rem
    height: 1rem

.artifact-action
  +artifact-icon-button

.artifact-close
  +artifact-icon-button
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:        hsl(222 47% 6%)
  $bg-muted-dark:  hsl(217 33% 17%)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)
  $border-dark:    hsl(217 33% 17%)

  .artifact
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark

  .artifact-header
    background-color: $bg-muted-dark
    border-bottom-color: $border-dark

  .artifact-title
    color: $fg-dark

  .artifact-description
    color: $fg-muted-dark

  .artifact-action
    color: $fg-muted-dark
    &:hover
      color: $fg-dark
      background-color: hsl(217 33% 17% / 0.5)
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="artifact">
  <div class="artifact-header">
    <div>
      <p class="artifact-title">Generated README</p>
      <p class="artifact-description">Created 2 minutes ago</p>
    </div>

    <div class="artifact-actions">
      <button class="artifact-action" aria-label="Copy">
        <Copy />
      </button>
      <button class="artifact-action" aria-label="Download">
        <Download />
      </button>
      <button class="artifact-close" aria-label="Close">
        <X />
      </button>
    </div>
  </div>

  <div class="artifact-content">
    <!-- long-form content goes here -->
  </div>
</div>
```
