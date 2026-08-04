---
title: Vite Monorepo Asset Boundaries
description: Configuration pattern to allow Vite to serve files outside its project root in symlinked pnpm monorepos.
tags: [vite, pnpm, monorepo, styling]
sources:
  - 2026-08-03-monorepo-migration.md
created: 2026-08-03
updated: 2026-08-03
type: concept
boss: workflow
project: mandala
---

Under `pnpm` monorepos, shared node modules (such as variables, fonts, or assets) are often stored in the root `node_modules` and symlinked down to specific apps. By default, Vite restricts loading assets outside of the sub-project's own root for security.

## Mitigation Pattern

To resolve `403 Forbidden` / outside allow list errors, Vite's `server.fs.allow` option must be configured to include the monorepo root.

Inside `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  server: {
    fs: {
      allow: [
        // Allow serving files from the monorepo root
        path.resolve(import.meta.dirname, "../../../.."),
      ],
    },
  },
});
```

Verify that the relative parent path count (`..`) accurately resolves to the absolute root workspace folder.
