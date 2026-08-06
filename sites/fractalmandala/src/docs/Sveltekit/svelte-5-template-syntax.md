---
title: Svelte 5 Template Syntax
description: Svelte 5 template blocks ({#if}, {#each}, {#key}, {#await}, {#snippet}) and tags ({@render}, {@html}, {@attach}, {@const}, {@debug}) for declarative UI logic.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - svelte-5
  - template-syntax
  - snippets
  - control-flow
sources:
  - if-Svelte-5-Reference
  - each-...-Svelte-5-Reference
  - key-...-Svelte-5-Reference
  - await-Svelte-5-Reference
  - snippet-...-Svelte-5-Reference
  - atrender-Svelte-5-Reference
  - athtml-Svelte-5-Reference
  - atattach-Svelte-5-Reference
  - atconst-Svelte-5-Reference
  - atdebug-Svelte-5-Reference
  - svelteKitDocs-13-basic-markup
  - svelteKitDocs-14-if
  - svelteKitDocs-15-each
  - svelteKitDocs-16-key
  - svelteKitDocs-17-await
  - svelteKitDocs-18-snippet
  - svelteKitDocs-19-@render
  - svelteKitDocs-20-@html
  - svelteKitDocs-21-@attach
  - svelteKitDocs-22-@const
  - svelteKitDocs-23-@debug
  - svelteKitDocs-31-await-expressions
related:
  - Svelte-5-Runes
  - Svelte-5-Template-Directives
  - Svelte-Built-in-Components
timestamp: 2026-06-21
source: Wiki repo
---

Svelte 5 uses a template syntax that blends HTML with declarative control-flow blocks and special tags. These constructs allow conditional rendering, iteration, asynchronous handling, and reusable template fragments.

## Control Flow Blocks

### `{#if}`

Conditionally renders content based on a JavaScript expression.

```svelte
{#if condition}
  <p>Condition is truthy</p>
{:else if other}
  <p>Other is truthy</p>
{:else}
  <p>Neither is truthy</p>
{/if}
```

### `{#each}`

Iterates over arrays and iterables.

```svelte
{#each items as item, index (key)}
  <p>{index}: {item.name}</p>
{/each}
```

The `(key)` expression provides a stable identity for each item, enabling efficient DOM updates on reorder. Use `{:else}` for the empty-state fallback.

### `{#key}`

Forces a DOM element or component to be destroyed and recreated when the key expression changes.

```svelte
{#key value}
  <ExpensiveComponent data={value} />
{/key}
```

### `{#await}`

Handles promise states declaratively — pending, resolved, and rejected.

```svelte
{#await promise}
  <p>Loading...</p>
{:then value}
  <p>Resolved: {value}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

For promises in load functions, SvelteKit also supports [streaming data](SvelteKit-Data-Loading) with top-level await expressions in components.

### `{#snippet}` and `{@render}`

Snippets are reusable template fragments that can be passed as props. They replace slots from Svelte 4.

```svelte
{#snippet mySnippet(data)}
  <p>Rendered: {data}</p>
{/snippet}

{@render mySnippet("hello")}
```

Snippets can be passed to child components as props, enabling flexible composition patterns. Children render snippets with `{@render children?.()}` or `{@render namedSnippet(data)}`.

## Template Tags

### `{@html}`

Renders a string as raw HTML. **Caution:** does not sanitize — ensure the content is trusted.

```svelte
{@html contentString}
```

### `{@debug}`

Opens a debugger breakpoint when the surrounding state changes. Only active in development mode.

```svelte
{@debug variable}
```

### `{@const}`

Defines a local constant within a block scope.

```svelte
{#each items as item}
  {@const total = item.price * item.quantity}
  <p>{total}</p>
{/each}
```

### Await Expressions

Svelte 5 introduces `{% await expression %}` — top-level await expressions that work in `.svelte` components for simpler async data access.

## See Also
- [Svelte 5 Template Directives](Svelte-5-Template-Directives) — bind:, class:, style:, use:, transition:, animate:
- [Svelte 5 Runes](Svelte-5-Runes) — the reactive primitives behind template logic
- [Svelte Built-in Components](Svelte-Built-in-Components) — special elements with framework integration
