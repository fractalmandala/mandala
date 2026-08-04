---
title: Svelte Context API
description: Complete guide to Svelte 5's Context API — providing and consuming context, reactive patterns, class-based context, practical examples, and comparison with other patterns.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - svelte-5
  - context-api
  - state-management
  - dependency-injection
  - component-architecture
sources:
  - What-is-the-Context-API-Context
  - Context-API-Introduction-Context
  - Providing-Context-Context-API
  - Consuming-Context-Context-API
  - Making-Context-Reactive-The
  - Reactive-Context-Patterns-Context
  - Designing-Context-APIs-Context
  - Context-Scope-and-Flow-Context-API
  - Context-as-a-Feature-Boundary
  - Class-Based-Context-in-Svelte-5
  - Context-Performance-and-Stability
  - Context-Pitfalls-and-Debugging
  - Context-Practices-The-Complete
  - Context-vs-Other-Patterns-Complete
  - Updating-Shared-State-Through
  - Compound-Components-with-Context
  - Theme-Systems-with-Context-Svelte
  - Shopping-Cart-with-Context
  - Multi-Step-Form-Wizard-with-Context
  - Multi-Tenant-SaaS-with-Context-API
  - Dynamic-Theme-Customization-at
  - svelteKitDocs-44-context
related:
  - Svelte-5-Runes
  - CALM-Systems-Philosophy
  - Svelte-Built-in-Modules
timestamp: 2026-06-21
source: Wiki repo
---

The Context API solves prop drilling by letting a parent component broadcast data that any descendant can receive directly, no matter how deeply nested.

## Core API

Two functions from `svelte`:

- **`setContext(key, value)`** — called in a component's setup to provide a value to descendants
- **`getContext(key)`** — called in any descendant to retrieve the value

```svelte
<!-- Provider.svelte -->
<script>
  import { setContext } from 'svelte'
  setContext('user', { name: 'Alice', role: 'admin' })
</script>

<!-- Consumer.svelte (deeply nested) -->
<script>
  import { getContext } from 'svelte'
  const user = getContext('user')
</script>
<p>Welcome, {user.name}</p>
```

## Reactive Context

Context values can be reactive when they are derived from `$state` runes or reactive class instances.

```svelte
<script>
  import { setContext } from 'svelte'
  let theme = $state({ mode: 'dark' })
  setContext('theme', theme)
</script>
```

Child components can not only read but also update shared reactive state through context, enabling collaborative state management without prop drilling.

## Class-Based Context

Encapsulate context logic in TypeScript classes for type safety and encapsulation. This pattern is especially useful for library authors and multi-instance contexts.

```typescript
// user-context.ts
export class UserContext {
  user = $state(null)
  permissions = $derived(/* ... */)
  login = (credentials) => { /* ... */ }
}
```

## Key Patterns

- **Key scoping:** Use symbols or unique strings as context keys to prevent collisions
- **Multiple contexts:** Components can provide and consume many independent contexts
- **Context as feature boundary:** Encapsulate related functionality behind well-defined context interfaces
- **Early/late context access:** Context must be set during component initialization. Access can happen at any time.

## Use Cases

- **Authentication:** Provide current user and auth methods throughout the tree
- **Theming:** Make theme values available without prop drilling
- **Form state:** Share form data and validation across form fields
- **Multi-step wizards:** Track wizard state across steps
- **Shopping cart:** Share cart state across product listings, cart icon, and checkout
- **Multi-tenant SaaS:** Provide tenant configuration per subtree
- **Compound components:** Coordinate state among related components (tabs, accordions, dropdowns)

## Context vs Other Patterns

| Pattern | Use Case |
|---|---|
| **$state + props** | Local component state, parent-to-child data |
| **Context API** | Ancestor-to-descendant data, no prop drilling |
| **Stores** | Global app state accessed anywhere |

In the CALM philosophy, stores should be a last resort — prefer local state first, context for shared subtrees, and only global stores for truly global state.

## Performance & Pitfalls

- Context lookups are fast but not free; avoid creating context in hot render paths
- Reactive context values are deeply proxied — large objects should be split into smaller contexts
- Debugging context issues requires checking the full component ancestry chain
- Context values survive component re-renders (no remounting needed)

## See Also
- [Svelte 5 Runes](Svelte-5-Runes) — the reactivity foundation for context values
- [CALM Systems Philosophy](CALM-Systems-Philosophy) — principles on state locality and containment
- [Svelte Built-in Modules](Svelte-Built-in-Modules) — for store-based alternatives
