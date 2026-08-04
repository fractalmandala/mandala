---
title: Svelte Styling and CSS
description: Svelte 5 styling features — scoped CSS, global styles, CSS custom properties, dynamic class and inline style binding, nested style elements.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - svelte-5
  - css
  - styling
  - scoped-styles
  - design-systems
sources:
  - Scoped-CSS-Svelte-5-Reference
  - Global-Styles-Svelte-5-Reference
  - CSS-Custom-Properties-Svelte-5
  - Dynamic-Class-Binding-Svelte-5
  - Dynamic-Inline-Styles-Svelte-5
  - svelteKitDocs-32-scoped-styles
  - svelteKitDocs-33-global-styles
  - svelteKitDocs-34-custom-properties
  - svelteKitDocs-35-nested-style-elements
related:
  - Svelte-5-Template-Directives
  - Svelte-Built-in-Components
timestamp: 2026-06-21
source: Wiki repo
---

Svelte 5 provides a comprehensive styling system built on scoped CSS by default, with escape hatches for global styles, dynamic styling via reactive bindings, and CSS custom property integration.

## Scoped CSS

By default, `<style>` blocks in `.svelte` files are scoped to the component. The compiler adds a unique class to each element and rewrites selectors to include that class, preventing style leaks between components.

```svelte
<style>
  p { color: blue; }
</style>
```

The compiler transforms `p` to `p.svelte-xyz` internally.

## Global Styles

Use the `:global()` modifier to opt out of scoping for specific selectors:

```svelte
<style>
  :global(body) { margin: 0; }
  .card :global(h2) { font-size: 1.5em; }
</style>
```

## CSS Custom Properties

Svelte 5 allows setting CSS custom properties on components, which flow through the component boundary and can be used in child component styles. This enables theme customization without breaking style encapsulation.

```svelte
<Component --theme-color={primaryColor} />
```

In the child component:
```svelte
<style>
  div { color: var(--theme-color); }
</style>
```

## Dynamic Class Binding

Use the `class` attribute with an object, string, or array, or use the `class:` directive for boolean toggling:

```svelte
<div class:active={isActive} class="base" />
<div class={{ active: isActive, disabled: !enabled }} />
```

## Dynamic Inline Styles

Set styles reactively using the `style` attribute with an object or the `style:` directive:

```svelte
<div style:color={textColor} style:background-color={bgColor} />
<div style={{ color: textColor, backgroundColor: bgColor }} />
```

## Nested Style Elements

Svelte 5 supports nested `<style>` tags within components for scoping at different levels or conditional styling based on component state.

## See Also
- [Svelte 5 Template Directives](Svelte-5-Template-Directives) — class:, style:, and bind: directives
- [Svelte Context API](Svelte-Context-API) — for theme systems and design tokens
