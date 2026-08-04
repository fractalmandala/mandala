---
title: Svelte 5 Runes
description: The five core runes ($state, $derived, $effect, $props, $bindable) plus $inspect and $host — Svelte 5's unified reactivity system.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - svelte-5
  - runes
  - reactivity
  - state-management
sources:
  - $state-Svelte-5-Reference
  - $derived-Svelte-5-Reference
  - $effect-Svelte-5-Reference
  - $props-Svelte-5-Reference
  - $bindable-Svelte-5-Reference
  - $inspect-Svelte-5-Reference
  - $host-Svelte-5-Reference
  - Runes-—-Svelte-5-Reference
  - The-Five-Runes-You-Actually-Need
  - Fine-Grained-Reactivity-Svelte-5
  - Advanced-Props-Patterns-in-Svelte-5
  - svelteKitDocs-05-what-are-runes
  - svelteKitDocs-06-$state
  - svelteKitDocs-07-$derived
  - svelteKitDocs-08-$effect
  - svelteKitDocs-09-$props
  - svelteKitDocs-10-$bindable
  - svelteKitDocs-11-$inspect
  - svelteKitDocs-12-$host
  - TypeScript-with-Runes-Calm
  - When-You-Need-$effect-Calm
  - Debugging-with-$inspect-Calm
  - $effect-Is-Not-componentDidMount
  - Svelte-5-Reference
related:
  - Svelte-5-Template-Syntax
  - Svelte-Context-API
  - Svelte-Built-in-Modules
  - CALM-Systems-Philosophy
timestamp: 2026-06-21
source: Wiki repo
---

Runes are Svelte 5's unified reactivity primitives — compiler-level signals that replace the Svelte 4 `let` / `export let` / `$:` / `store` ecosystem. They work in `.svelte` files and `.svelte.js` / `.svelte.ts` modules.

## $state

`$state` is the foundation of Svelte 5 reactivity. It transforms ordinary variables into reactive state — when the value changes, the UI updates automatically.

```svelte
<script>
  let count = $state(0)
</script>
<button onclick={() => count++}>Clicks: {count}</button>
```

`$state` deeply proxies arrays and objects, meaning nested property access is reactive. Use `$state.raw()` to opt out of deep reactivity for performance with large immutable data. Use `$state.snapshot()` to get a non-reactive copy of reactive state.

## $derived

`$derived` creates computed values that update automatically when their dependencies change. It is the rune replacement for `$:` derived declarations.

```svelte
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
</script>
```

Use `$derived.by()` for multi-statement computations. Derived values are read-only and synchronously computed — no stale data, no manual subscription management.

## $effect

`$effect` runs side effects in response to state changes. It is the rune replacement for `$:` side-effect statements and lifecycle-based patterns.

```svelte
<script>
  let count = $state(0)
  $effect(() => {
    console.log('Count changed to', count)
  })
</script>
```

`$effect` is **not** `componentDidMount` — it runs whenever its tracked dependencies change, not just once. Use `$effect.root()` for manual lifecycle management and `$effect.pre()` to run effects before DOM updates.

## $props

`$props` declares component inputs as a destructured object. It replaces `export let` from Svelte 4.

```svelte
<script>
  let { name, age = 18, ...rest } = $props()
</script>
```

All props are reactive by default. Default values are used when no prop is passed. Rest properties capture any additional props passed to the component.

## $bindable

`$bindable` marks a prop as eligible for two-way binding with `bind:`. By default, props are one-way (parent to child). Adding `$bindable()` to a prop declaration allows `bind:propName` on the parent side.

```svelte
<script>
  let { value = $bindable() } = $props()
</script>
```

## $inspect

`$inspect` logs reactive values for debugging, firing whenever the tracked value changes. It is a development-only tool that self-removes in production builds.

```svelte
<script>
  let count = $state(0)
  $inspect(count)
</script>
```

## $host

`$host` is used in the context of Svelte 5 custom elements. It returns the host element reference, enabling access to the custom element's DOM API.

## Fine-Grained Reactivity

Svelte 5's runes provide fine-grained reactivity at the variable level, not the component level. This means:
- Only the specific DOM nodes that depend on a reactive value update
- No virtual DOM, no diffing — direct DOM updates
- Reactive values work seamlessly across `.svelte.js`/`.svelte.ts` module boundaries
- Class instances with `$state` fields are fully reactive

## See Also
- [Svelte 5 Template Syntax](Svelte-5-Template-Syntax)
- [Svelte Context API](Svelte-Context-API) — for sharing reactive state across the component tree
- [CALM Systems Philosophy](CALM-Systems-Philosophy) — principles for using runes in maintainable apps
