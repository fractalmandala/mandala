---
title: "Svelte Framework"
description: "User documentation for the Fractal Agentic Svelte and SvelteKit scaffolding framework."
type: guide
---

# Fractal Agentic Svelte Framework

The Svelte Framework is the short-prompt interface to Fractal Agentic's Svelte armory.
It helps developers and coding agents build Svelte 5 components, SvelteKit routes,
accessible interactions, external indented SASS, motion, and React-to-SvelteKit ports.

You can begin with a short request:

```text
Add a button.
Add a collapsible accordion.
Convert this React component to SvelteKit.
Add a dashboard route with server data.
```

The framework resolves the appropriate recipe and supporting skills, plans the exact
files, applies the Svelte Boss contract, verifies the result, and returns a receipt.

## Start here

| Goal | Read |
| --- | --- |
| Learn the workflow | [First component tutorial](./tutorials/01-first-component.md) |
| Build a component | [Component how-to](./how-to/build-components.md) |
| Convert React or Next.js | [Conversion how-to](./how-to/convert-react-to-sveltekit.md) |
| Build a route | [Route data and SSR](./how-to/choose-route-data-and-ssr.md) |
| Understand the system | [Architecture explanation](./explanation/framework-architecture.md) |
| Find exact prompts and files | [Prompt routing reference](./reference/prompt-routing.md) |
| Fix a failed result | [Troubleshooting](./how-to/troubleshoot-fix-first-results.md) |

## Documentation map

### Tutorials

- [Build your first Button](./tutorials/01-first-component.md)
- [Build your first Accordion](./tutorials/02-first-accordion.md)
- [Build your first SvelteKit route](./tutorials/03-first-sveltekit-route.md)

### How-to guides

- [Build components](./how-to/build-components.md)
- [Convert React and Next.js](./how-to/convert-react-to-sveltekit.md)
- [Choose route data and SSR boundaries](./how-to/choose-route-data-and-ssr.md)
- [Apply SASS and design tokens](./how-to/apply-sass-and-design-tokens.md)
- [Add accessibility](./how-to/add-accessibility.md)
- [Add motion](./how-to/add-motion.md)
- [Use DOM integrations](./how-to/use-dom-integrations.md)
- [Use remote functions](./how-to/use-remote-functions.md)
- [Deploy and publish](./how-to/deploy-and-publish.md)
- [Interpret receipts](./how-to/interpret-receipts.md)
- [Troubleshoot fix-first results](./how-to/troubleshoot-fix-first-results.md)

### Reference

- [Prompt routing](./reference/prompt-routing.md)
- [Recipe catalog](./reference/recipe-catalog.md)
- [Skill surfaces](./reference/skill-surfaces.md)
- [Output contract](./reference/output-contract.md)
- [Verification](./reference/verification.md)
- [Plugin layout](./reference/plugin-layout.md)
- [Commands and invocation](./reference/commands-and-invocation.md)

### Explanation

- [Framework architecture](./explanation/framework-architecture.md)
- [Ambition](./explanation/ambition.md)
- [How skill routing works](./explanation/how-skill-routing-works.md)
- [The Svelte Boss contract](./explanation/svelte-boss-contract.md)
- [Native HTML, Svelte runes, and conversion](./explanation/native-vs-runes-vs-conversion.md)
- [SSR and data boundaries](./explanation/ssr-and-data-boundaries.md)
- [Dependency fallbacks](./explanation/dependency-fallbacks.md)
- [Why skills are conditional](./explanation/why-skills-are-conditional.md)

## The shortest useful mental model

```text
short prompt
    → intent route
    → recipe and supporting skills
    → exact destination files
    → implementation
    → workspace verification
    → ship | fix-first | rethink receipt
```

The framework is not a replacement for SvelteKit. It is an agent-facing construction
layer that makes SvelteKit conventions repeatable and reviewable.
