---
title: Svelte Legacy Patterns
description: Svelte 4 patterns replaced by runes in Svelte 5 — let declarations, reactive assignments, export let, $$props/$$restProps, on:event directives, slots, and the imperative component API — and their modern equivalents.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - svelte-4
  - legacy
  - migration
  - backward-compatibility
sources:
  - svelteKitDocs-73-legacy-overview
  - svelteKitDocs-74-legacy-let
  - svelteKitDocs-75-legacy-reactive-assignments
  - svelteKitDocs-76-legacy-export-let
  - svelteKitDocs-77-legacy-$$props-and-$$restProps
  - svelteKitDocs-78-legacy-on
  - svelteKitDocs-79-legacy-slots
  - svelteKitDocs-80-legacy-$$slots
  - svelteKitDocs-81-legacy-svelte-fragment
  - svelteKitDocs-82-legacy-svelte-component
  - svelteKitDocs-83-legacy-svelte-self
  - svelteKitDocs-84-legacy-component-api
  - svelteKitDocs-62-svelte-legacy
related:
  - Svelte-5-Runes
  - Svelte-5-Template-Syntax
  - Svelte-Migration-Guides
timestamp: 2026-06-21
source: Wiki repo
---

Svelte 5 introduces runes as a unified reactivity model. The legacy mode provides backward compatibility with Svelte 4 syntax, but new projects should use runes.

## Legacy let

In Svelte 4, `let` declarations were not reactive by default. Reactivity came through `$:` labels (reactive assignments) and `export let` (props).

**Modern equivalent:** Use `$state()` for reactive variables and `$props()` for component inputs.

## Reactive Assignments ($:)

The `$:` label created reactive statements that re-ran when dependencies changed.

```svelte
<!-- Svelte 4 -->
$: doubled = count * 2
$: console.log('count is', count)
```

**Modern equivalent:** `$derived()` for computed values, `$effect()` for side effects.

## export let

Props were declared with `export let` in Svelte 4.

```svelte
<!-- Svelte 4 -->
<script>
  export let name
  export let age = 18
</script>
```

**Modern equivalent:** `$props()` destructuring with default values.

## $$props and $$restProps

`$$props` gave access to all passed props, `$$restProps` gave the props not explicitly declared.

**Modern equivalent:** Rest properties in `$props()` destructuring: `let { explicit, ...rest } = $props()`.

## on:event Directive

Svelte 4 used `on:click`, `on:input`, etc. for event handlers.

**Modern equivalent:** Use the `onclick`, `oninput`, etc. attribute syntax (lowercase, without colon), matching how HTML event handlers work.

## Slots `(<slot>)`

Svelte 4 used `<slot>` elements and named slots for content projection.

```svelte
<!-- Svelte 4 -->
<slot name="header" />
<slot />
```

**Modern equivalent:** Snippets with `{@render}` for more flexible and type-safe content projection.

## $$slots

`$$slots` was an object indicating which slots were passed content.

**Modern equivalent:** Check if a snippet prop was provided (it will be `undefined` if not passed).

## `<svelte:fragment>`

Used to wrap content without a container element, primarily for slot scenarios.

**Modern equivalent:** Not needed — snippets inherently provide fragment-like behavior.

## `<svelte:component>`

Rendered a dynamic component based on a variable.

```svelte
<svelte:component this={selectedComponent} />
```

**Modern equivalent:** Use `<svelte:element>` or conditional rendering with `{#if}`.

## `<svelte:self>`

Allowed a component to include itself recursively.

**Modern equivalent:** Components can import and reference themselves directly in Svelte 5.

## Imperative Component API (Svelte 4)

Components were created imperatively with `new Component({ target, props })`.

**Modern equivalent:** Use `mount(Component, { target, props })` and `unmount(component)` from `svelte`.

## See Also
- [Svelte 5 Runes](Svelte-5-Runes) — the modern equivalent of all legacy patterns
- [Svelte 5 Template Syntax](Svelte-5-Template-Syntax) — snippets replace slots, event attributes replace on:
- [Svelte Migration Guides](Svelte-Migration-Guides) — step-by-step migration guides
