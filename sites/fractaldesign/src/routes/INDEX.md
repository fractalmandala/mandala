---
title: Svelte 5 & SvelteKit Knowledge Bank
description: Wiki covering Svelte 5 runes, template syntax, built-in components, Context API, CALM Systems philosophy, and comprehensive SvelteKit documentation including routing, data loading, forms, adapters, authentication, and more.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - sveltekit
  - runes
  - reactivity
  - web-framework
sources:
  - raw/10-sveltekit
related:
  - Svelte-5-Runes
  - Svelte-5-Template-Syntax
  - Svelte-Context-API
  - CALM-Systems-Philosophy
  - SvelteKit-Routing
  - SvelteKit-Data-Loading
  - SvelteKit-Form-Actions
  - SvelteKit-Adapters-Deployment
  - Svelte-Motion
timestamp: 2026-06-21
source: Wiki repo
---

## Topic Map

### Svelte 5 Fundamentals

| Topic | Description |
|---|---|
| [Svelte 5 Runes](Svelte-5-Runes) | The five core runes: $state, $derived, $effect, $props, $bindable plus $inspect and $host |
| [Svelte 5 Template Syntax](Svelte-5-Template-Syntax) | Template blocks ({#if}, {#each}, {#key}, {#await}, {#snippet}) and tags ({@render}, {@html}, {@attach}, {@const}, {@debug}) |
| [Svelte 5 Template Directives](Svelte-5-Template-Directives) | bind:, class:, style:, use:, transition:, animate:, in:, out: directives |
| [Svelte Built-in Components](Svelte-Built-in-Components) | <svelte:window>, <svelte:body>, <svelte:head>, <svelte:element>, <svelte:boundary>, <svelte:options>, <svelte:document> |
| [Svelte Styling and CSS](Svelte-Styling-CSS) | Scoped CSS, global styles, CSS custom properties, dynamic class and inline style binding |
| [Svelte Context API](Svelte-Context-API) | Complete guide: providing/consuming context, reactive patterns, advanced patterns, practical examples |
| [CALM Systems Philosophy](CALM-Systems-Philosophy) | The CALM principles: Contained, Automatic, Local, Minimal — a mental model for maintainable Svelte 5 apps |
| [Svelte Legacy Patterns](Svelte-Legacy-Patterns) | Svelte 4 legacy patterns: let, reactive assignments, export let, $$props, slots, on:event, and migration concerns |
| [Svelte Built-in Modules](Svelte-Built-in-Modules) | svelte/store, svelte/motion, svelte/transition, svelte/animate, svelte/easing, svelte/action, compiler errors, runtime warnings |
| [Svelte Migration Guides](Svelte-Migration-Guides) | Migration from Svelte 4 to 5, and SvelteKit 1 to 2 |

### SvelteKit Core

| Topic | Description |
|---|---|
| [SvelteKit Routing](SvelteKit-Routing) | Filesystem-based routing, +page, +layout, +server, route parameters, advanced patterns |
| [SvelteKit Data Loading](SvelteKit-Data-Loading) | Load functions (universal, server, page, layout), fetch, streaming, parallel loading, invalidation |
| [SvelteKit Form Actions](SvelteKit-Form-Actions) | Forms, progressive enhancement, error handling, redirects, validation |
| [SvelteKit Page Options](SvelteKit-Page-Options) | prerender, ssr, csr, trailingSlash, configuration, project structure |
| [SvelteKit Hooks and Server Runtime](SvelteKit-Hooks-Server) | hooks.server.ts, hooks.client.ts, handle, handleFetch, handleError, locals |
| [SvelteKit Navigation](SvelteKit-Navigation) | Client-side navigation, preloading, link options, shallow routing, prefetching |
| [SvelteKit Error Handling](SvelteKit-Error-Handling) | Error pages, error boundaries, structured error handling patterns |

### SvelteKit Advanced

| Topic | Description |
|---|---|
| [SvelteKit Authentication](SvelteKit-Authentication) | Auth patterns: session cookies, OAuth, JWT, Lucia, authentication architecture |
| [SvelteKit TypeScript](SvelteKit-TypeScript) | Type safety, $types, app.d.ts, TypeScript configuration, typed load functions |
| [SvelteKit Adapters and Deployment](SvelteKit-Adapters-Deployment) | Deployment adapters for Node, Vercel, Netlify, Cloudflare, static sites, writing custom adapters |
| [SvelteKit Environment and Modules](SvelteKit-Environment-Modules) | $env/static/*, $env/dynamic/*, $lib, $service-worker, server-only modules |
| [SvelteKit Advanced Features](SvelteKit-Advanced-Features) | Performance, SEO, accessibility, images, icons, observability, packaging, debugging, integrations |

### Libraries & Resources

| Topic | Description |
|---|---|
| [Svelte Motion](Svelte-Motion) | Animation library: motion component, hooks (useAnimate, useScroll, useSpring, etc.), AnimatePresence, variants, layout animations, gestures |
| [Integrations and Email](Integrations-Email) | Nodemailer, email templates, ad campaigns, third-party integrations |
| [Hackpile Practical Guides](Hackpile-Practical-Guides) | Real-world Svelte app building guides and practical tutorials |
| [Svelte CLI and Project Setup](Svelte-CLI-and-Project-Setup) | Creating projects, the sv CLI, project types, project structure, web standards |

## Cross-Bank Connections

- [Svelte Runes & Reactivity](/wiki/06-karmic-streams/INDEX.md) — Reactive programming concepts
- [State Management](/wiki/06-karmic-streams/INDEX.md) — Broader state management patterns
