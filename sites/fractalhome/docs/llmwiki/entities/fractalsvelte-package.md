---
title: Fractalsvelte Package
description: Published Svelte component package with export subpaths like fractalsvelte/sidebar.
tags: ['fractalsvelte', 'package', 'exports']
sources: [2026-08-01-210000-fractalsvelte-exports-and-vercel.md]
created: 2026-08-02
updated: 2026-08-02
type: entity
---

Monorepo package `fractalsvelte` published with `package.json` exports (e.g. `./sidebar`). Consumers need modern TypeScript `moduleResolution` (`bundler`/`nodenext`). Docs content must escape `</script>` inside template literals for Vite/Svelte compile. Related: [[SvelteKit Development]], [[Frontend Interaction Patterns]].
