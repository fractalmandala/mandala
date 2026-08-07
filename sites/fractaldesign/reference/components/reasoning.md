---
title: Reasoning
description: A collapsible disclosure that reveals the model's internal reasoning trace before it produces a final answer. Shows a "Thinking…" placeholder while streaming and a "Thought for N seconds" caption once finished.
---

# Reasoning

The `Reasoning` family is similar to `ChainOfThought` but lighter weight — it shows the model's high-level scratchpad as a single collapsible block rather than a numbered list of steps. The header changes between `Thinking…` (while streaming) and `Thought for N seconds` (when complete).

The styling below is pure indented Sass.

## Tokens

```sass
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$bg:                 hsl(0 0% 100%)
$border:             hsl(214 32% 91%)
$radius-md:          0.375rem
$transition:         200ms cubic-bezier(0.4, 0, 0.2, 1)
$icon-size:          1rem
$gap-row:            0.5rem
```

## Mixins

```sass
=focus-ring
  outline: 2px solid $fg
  outline-offset: 2px

=collapsible-fade-slide
  &[data-state="open"]
    animation: reasoning-in 250ms $transition forwards

  &[data-state="closed"]
    animation: reasoning-out 200ms $transition forwards

@keyframes reasoning-in
  from
    opacity: 0
    transform: translateY(-8px)
  to
    opacity: 1
    transform: translateY(0)

@keyframes reasoning-out
  from
    opacity: 1
    transform: translateY(0)
  to
    opacity: 0
    transform: translateY(-8px)
```

## Reasoning (root)

```sass
.reasoning
  display: flex
  flex-direction: column
  gap: 0.25rem
  color: $fg
```

## ReasoningTrigger

The always-visible header. Shows a brain icon, a status label, and a rotating chevron.

```sass
.reasoning-trigger
  display: flex
  width: 100%
  align-items: center
  gap: 0.5rem
  padding: 0
  border: 0
  background: transparent
  font-size: 0.875rem
  color: $fg-muted
  text-align: left
  cursor: pointer
  transition: color $transition

  &:hover
    color: $fg

  &:focus-visible
    +focus-ring
    border-radius: $radius-md

  // brain icon
  > svg:first-of-type
    width: $icon-size
    height: $icon-size
    flex-shrink: 0

  // status text
  > span
    flex: 1 1 auto
    font-weight: 500

  // chevron
  > svg:last-of-type
    width: $icon-size
    height: $icon-size
    flex-shrink: 0
    transition: transform $transition
    transform: rotate(0deg)

  &[aria-expanded="true"] > svg:last-of-type
    transform: rotate(180deg)
```

## ReasoningContent

The collapsible body. Animates between `0fr` (closed) and `1fr` (open) using CSS Grid.

```sass
.reasoning-content
  display: grid
  grid-template-rows: 1fr
  margin-top: 1rem
  overflow: hidden
  font-size: 0.875rem
  color: $fg-muted
  transition: grid-template-rows $transition

  &[data-state="closed"]
    grid-template-rows: 0fr

  &[data-state="open"]
    grid-template-rows: 1fr

  > div
    min-height: 0

    // grid stack for individual reasoning paragraphs / paragraphs
    display: grid
    gap: 0.5rem

  +collapsible-fade-slide
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $fg-dark:        hsl(210 40% 98%)
  $fg-muted-dark:  hsl(215 16% 65%)

  .reasoning
    color: $fg-dark

  .reasoning-trigger
    color: $fg-muted-dark
    &:hover
      color: $fg-dark

  .reasoning-content
    color: $fg-muted-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="reasoning">
  <button class="reasoning-trigger" type="button" aria-expanded={open} onclick={() => (open = !open)}>
    <Brain />
    <span>Thought for {duration} seconds</span>
    <ChevronDown />
  </button>

  <div class="reasoning-content" data-state={open ? "open" : "closed"}>
    <div>
      <p>The user is asking about…</p>
      <p>Let me start by retrieving the latest data.</p>
    </div>
  </div>
</div>
```
