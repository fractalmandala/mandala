---
title: "Skill surfaces"
description: "Reference the skills that compose the Svelte framework."
type: reference
---

# Skill surfaces

The framework keeps one entry skill and activates supporting skills by intent.

| Surface | Primary skill | Use when |
| --- | --- | --- |
| Builder | `agentic-svelte-builder` | Component or native HTML request |
| Conversion | `react-to-sveltekit` | React or Next.js source |
| Runes | `svelte-runes` | `$state`, `$derived`, `$effect`, `$props`, `$bindable` |
| Component API | `svelte-components-patterns` | Snippets, callback props, context, dynamic components |
| Styling | `svelte-styling-patterns` | External SASS and semantic tokens |
| Accessibility | `frontend-a11y` | Interactive components and forms |
| Route data | `sveltekit-data-flow` | Loads, actions, invalidation, serialization |
| Route architecture | `sveltekit-architecture` | Layouts, SSR, errors, route composition |
| Structure | `sveltekit-structure` | File paths, layouts, boundaries, hydration |
| Directives | `svelte-template-directives` | `@attach`, `{@html}`, `{@render}`, DOM integrations |
| CSS conversion | `css-to-sass` | CSS/SCSS input |
| Motion policy | `motion-ui` | Motion tiers, reduced motion, cleanup |
| Motion foundations | `motion-foundations` | Motion engine and SSR-safe primitives |
| Motion recipes | `motion-patterns` | Common UI motion |
| Advanced motion | `motion-advanced` | Drag, pan, SVG, imperative animation |
| Remote data | `sveltekit-remote-functions` | Explicit experimental remote functions |
| Deployment | `svelte-deployment` and `vite-patterns` | Adapters, builds, packages, deployment |
| Visual QA | `svelte-style-canvas` | Style forensics and interactive preview |

`svelte-5-runes`, `svelte-styling`, and the three SvelteKit overview skills remain useful
supporting references, but the routing matrix prevents redundant activation or generic
guidance from overriding the local Svelte Boss contract.
