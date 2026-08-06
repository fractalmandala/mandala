---
title: Svelte Built-in Components
description: Special <svelte:*> elements in Svelte 5 that provide framework-level integration with the browser and document — window, body, head, document, element, boundary, options, and more.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - svelte-5
  - built-in-components
  - svelte-elements
sources:
  - sveltewindow-Svelte-5
  - sveltebody-Svelte-5-Reference
  - sveltehead-Svelte-5-Reference
  - sveltedocument-Svelte-5
  - svelteelement-Svelte-5
  - svelteboundary-Svelte-5
  - svelteoptions-Svelte-5
  - svelteKitDocs-36-svelte-boundary
  - svelteKitDocs-37-svelte-window
  - svelteKitDocs-38-svelte-document
  - svelteKitDocs-39-svelte-body
  - svelteKitDocs-40-svelte-head
  - svelteKitDocs-41-svelte-element
  - svelteKitDocs-42-svelte-options
  - svelteKitDocs-46-imperative-component-api
  - svelteKitDocs-47-hydratable
related:
  - Svelte-5-Template-Syntax
  - Svelte-5-Template-Directives
timestamp: 2026-06-21
source: Wiki repo
---

Svelte provides several built-in components (prefixed with `svelte:`) that give declarative access to browser APIs and framework behavior.

## `<svelte:window>`

Binds to the global `window` object. Use it to listen to events and bind to window properties like `scrollY`, `innerWidth`, `online`, etc.

```svelte
<svelte:window bind:scrollY={y} on:keydown={handleKey} />
```

## `<svelte:body>`

Binds to `document.body`. Useful for global event listeners that should trigger anywhere on the page.

```svelte
<svelte:body on:mouseleave={handleMouseLeave} />
```

## `<svelte:document>`

Binds to the `document` object. Similar to `<svelte:window>` but scoped to document-level events.

```svelte
<svelte:document on:visibilitychange={handleVisibility} />
```

## `<svelte:head>`

Injects elements into the document `<head>`. Useful for setting page title, meta tags, and links.

```svelte
<svelte:head>
  <title>My Page</title>
  <meta name="description" content="..." />
</svelte:head>
```

In SvelteKit, use the `title` and `meta` exports from load functions or the `$page` store for SEO-friendly head management.

## `<svelte:element>`

Renders a dynamic HTML element. The tag name is determined at runtime.

```svelte
<svelte:element this={tagName}>Content</svelte:element>
```

## `<svelte:boundary>`

Error boundary that catches render errors in its children and displays a fallback UI.

```svelte
<svelte:boundary onerror={handleError}>
  <ChildComponent />
</svelte:boundary>
```

The `onerror` callback receives the error and a `reset` function to retry rendering.

## `<svelte:options>`

Sets compiler options for a component. In Svelte 5, common options include `runes` (to enable/disable runes mode) and `immutable` (for performance optimization).

```svelte
<svelte:options runes={true} />
```

## Imperative Component API

Svelte 5 provides `mount()` and `unmount()` for creating and destroying components imperatively from JavaScript, useful for dynamic rendering scenarios outside the template.

## Hydratable

The `hydratable` option enables server-side rendered components to be hydrated on the client, preserving existing DOM nodes rather than replacing them.

## See Also
- [Svelte 5 Template Syntax](Svelte-5-Template-Syntax) — control flow and template tags
- [SvelteKit Routing](SvelteKit-Routing) — where `<svelte:head>` is used for page metadata
