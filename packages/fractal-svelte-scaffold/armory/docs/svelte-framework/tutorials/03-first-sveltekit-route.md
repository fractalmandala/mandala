---
title: "Build your first SvelteKit route"
description: "Create a server-loaded SvelteKit page with the framework."
type: tutorial
---

# Build your first SvelteKit route

This tutorial adds a `/dashboard` page with server-owned data and client-only display
state.

## 1. Ask for a route

```text
Add a /dashboard route that loads the current user's name and project statistics on the
server, then lets the user show or hide the fetch timestamp.
```

## 2. Expected route files

The agent should plan:

```text
src/routes/dashboard/+page.server.ts
src/routes/dashboard/+page.svelte
```

Because the data is server-owned, the loader belongs in `+page.server.ts`. A page that
uses only public universal data may instead use `+page.ts`.

## 3. Verify the boundary

The server load should return serializable data. The page should receive that data as
`data`, while the show/hide flag stays in `$state` inside `+page.svelte`.

Run the workspace `check` script and a build when available. If the fixture has no
workspace scripts, record component-level compilation and the skipped commands rather
than pretending a full build ran.

## 4. Continue

Use [Choose route data and SSR boundaries](../how-to/choose-route-data-and-ssr.md) when
the route needs actions, APIs, layouts, auth, or browser-only behavior.
