---
title: Confirmation
description: A guard pattern for tool calls that require explicit user approval before they execute (e.g., file writes, sending email, executing shell commands). Renders an Alert with a request body, accept/reject actions, and post-decision acknowledgement states.
---

# Confirmation

The `Confirmation` family is the UI surface for the "human-in-the-loop" pattern that the AI SDK's tool calls support. It renders three mutually-exclusive states:

1. **Request** — shown when the model has proposed a tool call and is waiting for the user to approve or reject.
2. **Accepted** — shown after the user approves and the tool has begun / finished executing.
3. **Rejected** — shown after the user rejects; the call is denied and any output is suppressed.

All three states share a common `Alert`-style container with a title row and an action row that only appears in the request state.

The styling below is pure indented Sass.

## Tokens

```sass
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-destructive:     hsl(0 84% 60%)
$bg:                 hsl(0 0% 100%)
$bg-destructive:     hsl(0 84% 60% / 0.05)
$bg-destructive-fg:  hsl(0 84% 60% / 0.1)
$border:             hsl(214 32% 91%)
$border-destructive: hsl(0 84% 60% / 0.3)
$radius-md:          0.5rem
$radius-lg:          0.75rem
$shadow-sm:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$action-height:      2rem
$action-padding-x:   0.75rem
```

## Mixins

```sass
=alert-base($bg: $bg, $border: $border, $fg: $fg)
  position: relative
  display: flex
  width: 100%
  flex-direction: column
  gap: 0.5rem
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg
  padding: 1rem
  color: $fg
  box-shadow: $shadow-sm

  // inner text inherits color
  &__title
    display: flex
    align-items: center
    gap: 0.5rem
    font-weight: 500
    line-height: 1.25

  &__description
    display: inline
    font-size: 0.875rem
    line-height: 1.4
    color: inherit
    opacity: 0.85

    // when nested inside a title, drop the line-height and use inline flow
    .confirmation-title > &
      display: inline
```

## Confirmation (root)

```sass
.confirmation
  +alert-base()
  background-color: $bg-destructive
  border-color: $border-destructive
  color: $fg-destructive
```

## ConfirmationTitle

A short heading that typically reads "Allow this action?" or similar. Sits inline with optional iconography to the left.

```sass
.confirmation-title
  display: flex
  align-items: center
  gap: 0.5rem
  font-size: 0.875rem
  font-weight: 500
  line-height: 1.25
  color: inherit

  // icon slot
  > svg
    width: 1rem
    height: 1rem
    flex-shrink: 0

  // inline description directly after the title (no block break)
  &__description
    display: inline
    font-weight: 400
    color: inherit
    opacity: 0.85
```

## ConfirmationRequest

A conditional slot — only renders when the tool's state is `approval-requested`. Usually contains the title and the action row.

```sass
.confirmation-request
  display: flex
  flex-direction: column
  gap: 0.5rem
```

## ConfirmationActions

A horizontal row of buttons at the bottom of the request panel. Only shown in the request state.

```sass
.confirmation-actions
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 0.5rem
  margin-top: 0.25rem
```

## ConfirmationAction

A small button. The default accepts (positive), but a `variant="destructive"` reject button is the standard companion.

```sass
.confirmation-action
  display: inline-flex
  align-items: center
  justify-content: center
  height: $action-height
  padding: 0 $action-padding-x
  border: 1px solid transparent
  border-radius: 0.375rem
  background-color: $fg
  color: $bg
  font-size: 0.875rem
  font-weight: 500
  line-height: 1
  cursor: pointer
  transition: background-color $transition, color $transition, border-color $transition, opacity $transition

  &:hover
    opacity: 0.85

  &:focus-visible
    outline: 2px solid currentColor
    outline-offset: 2px

  &:active
    transform: translateY(1px)

  &:disabled
    pointer-events: none
    opacity: 0.5

  // variants
  &--default
    background-color: $fg
    color: $bg

  &--outline
    background-color: transparent
    color: $fg
    border-color: $border

    &:hover
      background-color: hsl(210 40% 96%)

  &--secondary
    background-color: hsl(210 40% 96%)
    color: $fg

    &:hover
      background-color: hsl(214 32% 91%)

  &--ghost
    background-color: transparent
    color: $fg-muted

    &:hover
      background-color: hsl(210 40% 96%)
      color: $fg

  &--destructive
    background-color: $fg-destructive
    color: hsl(0 0% 100%)

    &:hover
      background-color: hsl(0 84% 50%)

  // sizes
  &--sm
    height: 1.75rem
    padding: 0 0.625rem
    font-size: 0.8125rem

  &--lg
    height: 2.25rem
    padding: 0 0.875rem
    font-size: 0.9375rem
```

## ConfirmationAccepted

A conditional slot — only renders when the user approved and the tool is in a "responded" state. Typically shows a single line of acknowledgement like "Approved — running."

```sass
.confirmation-accepted
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0.75rem 1rem
  border-radius: $radius-md
  background-color: hsl(142 76% 36% / 0.08)
  border: 1px solid hsl(142 76% 36% / 0.25)
  color: hsl(142 76% 36%)
  font-size: 0.875rem
  font-weight: 500

  > svg
    width: 1rem
    height: 1rem
    flex-shrink: 0
```

## ConfirmationRejected

A conditional slot — only renders when the user rejected. Typically shows "Cancelled" with a destructive tint.

```sass
.confirmation-rejected
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0.75rem 1rem
  border-radius: $radius-md
  background-color: hsl(0 84% 60% / 0.08)
  border: 1px solid hsl(0 84% 60% / 0.25)
  color: $fg-destructive
  font-size: 0.875rem
  font-weight: 500

  > svg
    width: 1rem
    height: 1rem
    flex-shrink: 0
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $fg-dark:                hsl(210 40% 98%)
  $fg-muted-dark:          hsl(215 16% 65%)
  $bg-dark:                hsl(222 47% 6%)
  $bg-hover-dark:          hsl(217 33% 17%)
  $border-dark:            hsl(217 33% 17%)

  .confirmation
    background-color: hsl(0 84% 60% / 0.08)
    border-color: hsl(0 84% 60% / 0.3)
    color: hsl(0 84% 70%)

  .confirmation-action
    &--default
      background-color: $fg-dark
      color: $bg-dark
    &--outline
      border-color: $border-dark
      color: $fg-dark
      &:hover
        background-color: $bg-hover-dark
    &--secondary
      background-color: $bg-hover-dark
      color: $fg-dark
      &:hover
        background-color: hsl(217 33% 20%)
    &--ghost
      color: $fg-muted-dark
      &:hover
        background-color: $bg-hover-dark
        color: $fg-dark

  .confirmation-accepted
    background-color: hsl(142 76% 36% / 0.12)
    border-color: hsl(142 76% 36% / 0.4)
    color: hsl(142 76% 60%)

  .confirmation-rejected
    background-color: hsl(0 84% 60% / 0.12)
    border-color: hsl(0 84% 60% / 0.4)
    color: hsl(0 84% 70%)
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="confirmation" role="alert">
  {#if state === "approval-requested"}
    <div class="confirmation-request">
      <div class="confirmation-title">
        <AlertTriangle />
        Allow this tool to run?
        <span class="confirmation-title__description">
          Writes a file to <code>./output.json</code>.
        </span>
      </div>

      <div class="confirmation-actions">
        <button class="confirmation-action confirmation-action--default" type="button">
          Approve
        </button>
        <button class="confirmation-action confirmation-action--outline" type="button">
          Reject
        </button>
      </div>
    </div>
  {:else if approval?.approved === true}
    <div class="confirmation-accepted">
      <CheckCircle />
      Approved
    </div>
  {:else if approval?.approved === false}
    <div class="confirmation-rejected">
      <XCircle />
      Cancelled
    </div>
  {/if}
</div>
```
