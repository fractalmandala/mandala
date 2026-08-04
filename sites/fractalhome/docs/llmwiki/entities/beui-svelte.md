---
title: BEUI Svelte Package
description: Published Svelte package with 30 spring-animated beUI components at @beui/svelte under packages/fractal-svelte.
tags: [svelte, beui, component-library, motion, fractal-svelte]
sources: [2026-08-03-beui-svelte-orchestrate.md]
created: 2026-08-03
updated: 2026-08-03
type: entity
boss: svelte
project: fractal-svelte
---

`@beui/svelte` is a Svelte 5 component library porting the beUI React library (beui.dev) into the mandala monorepo at `packages/fractal-svelte/`.

## Stack

- Svelte 5 runes (`$props`, `$state`, `$derived`, `$bindable`, `$effect`)
- SvelteKit (docs site + registry API)
- Indented SASS with two-layer CSS token system (primitive → semantic)
- `@humanspeak/svelte-motion` v0.8.x peer dependency (Framer-Motion-parity)
- pnpm, vitest, @testing-library/svelte

## Component inventory (30 total)

**Motion primitives (13):** Button, StatefulButton, MagneticButton, Tabs, Switch, Checkbox, RadioGroup, AnimatedBadge, Number, Marquee, Tooltip, Input, Loader (17 variants), TextAnimation

**Agent primitives (9):** PromptInput, Message, MessageBubble, TodoList, ApprovalCard, FileDiff, AiSidebar, StreamingResponse, MessageScroller

**Product blocks (8):** NotificationStack, FeedbackWidget, NotFound, ThemeToggle, ExpandableActionBar, ActionSwap, BouncyAccordion, OverflowActions

## Styling contract

- `data-slot` attribute selectors for all component-owned elements
- Variants expressed as typed props rendered as `data-*` attributes, SASS nested on them
- Zero `<style>` blocks, zero Tailwind, zero `cn()` or class-string merging
- Two-layer tokens: primitives (`--beui-gray-*`, `--beui-blue-500`) → semantic (`--background`, `--primary`, `--muted`)
- Reduced motion via `--beui-motion-scale` CSS token (0 when `prefers-reduced-motion: reduce`)

## Registry

REST API under `/r/registry` (index) and `/r/[name]` (per-component) serving shadcn-schema items with source content. Validated by `check-registry.ts` script.

## Deviations from fractalsvelte

- No Tailwind dependency (fractalsvelte still has Tailwind)
- `data-slot` SASS pattern (fractalsvelte uses Bits UI/Tailwind classes)
- Motion engine via `@humanspeak/svelte-motion` (fractalsvelte has no motion primitives)
- beUI's agent primitives overlap fractalsvelte's `ai-elements/` — 10 of 16 overlap, only motion-distinct versions ported
