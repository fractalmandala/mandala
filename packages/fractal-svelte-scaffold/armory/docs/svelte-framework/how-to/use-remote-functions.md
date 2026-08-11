---
title: "Use remote functions"
description: "Use SvelteKit remote functions only when the project explicitly opts into them."
type: how-to
---

# Use remote functions

Remote functions provide typed server communication through `.remote.ts` files and
`query`, `form`, `command`, or `prerender`. They are an experimental SvelteKit surface,
so do not introduce them merely because a page has data.

The [official SvelteKit documentation](https://svelte.dev/docs/kit/remote-functions)
requires opt-in configuration for `kit.experimental.remoteFunctions` and
`compilerOptions.experimental.async` when using component `await`.

## Use the regular route model first

Prefer `+page.server.ts`, `+page.ts`, form actions, and `+server.ts` when they express
the behavior clearly. Choose remote functions when the target app already enables them
or the user explicitly asks for the remote-function model.

## Verify the boundary

- validate arguments with a standard schema;
- keep server-only imports on the server;
- document `devalue`-compatible return values;
- test refresh/invalidation behavior; and
- record the experimental configuration change.
