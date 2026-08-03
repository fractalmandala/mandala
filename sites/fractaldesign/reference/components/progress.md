---
title: Progress
description: A horizontal progress bar (linear) used to convey determinate progress from 0 to a maximum value. Used for streaming downloads, file uploads, and tool-call progress.
---

# Progress

The `Progress` component is a thin wrapper around the `bits-ui` progress primitive. It exposes a `value` between `0` and `max` and an `Indicator` that translates horizontally as the value changes.

The styling below is pure indented Sass.

## Tokens

```sass
$bg-muted:           hsl(210 40% 96%)
$bg-primary:         hsl(222 47% 11%)
$radius-full:        9999px
$transition:         all 150ms cubic-bezier(0.4, 0, 0.2, 1)
$height:             0.375rem     // 6px — `h-1.5`
```

## Mixins

```sass
=disabled
  pointer-events: none
  cursor: not-allowed
  opacity: 0.5
```

## Progress (root)

```sass
.progress
  position: relative
  display: flex
  width: 100%
  height: $height
  overflow-x: hidden
  overflow-y: hidden
  border-radius: $radius-full
  background-color: $bg-muted
  outline: none

  &[disabled],
  &[data-disabled="true"]
    +disabled
```

## ProgressIndicator

The inner fill. Sits inside the root and translates `-X%` to indicate progress.

```sass
.progress-indicator
  height: 100%
  width: 100%
  flex: 1 1 0%
  background-color: $bg-primary
  transition: $transition

  // the value drives this transform via inline style:
  //   style="transform: translateX(-{100 - (100 * value) / max}%)"

  // indeterminate state — animated stripes
  .progress[data-state="indeterminate"] & &__indeterminate
    background-color: $bg-primary
    animation: progress-indeterminate 1.5s infinite

@keyframes progress-indeterminate
  0%
    transform: translateX(-100%) scaleX(0.5)
  50%
    transform: translateX(0) scaleX(0.3)
  100%
    transform: translateX(100%) scaleX(0.5)
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-muted-dark: hsl(217 33% 17%)
  $bg-primary-dark: hsl(210 40% 98%)

  .progress
    background-color: $bg-muted-dark

  .progress-indicator
    background-color: $bg-primary-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="progress" role="progressbar" aria-valuenow={40} aria-valuemin={0} aria-valuemax={100}>
  <div class="progress-indicator" style="transform: translateX(-60%)"></div>
</div>
```
