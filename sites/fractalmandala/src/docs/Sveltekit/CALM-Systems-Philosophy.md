---
title: CALM Systems Philosophy
description: A comprehensive mental model for building maintainable Svelte 5 apps — Contained, Automatic, Local, Minimal — covering state management, data flow, error handling, testing, and team practices.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - svelte-5
  - architecture
  - design-philosophy
  - calm-systems
  - best-practices
sources:
  - The-CALM-Manifesto-Calm-Systems
  - Foundation-—-Calm-Systems-with
  - Mental-Models-—-Calm-Systems-with
  - Building-a-Calm-System-Calm
  - Building-—-Calm-Systems-with-Svelte
  - Calm-Systems-with-Svelte-5
  - Data-Flow,-Not-Lifecycle-Calm
  - Derived-State-as-the-Backbone
  - Mutation-Is-Fine-Calm-Systems
  - No-Global-Store-Until-Proven-Guilty
  - Load-Functions-Are-Pure-Calm
  - Routes-Are-State-Boundaries-Calm
  - Error-Handling-at-the-Boundary
  - When-You-Need-$effect-Calm
  - When-to-Refresh-Data-Calm-Systems
  - TypeScript-with-Runes-Calm
  - Debugging-with-$inspect-Calm
  - Testing-Your-App-Calm-Systems
  - The-Cost-of-Cleverness-Calm
  - What-Not-to-Do-Calm-Systems-with
  - Component-Communication-Calm
  - Maintenance-—-Calm-Systems-with
  - Mini-Posts-—-Calm-Systems-with
  - Capstone-—-Calm-Systems-with-Svelte
  - SvelteKit-Data-Loading-Capstone-A
  - SvelteKit-Data-Loading-Capstone-A (1)
  - Mutation-Is-Fine-Calm-Systems
related:
  - Svelte-5-Runes
  - Svelte-Context-API
  - SvelteKit-Data-Loading
  - SvelteKit-Routing
  - SvelteKit-Error-Handling
timestamp: 2026-06-21
source: Wiki repo
---

CALM is both an acronym and a design philosophy for building Svelte 5 applications that remain maintainable over time.

## The CALM Principles

**Contained:** Every piece of state has a single, explicit owner.

**Automatic:** Reactivity happens without manual wiring.

**Local:** State lives as close as possible to where it is used.

**Minimal:** Every dependency, abstraction, and feature must earn its place.

## Core Tenets

### Data Flow, Not Lifecycle

Think about your app in terms of how data flows, not which lifecycle event fires when. Svelte 5's runes encourage this mindset — reactivity tracks data dependencies, not lifecycle hooks.

### Derived State as the Backbone

Prefer `$derived` over imperative `$effect` for computed values. Derived state is declarative, automatically consistent, and free of timing bugs.

### Mutation Is Fine

Svelte 5 embraces mutation of reactive state. There is no need for immutable update patterns — reassigning properties of `$state` objects triggers reactive updates naturally.

### No Global Store Until Proven Guilty

Start with local `$state`. Escalate to Context API for shared subtrees. Only introduce a global store when you have proven that local + context patterns are insufficient.

### Load Functions Are Pure

SvelteKit load functions should be pure data-fetching operations — no side effects, no component logic. This makes them testable, cacheable, and serializable.

### Routes Are State Boundaries

Each route in SvelteKit is an implicit state boundary. Data loaded in one route is isolated from others. Use layout data for shared state across routes.

### Error Handling at the Boundary

Handle errors at the component boundary (`<svelte:boundary>`), the route boundary (`+error.svelte`), and the app boundary (`hooks.server.js`). Never inside business logic.

## Practical Patterns

- **Component communication:** Prefer props (parent to child) and context (ancestor to descendant). Use events for child-to-parent signaling. Avoid global stores for local concerns.
- **Testing:** Because state is local and functions are pure, testing becomes straightforward. Mock at data-loading boundaries, not inside components.
- **When to use `$effect`:** For synchronizing with non-Svelte systems (localStorage, WebSockets, analytics), NOT for deriving values.
- **Maintenance:** A calm system is one where you can trace how data flows without opening every file. Explicit ownership and local state make this possible.
- **The cost of cleverness:** Prefer simple, obvious code over clever abstractions. The best code is the code your future self can understand in one read.
- **What not to do:** Avoid premature abstraction, unnecessary stores, over-engineering for hypothetical future needs, and mixing concerns in single components.

## See Also
- [Svelte 5 Runes](Svelte-5-Runes) — the reactivity primitives that enable CALM patterns
- [Svelte Context API](Svelte-Context-API) — for shared state within component subtrees
- [SvelteKit Data Loading](SvelteKit-Data-Loading) — pure load functions and route boundaries
- [SvelteKit Error Handling](SvelteKit-Error-Handling) — boundary-based error management
