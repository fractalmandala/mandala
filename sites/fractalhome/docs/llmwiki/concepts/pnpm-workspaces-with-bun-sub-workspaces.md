---
title: Pnpm Workspaces with Bun Sub-workspaces
description: Guidelines for isolating Bun-managed projects within a primary pnpm monorepo workspace.
tags: [pnpm, bun, monorepo, configuration]
sources:
  - 2026-08-03-monorepo-migration.md
created: 2026-08-03
updated: 2026-08-03
type: concept
boss: workflow
project: mandala
---

When building a hybrid monorepo, some sub-applications may utilize Bun's native workspace capabilities and dependency definitions (e.g. `catalog:` formats in `package.json`). Integrating them directly in the root `pnpm-workspace.yaml` will trigger resolution failures if pnpm catalog syntax conflicts with Bun.

## Resolution Rules

1. **Workspace Exclusion**: Exclude the Bun subdirectory in the root `pnpm-workspace.yaml` using a negation pattern:
   ```yaml
   packages:
     - apps/*
     - '!apps/fractalai'
   ```
2. **Lockfile Integrity**: Preserve `bun.lock` (or `bun.lockb`) inside the sub-workspace, and run installations independently for the Bun packages.
3. **NPMRC Configuration**: For transitive modules relying on raw URL resolutions, verify `block-exotic-subdeps=false` is configured in local `.npmrc` files if using modern pnpm workspace structures.
