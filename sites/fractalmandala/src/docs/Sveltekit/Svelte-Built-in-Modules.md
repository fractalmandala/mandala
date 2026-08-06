---
title: Svelte Built-in Modules
description: The standard modules in Svelte 5 — svelte/store, svelte/motion, svelte/transition, svelte/animate, svelte/easing, svelte/action, svelte/events, svelte/compiler, svelte/legacy, svelte/reactivity, svelte/server, svelte/attachments — plus compiler and runtime error/warning diagnostics.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - svelte-5
  - modules
  - stores
  - transitions
  - animations
  - actions
  - easing
  - compiler
sources:
  - svelteKitDocs-43-stores
  - svelteKitDocs-55-svelte
  - svelteKitDocs-56-svelte-action
  - svelteKitDocs-57-svelte-animate
  - svelteKitDocs-58-svelte-attachments
  - svelteKitDocs-59-svelte-compiler
  - svelteKitDocs-60-svelte-easing
  - svelteKitDocs-61-svelte-events
  - svelteKitDocs-62-svelte-legacy
  - svelteKitDocs-63-svelte-motion
  - svelteKitDocs-64-svelte-reactivity-window
  - svelteKitDocs-65-svelte-reactivity
  - svelteKitDocs-66-svelte-server
  - svelteKitDocs-67-svelte-store
  - svelteKitDocs-68-svelte-transition
  - svelteKitDocs-69-compiler-errors
  - svelteKitDocs-70-compiler-warnings
  - svelteKitDocs-71-runtime-errors
  - svelteKitDocs-72-runtime-warnings
  - svelteKitDocs-48-best-practices
  - svelteKitDocs-49-testing
  - svelteKitDocs-50-typescript
  - svelteKitDocs-51-custom-elements
  - svelteKitDocs-54-faq
related:
  - Svelte-5-Template-Directives
  - Svelte-5-Runes
  - Svelte-Motion
timestamp: 2026-06-21
source: Wiki repo
---

Svelte ships several built-in modules that provide standard functionality for state management, animation, transitions, and more.

## svelte/store

The `svelte/store` module provides writable, readable, and derived stores. While Svelte 5 encourages runes over stores for local state, stores remain useful for global state accessed outside `.svelte` files.

```ts
import { writable, derived, readonly } from 'svelte/store'
```

## svelte/transition

Built-in transition functions: `fade`, `fly`, `slide`, `scale`, `blur`, `crossfade`, `draw`. Custom transitions return CSS keyframes or JavaScript-based animation functions.

## svelte/animate

Built-in animation functions for `animate:` directive. The primary built-in is `flip` — a FLIP animation for list reordering.

## svelte/easing

Easing functions for transitions and animations: `linear`, `easeInOutCubic`, `backIn`, `elasticOut`, etc. Based on standard easing curves.

## svelte/motion

Spring-based motion utilities: `spring` and `tweened` stores for physics-based animations. See also the [Svelte Motion](Svelte-Motion) library for more advanced animations.

## svelte/action

The `use:` directive type definition. Actions are functions that run when elements mount, with `update` and `destroy` lifecycle hooks.

## svelte/events

Event handling utilities for Svelte components, including event forwarding and custom event creation.

## svelte/compiler

The Svelte compiler API, for programmatic compilation of `.svelte` files. Used by bundler integrations (Vite, Rollup) and build tools.

## svelte/legacy

Legacy compatibility helpers for importing and using Svelte 4 components in Svelte 5.

## svelte/reactivity

Reactivity primitives for use outside components. `SvelteReactivity` provides custom reactivity adapters.

## svelte/server

Server-side rendering utilities. `render()` for SSR, `ServerComponentNode` for server-side component trees.

## svelte/attachments

Utilities for Svelte 5 attachments (`{@attach}`).

## Diagnostics

- `svelte/compiler` produces **compiler errors** and **warnings** with codes for tooling integration
- **Runtime errors** and **warnings** provide diagnostic information during development

## Best Practices

- Prefer runes over stores for component-state
- Use TypeScript for type-safe store and context interactions
- Custom elements (`<svelte:options customElement="my-component" />`) for framework-agnostic component distribution
- Testing with Vitest + `svelte/compiler` for component unit tests

## See Also
- [Svelte 5 Runes](Svelte-5-Runes) — the modern alternative to stores for local state
- [Svelte 5 Template Directives](Svelte-5-Template-Directives) — where transition, animate, and action directives are used
- [Svelte Motion](Svelte-Motion) — advanced animation library
