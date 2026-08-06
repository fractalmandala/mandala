---
title: Svelte 5 Template Directives
description: "Directive-based bindings in Svelte 5 templates — bind:, class:, style:, use:, transition:, animate:, in:, out: — for reactive DOM integration."
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - svelte-5
  - template-syntax
  - directives
  - bindings
  - transitions
  - actions
sources:
  - bind-Svelte-5-Reference
  - class-Svelte-5-Reference
  - svelteKitDocs-24-bind
  - svelteKitDocs-25-use
  - svelteKitDocs-26-transition
  - svelteKitDocs-27-in-and-out
  - svelteKitDocs-28-animate
  - svelteKitDocs-29-style
  - svelteKitDocs-30-class
  - Dynamic-Class-Binding-Svelte-5
  - Dynamic-Inline-Styles-Svelte-5
related:
  - Svelte-5-Template-Syntax
  - Svelte-5-Runes
  - Svelte-Styling-CSS
  - Svelte-Built-in-Modules
timestamp: 2026-06-21
source: Wiki repo
---

Svelte 5 provides a set of directive-based bindings for integrating reactivity with DOM elements. Directives are colon-prefixed attributes on HTML elements.

## bind: — Two-Way Binding

The `bind:` directive creates two-way data bindings between component state and DOM element properties.

```svelte
<input bind:value={name} />
<input type="checkbox" bind:checked={active} />
<select bind:value={selection}>
  <option value="a">A</option>
  <option value="b">B</option>
</select>
```

Svelte supports bindings for: `value`, `checked`, `group`, `files`, `innerText`, `innerHTML`, `textContent`, `this` (element reference), and dimensional properties (`clientWidth`, `clientHeight`, `offsetWidth`, `offsetHeight`, `scrollX`, `scrollY`). Component bindings require the child to declare a prop with `$bindable()`.

## class: — Class Binding

The `class:` directive toggles a CSS class based on a boolean expression.

```svelte
<button class:active={isActive} class:disabled={!enabled}>
```

For dynamic class names, use the `class` attribute with an object or string expression.

## style: — Style Binding

The `style:` directive sets individual CSS properties reactively. Svelte 5 also supports CSS custom properties directly.

```svelte
<div style:color={textColor} style:--theme-color={primary}>
```

## use: — Actions

Actions are functions that run when an element is mounted, receiving the element and optional parameters. They return lifecycle methods (`destroy`, `update`).

```svelte
<script>
  function myAction(node, params) { /* ... */ }
</script>
<div use:myAction={params}>
```

Actions are ideal for integrating third-party libraries, managing focus, and DOM measurements.

## transition:, in:, out:, animate: — Motion

Svelte 5 provides built-in transition and animation directives:

- `transition:name` — runs both in and out transitions
- `in:name` / `out:name` — directional enter/leave animations
- `animate:name` — FLIP animation for list reordering

```svelte
{#if visible}
  <p transition:fade={{ duration: 300 }}>Hello</p>
{/if}
```

Built-in transitions: `fade`, `slide`, `scale`, `draw`, `fly`, `blur`, `crossfade`. Custom transitions can be created as functions returning CSS keyframes.

## See Also
- [Svelte 5 Template Syntax](Svelte-5-Template-Syntax) — control flow blocks and template tags
- [Svelte Built-in Modules](Svelte-Built-in-Modules) — svelte/transition, svelte/animate, svelte/action
- [Svelte Motion](Svelte-Motion) — advanced animation library for Svelte 5
