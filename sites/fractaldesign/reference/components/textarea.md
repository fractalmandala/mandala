---
title: Textarea
description: A multi-line text input used for message composers, descriptions, and any free-form text. Auto-grows as the user types via `field-sizing-content`.
---

# Textarea

The `Textarea` component is a styled `<textarea>` element with the same focus, error, and disabled states as `Input`. It auto-grows to fit its content via the modern `field-sizing: content` property.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-input-30:        hsl(217 33% 17% / 0.3)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$border-input:       hsl(217 33% 17%)
$border-ring-50:     hsl(222 47% 11% / 0.5)
$border-destructive-20: hsl(0 84% 60% / 0.2)
$border-destructive-40: hsl(0 84% 60% / 0.4)
$border-destructive-50: hsl(0 84% 60% / 0.5)
$radius-md:          0.375rem
$shadow-xs:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$ring-width:         3px
$min-height:         4rem          // 64px — `min-h-16`
$padding-x:          0.625rem      // 10px — `px-2.5`
$padding-y:          0.5rem        // 8px  — `py-2`
$font-size:          1rem          // 16px on mobile
$font-size-md:       0.875rem      // 14px on ≥md
$line-height:        1.25
```

## Mixins

```sass
=focus-ring($color: $border-ring-50)
  outline: none
  box-shadow: 0 0 0 $ring-width $color

=disabled
  pointer-events: none
  cursor: not-allowed
  opacity: 0.5

=invalid-ring
  box-shadow: 0 0 0 $ring-width $border-destructive-20
  border-color: hsl(0 84% 60%)
```

## Textarea

```sass
.textarea
  display: flex
  width: 100%
  min-width: 0
  min-height: $min-height

  // modern CSS auto-grow — backed by all current browsers as of 2024
  field-sizing: content

  padding: $padding-y $padding-x
  border: 1px solid $border-input
  border-radius: $radius-md
  background-color: transparent
  color: $fg
  font-size: $font-size
  font-family: inherit
  line-height: $line-height
  box-shadow: $shadow-xs
  outline: none
  resize: none
  transition: color $transition, box-shadow $transition

  &::placeholder
    color: $fg-muted

  &:focus-visible
    border-color: $border-ring-50
    +focus-ring

  &[aria-invalid="true"]
    +invalid-ring

  &:disabled
    +disabled

  // ≥md
  @media (min-width: 768px)
    font-size: $font-size-md
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  .textarea
    background-color: $bg-input-30
    border-color: $border-input

    &[aria-invalid="true"]
      box-shadow: 0 0 0 $ring-width $border-destructive-40
      border-color: $border-destructive-50
```

## Usage skeleton (Svelte, for reference)

```svelte
<textarea class="textarea" placeholder="Tell us about your project" rows="3"></textarea>
```
