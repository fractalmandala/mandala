---
title: Getting started
description: Install docs-kit and mount it in an existing SvelteKit application.
order: 1
---

# Getting started

Install the packages, add the Vite plugin, and mount one catch-all route.

## Install

:::tabs

@tab pnpm

```bash
pnpm add @docs-kit/core @docs-kit/theme-default
```

@tab npm

```bash
npm install @docs-kit/core @docs-kit/theme-default
```

:::

## Configure Vite

```ts title="vite.config.ts" {5}
import { sveltekit } from '@sveltejs/kit/vite';
import { docs } from '@docs-kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [docs({ content: 'src/lib/docs' }), sveltekit()] });
```

:::warning{title="Plugin order"}
The documentation plugin must come before `sveltekit()`.
:::
