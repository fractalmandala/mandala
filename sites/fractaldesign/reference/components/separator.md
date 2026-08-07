---
title: Separator
description: A thin horizontal or vertical line used to divide content. The simplest possible primitive.
---

# Separator

The `Separator` component is a 1px hairline that adapts to its container — horizontal by default, vertical when `orientation="vertical"` is set.

The styling below is pure indented Sass.

## Tokens

```sass
$bg-border: hsl(214 32% 91%)
```

## Separator

```sass
.separator
  flex-shrink: 0
  background-color: $bg-border

  // horizontal — 1px tall, full width
  &[data-orientation="horizontal"]
    height: 1px
    width: 100%

  // vertical — 1px wide, full height
  &[data-orientation="vertical"]
    width: 1px
    height: 100%
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $border-dark: hsl(217 33% 17%)

  .separator
    background-color: $border-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="separator" data-orientation="horizontal"></div>

<div class="separator" data-orientation="vertical"></div>
```
