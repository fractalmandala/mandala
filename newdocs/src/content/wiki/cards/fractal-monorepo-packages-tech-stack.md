---
title: Fractal Monorepo Packages — Tech Stack
description: Svelte 5 as the universal runtime peer dependency across all UI packages; Vite + @sveltejs/package for library builds; TypeScript for type generation; pnpm as the workspace package manager (declared…
tags: [packages]
type: card
module: packages
path: packages
created: 2026-08-05
updated: 2026-08-06
---

Svelte 5 as the universal runtime peer dependency across all UI packages; Vite + @sveltejs/package for library builds; TypeScript for type generation; pnpm as the workspace package manager (declared via packageManager field); ESLint + Prettier + svelte-check for quality gates; vitest for testing in most packages.
