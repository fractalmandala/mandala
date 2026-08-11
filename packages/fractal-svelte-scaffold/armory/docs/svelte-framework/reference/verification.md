---
title: "Verification reference"
description: "Choose checks for components, routes, styles, SSR, and plugin routing."
type: reference
---

# Verification reference

Use the strongest checks exposed by the target workspace.

## Workspace checks

1. Detect the package manager from `packageManager` and lockfiles.
2. Inspect available scripts.
3. Prefer `pnpm check` or the workspace equivalent.
4. Run targeted tests for interaction, routing, actions, data, or SSR changes.
5. Run a build for route or SSR changes when available.
6. Use direct Svelte compilation only when no workspace check exists.

## Component checks

- Svelte compile, server and client modes;
- TypeScript or `svelte-check`;
- SASS compiler;
- DOM or component interaction test;
- accessibility scan or manual keyboard review; and
- structural audit for repository-forbidden patterns.

## Plugin checks

```sh
sh packages/fractal-agentic/scripts/check-armory.sh
sh packages/fractal-agentic/scripts/verify.sh
```

The plugin gate validates the React conversion fixtures, the Svelte skill routing
manifest, and the short-prompt route cases.

## Evidence format

Every receipt records:

```text
command | cwd | purpose | status | concrete evidence
```

The final reviewer returns one verdict: `ship`, `fix-first`, or `rethink`.
