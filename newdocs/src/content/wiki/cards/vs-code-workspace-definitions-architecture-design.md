---
title: VS Code Workspace Definitions — Architecture Design
description: Each .code-workspace file is a standalone VS Code workspace manifest declaring a single root folder via relative ../ paths to sibling directories under apps/, sites/, or packages/. There is no shared…
tags: [ide_workspaces]
type: card
module: ide_workspaces
path: ide_workspaces
created: 2026-08-05
updated: 2026-08-06
---

Each `.code-workspace` file is a standalone VS Code workspace manifest declaring a single root folder via relative `../` paths to sibling directories under `apps/`, `sites/`, or `packages/`. There is no shared configuration — each workspace is self-contained with its own `folders` array and optional per-workspace `settings` (e.g., `svelte.enable-ts-plugin` in `fractalknow.code-workspace`. The module contains no source code; it exists purely as developer convenience to open focused IDE sessions per project without navigating the full monorepo tree.
