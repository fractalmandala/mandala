---
title: Plan
description: A card-style container that surfaces the model's high-level plan for the current task — title, description, optional actions, and a footer. The title and description shimmer while the plan is still streaming in.
---

# Plan

The `Plan` family is used to display the model's "thinking plan" before it begins a long task. The container is a `Card` wrapped in a `Collapsible`, so the user can collapse the plan once they've read it. While the plan is streaming in, the title and description both shimmer to indicate that content is still being produced.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$radius-lg:          0.75rem
$radius-md:          0.5rem
$shadow-none:        none
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$padding-card:       1.5rem     // matches `py-6`
$header-gap:         1.5rem     // matches `gap-6`
$icon-button-size:   2rem       // 32px — `size-8`
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
  width: $icon-button-size
  height: $icon-button-size
  border: 1px solid transparent
  border-radius: $radius-md
  background-color: transparent
  color: $fg-muted
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    background-color: hsl(210 40% 96%)
    color: $fg

  &:focus-visible
    +focus-ring

  > svg
    width: 1rem
    height: 1rem
```

## Plan (root)

A collapsible card with no shadow.

```sass
.plan
  display: flex
  flex-direction: column
  overflow: hidden
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg-card
  color: $fg
  box-shadow: none
```

## PlanTrigger

A small ghost button that toggles the collapsible. Default slot shows an expand-collapse chevron icon.

```sass
.plan-trigger
  +icon-ghost-button()

  // screen-reader label
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

## PlanContent

The collapsible body. Uses CSS Grid to animate from `0fr` (collapsed) to `1fr` (open).

```sass
.plan-content
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
    padding: 0 1.5rem 1.5rem
```

## PlanHeader

The header row. Left side has title + description stacked vertically; right side has the action slot.

```sass
.plan-header
  display: flex
  align-items: flex-start
  justify-content: space-between
  gap: $header-gap
  padding: 1.5rem
```

## PlanTitle

The plan heading. Wraps its content in a `Shimmer` while the plan is streaming in.

```sass
.plan-title
  margin: 0
  font-size: 1rem
  font-weight: 600
  line-height: 1.25
  letter-spacing: -0.01em
  color: $fg
  display: flex
  align-items: center
  gap: 0.5rem
```

## PlanDescription

The supporting copy below the title. Same shimmer treatment.

```sass
.plan-description
  margin: 0.25rem 0 0
  font-size: 0.875rem
  line-height: 1.4
  color: $fg-muted
  text-wrap: balance
```

## PlanAction

A slot in the top-right corner of the header (e.g. a small "approve" or "cancel" button).

```sass
.plan-action
  display: flex
  align-items: center
  gap: 0.5rem
  flex-shrink: 0
```

## PlanFooter

A footer row below the content (typically used for plan-approval buttons).

```sass
.plan-footer
  display: flex
  align-items: center
  justify-content: space-between
  gap: 0.5rem
  padding: 0 1.5rem 1.5rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:        hsl(222 47% 6%)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)
  $border-dark:    hsl(217 33% 17%)

  .plan
    background-color: $bg-dark
    border-color: $border-dark
    color: $fg-dark

  .plan-title
    color: $fg-dark

  .plan-description
    color: $fg-muted-dark

  .plan-trigger
    color: $fg-muted-dark
    &:hover
      background-color: hsl(217 33% 17%)
      color: $fg-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="plan">
  <div class="plan-header">
    <div>
      <h3 class="plan-title">Refactor the auth flow</h3>
      <p class="plan-description">Split the monolithic session handler into per-route middleware.</p>
    </div>

    <div class="plan-action">
      <button class="plan-trigger" type="button" aria-label="Toggle plan">
        <ChevronsUpDown />
        <span class="plan-trigger__label">Toggle plan</span>
      </button>
    </div>
  </div>

  <div class="plan-content" data-state="open">
    <div>
      <ol>
        <li>Extract session helper into <code>$lib/server/session.ts</code></li>
        <li>Add per-route middleware entry</li>
        <li>Update existing imports</li>
      </ol>
    </div>
  </div>

  <div class="plan-footer">
    <button class="plan-trigger" type="button">Approve plan</button>
    <button class="plan-trigger" type="button">Cancel</button>
  </div>
</div>
```
