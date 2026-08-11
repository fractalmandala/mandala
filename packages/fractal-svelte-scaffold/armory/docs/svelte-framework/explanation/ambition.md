---
title: "Ambition"
description: "The long-term direction for a prompt-driven SvelteKit scaffolding system."
type: explanation
---

# Ambition

The ambition is not to generate isolated snippets. It is to make a SvelteKit project
feel like a coherent, inspectable construction system:

```text
intent
  → component or route decision
  → exact files and public API
  → accessible, tokenized implementation
  → verified behavior
  → maintainable receipt
```

## What complete looks like

A mature scaffold should provide:

- a component catalog with native and Svelte variants;
- short-prompt routing with predictable skill composition;
- reusable page, layout, loader, action, endpoint, and error patterns;
- design tokens and external SASS as first-class outputs;
- accessibility and reduced-motion defaults;
- honest dependency and SSR decisions;
- browser and workspace verification;
- receipts that let the next agent resume without rediscovering architecture; and
- optional desktop packaging when the project grows into a Tauri application.

## A useful outside example

[`agmmnn/tauri-ui`](https://github.com/agmmnn/tauri-ui) demonstrates the shape of a
complete scaffold around an app shell: a starter CLI, desktop-ready defaults, optional
batteries, debug tooling, and idempotent add/update/remove operations. Its README
describes a flow from CLI prompts through upstream UI and native setup, followed by
optional batteries and later updates.

That is a useful ambition for this framework, with a different center of gravity:

| Tauri UI scaffold idea | Svelte Framework equivalent |
| --- | --- |
| Starter CLI | Short-prompt intent router |
| Upstream frontend setup | Existing SvelteKit workspace inspection |
| Desktop-ready defaults | Svelte Boss contract and workspace conventions |
| Optional batteries | Conditional skills for a11y, motion, directives, and remote data |
| Debug panel | Receipts, route manifests, and verification evidence |
| Add/update/remove batteries | Idempotent recipe and scaffold operations |

The goal is not to copy another project's templates. It is to make the generated project
progressive: start with a button, grow into routes and data, then add a complete shell,
tests, deployment, or Tauri integration without losing the original contract.

## An illustrative complete scaffold

The following is a target shape for a project assembled over several prompts. It is an
illustrative synthesis, not a claim that these are the exact paths in `tauri-ui`:

```text
my-sveltekit-app/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   ├── Accordion/
│   │   │   └── AppShell/
│   │   ├── server/
│   │   │   └── repositories/
│   │   └── styles/
│   │       ├── tokens.sass
│   │       └── global.sass
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   ├── dashboard/
│   │   │   ├── +page.server.ts
│   │   │   └── +page.svelte
│   │   └── settings/
│   │       ├── +page.server.ts
│   │       └── +page.svelte
│   └── app.html
├── static/
├── tests/
├── .github/workflows/
├── svelte.config.js
├── vite.config.ts
└── package.json
```

For a desktop edition, the same scaffold can add `src-tauri/`, a typed command boundary,
release metadata, and a debug surface. The important property is the seam: route data,
browser-only integrations, native commands, styling, and reusable UI remain explicit
instead of being hidden inside a generated monolith. A future scaffold command could
create the baseline, while short prompts add or update each battery with a receipt.

## The boundary

Ambition must not become silent architecture. The agent should ask or record decisions
when a dependency, route boundary, deployment target, or desktop shell changes the shape
of the project.
