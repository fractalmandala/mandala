---
title: Svelte CLI and Project Setup
description: Setting up Svelte and SvelteKit projects — the sv CLI, project types, project structure, web standards integration, and SvelteKit API reference for @sveltejs/kit packages, CLI, and configuration.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - sveltekit
  - cli
  - project-setup
  - tooling
  - vite
sources:
  - svelteDocs-02-creating-a-project
  - svelteDocs-03-project-types
  - svelteDocs-05-project-structure
  - svelteDocs-06-web-standards
  - svelteDocs-46-@sveltejs-kit
  - svelteDocs-47-@sveltejs-kit-hooks
  - svelteDocs-48-@sveltejs-kit-node-polyfills
  - svelteDocs-49-@sveltejs-kit-node
  - svelteDocs-50-@sveltejs-kit-vite
  - svelteDocs-61-cli
  - svelteKitDocs-59-svelte-compiler
  - SvelteKit-Reference
related:
  - SvelteKit-Page-Options
  - SvelteKit-Environment-Modules
  - SvelteKit-Adapters-Deployment
  - Svelte-5-Runes
timestamp: 2026-06-21
source: Wiki repo
---

Creating and configuring Svelte/SvelteKit projects, understanding project types, structure, and the underlying toolchain.

## Creating a Project

Use the `sv` CLI to create a new SvelteKit project:

```sh
npx sv create my-app
cd my-app
npm install
npm run dev
```

The CLI interactively prompts for:
- Project type (demo app, skeleton, or library)
- TypeScript support
- ESLint, Prettier configuration
- Testing framework (Vitest, Playwright)

## Project Types

- **Demo app:** A fully featured starter with examples
- **Skeleton:** Minimal starting point
- **Library:** For creating and publishing Svelte component libraries

## Project Structure

```
my-app/
  src/
    lib/       — Reusable components and modules
    params/    — Route parameter matchers
    routes/    — Application routes (filesystem router)
    app.html   — HTML shell template
    error.html — Fallback error page
    hooks.client.js / hooks.server.js
  static/      — Static assets served at root
  tests/       — End-to-end tests
  svelte.config.js
  vite.config.js
```

## Web Standards

SvelteKit is built on web standards:

- **Request / Response:** Load functions and hooks use standard `Request` and `Response` objects
- **Fetch API:** SvelteKit provides a server-side `fetch` compatible with the browser `fetch` API
- **FormData:** Form submissions use standard `FormData`
- **Streams:** Response streaming uses the `ReadableStream` API
- **URL:** URL parsing uses the standard `URL` API

## @sveltejs/kit Package

The main `@sveltejs/kit` package exports:

- `error()` — Create expected errors
- `redirect()` — Create redirects
- `json()` — Return JSON responses
- `text()` — Return text responses

### Sub-packages

- **`@sveltejs/kit/hooks`** — `sequence()` for composing multiple handle functions
- **`@sveltejs/kit/node`** — Node.js-specific utilities for adapter-node
- **`@sveltejs/kit/node/polyfills`** — Polyfills for Node.js environments lacking standard APIs
- **`@sveltejs/kit/vite`** — Vite plugin for SvelteKit

## CLI

The `sv` CLI provides commands for:

- `sv create` — Create new projects
- `sv migrate` — Run migration scripts (Svelte 4→5, SvelteKit 1→2)
- `sv add` — Add integrations (Tailwind, ESLint, etc.)
- `sv check` — Type checking via `svelte-check`

## Compiler

The Svelte compiler transforms `.svelte` files into JavaScript and CSS. It handles:

- Template compilation (control flow, event handlers, bindings)
- Scoped CSS generation
- Rune transformation ($state, $derived, etc.)
- Optimizations (tree-shaking, static analysis)

## See Also
- [SvelteKit Page Options](SvelteKit-Page-Options) — project configuration via svelte.config.js
- [SvelteKit Environment and Modules](SvelteKit-Environment-Modules) — the $lib alias and module boundaries
- [Svelte 5 Runes](Svelte-5-Runes) — the reactivity model the compiler enables
- [SvelteKit Adapters and Deployment](SvelteKit-Adapters-Deployment) — adapting built apps for deployment
