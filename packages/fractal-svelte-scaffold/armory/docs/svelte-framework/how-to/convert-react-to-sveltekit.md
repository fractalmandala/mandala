---
title: "Convert React or Next.js to SvelteKit"
description: "Use the conversion contract to port components and pages without losing route or SSR decisions."
type: how-to
---

# Convert React or Next.js to SvelteKit

Give the agent the source file or source snippet and a short request:

```text
Convert this React component to an idiomatic Svelte 5 component in this project.
Preserve the public API and run the Svelte checks.
```

For a Next page:

```text
Convert this Next page to the /dashboard SvelteKit route. Preserve server data loading
and document the SSR boundary.
```

## What the agent must decide

1. Source kind: `component`, `route-component`, or `page`.
2. Animation tier: none, Framer Motion, GSAP, CSS/timer, or Canvas/WebGL.
3. Exact destination files.
4. `+page.ts`, `+page.server.ts`, `+layout.*`, or `+server.ts` boundary.
5. Browser-only APIs and SSR mode.
6. Dependency availability and honest fallbacks.
7. Adaptive verification commands.

## Output contract

Every conversion emits a JSON artifact manifest. Read the [output contract reference](../reference/output-contract.md)
for the required fields and examples.

The manifest is a receipt, not a file that should be written into the destination app
unless you explicitly request that. A complete conversion needs concrete verification
evidence; otherwise use `partial` or `blocked`.

## Conversion rules

| React | Svelte 5 |
| --- | --- |
| `useState` | `$state` |
| `useMemo` | `$derived` |
| `useEffect` | `$effect` with cleanup when needed |
| `onClick` | `onclick` |
| JSX conditionals | `{#if}` blocks |
| `.map()` | keyed `{#each}` blocks |
| slots/children | typed `Snippet` and `{@render}` |

The Svelte 5 prop and binding model is documented in [Svelte's `$props` reference](https://svelte.dev/docs/svelte/$props).

## Review the result

Check the real target files, not only the agent's receipt. A receipt is a claim; the
primary session owns re-verification.
