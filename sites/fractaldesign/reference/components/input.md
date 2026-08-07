---
title: Input
description: A foundational text input with size, error, and file-upload variants. Used everywhere a single-line text field is needed — search bars, form fields, secret values, and file pickers.
---

# Input

The `Input` component is the foundational text input. It renders as a styled `<input>` element with focus ring, error state, and a dedicated file-upload mode that styles the inner file picker button.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-input-30:        hsl(217 33% 17% / 0.3)
$fg:                 hsl(222 47% 11%)
$fg-foreground:      hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$fg-file:            hsl(222 47% 11%)
$border:             hsl(214 32% 91%)
$border-input:       hsl(217 33% 17%)
$border-ring:        hsl(222 47% 11% / 0.5)
$border-destructive-20: hsl(0 84% 60% / 0.2)
$border-destructive-40: hsl(0 84% 60% / 0.4)
$border-destructive-50: hsl(0 84% 60% / 0.5)

$radius-md:          0.375rem
$shadow-xs:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$ring-width:         3px

$height:             2.25rem       // 36px — `h-9`
$padding-x:          0.625rem      // 10px — `px-2.5`
$padding-y:          0.25rem       // 4px  — `py-1`
$file-height:        1.75rem       // 28px — `file:h-7`
$font-size-base:     1rem          // 16px (mobile)
$font-size-md:       0.875rem      // 14px (≥md)
```

## Mixins

```sass
=focus-ring($color: $border-ring)
  outline: none
  box-shadow: 0 0 0 $ring-width $color

=disabled
  pointer-events: none
  cursor: not-allowed
  opacity: 0.5

=invalid
  border-color: hsl(0 84% 60%)
  box-shadow: 0 0 0 $ring-width $border-destructive-20

=input-base
  display: block
  width: 100%
  min-width: 0
  height: $height
  padding: $padding-y $padding-x
  border: 1px solid $border
  border-radius: $radius-md
  background-color: transparent
  color: $fg
  font-size: $font-size-base
  line-height: 1.25
  box-shadow: $shadow-xs
  outline: none
  transition: color $transition, box-shadow $transition, border-color $transition

  &::placeholder
    color: $fg-muted

  &:focus-visible
    border-color: $border-ring
    +focus-ring

  &[aria-invalid="true"]
    +invalid

  &:disabled
    +disabled

  @media (min-width: 768px)
    font-size: $font-size-md
```

## Input (default — text / number / email / etc.)

```sass
.input
  +input-base
```

## Input (file variant)

The file variant styles the inner `<input type="file">` plus the picker button. The button text color is `--color-foreground` so it picks up the current foreground in dark mode.

```sass
.input--file
  +input-base
  font-size: $font-size-base

  // the file picker button
  &::file-selector-button
    display: inline-flex
    align-items: center
    justify-content: center
    height: $file-height
    padding: 0 0.5rem
    margin: 0 (-$padding-x) 0 (-$padding-x)
    border: 0
    border-radius: 0
    background-color: transparent
    color: $fg-file
    font-size: 0.875rem
    font-weight: 500
    cursor: pointer

  @media (min-width: 768px)
    font-size: $font-size-md
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  .input
    background-color: $bg-input-30
    border-color: $border-input

  .input--file
    background-color: $bg-input-30
    border-color: $border-input

  // invalid state in dark mode uses a stronger ring
  .input[aria-invalid="true"]
    box-shadow: 0 0 0 $ring-width $border-destructive-40
    border-color: $border-destructive-50
```

## Usage skeleton (Svelte, for reference)

```svelte
<input class="input" type="email" placeholder="you@example.com" />

<input class="input input--file" type="file" accept="image/*" multiple />

<input class="input" type="text" aria-invalid="true" placeholder="Invalid" />
```
