---
id: annotations
title: Shared Annotations Area
type: area
tags: [annotations, collaboration, sqlite, agentation, dev-server]
summary: Project-local visual feedback captured by Svelte Agentation and shared through SQLite-backed native and development transports.
relates_to: [ADR-004, ADR-027, ADR-028, ipc-and-data-layer, shell-and-routes]
updated: 2026-07-19
---

# Shared Annotations Area

## Purpose

The annotations module makes visual feedback durable and visible to every app instance using the same project. It receives Svelte Agentation lifecycle snapshots in `+layout.svelte`, preserves their source-aware selector, page, position, and comment data, and renders a lightweight shared pin overlay.

## Persistence and transport

- In the native desktop app, `src-tauri/src/annotations.rs` owns `<project>/.fractal/annotations.db`. The commands are exposed only through `src/lib/ipc.ts` and protected by the existing authorized-project-root boundary.
- In `pnpm dev`, `vite.config.ts` mounts `/__fractal/annotations`, backed by the same project-local SQLite file. This relay lets ordinary browser tabs share feedback without a Tauri event bridge. The browser mock falls back to memory only when that development endpoint is unavailable.
- The frontend polls once per second. This is deliberately a simple first transport; a future WebSocket layer can replace polling without changing records or capture callbacks.

## Interaction boundary

`SharedAnnotationOverlay.svelte` only displays persisted feedback. Creating, editing, and deleting feedback remains Agentation's responsibility, with its `onAnnotationAdd`, `onAnnotationUpdate`, `onAnnotationDelete`, and clear callbacks mirrored to the shared store. This retains Agentation's source/DOM capture while avoiding duplicated selection logic.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`SharedAnnotationOverlay.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/annotations/components/SharedAnnotationOverlay.svelte) | SharedAnnotationOverlay.svelte |
| [`annotations.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/annotations/state/annotations.svelte.ts) | annotations.svelte.ts |
| [`annotations.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/annotations/styles/annotations.sass) | annotations.sass |
| [`types.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/annotations/types.ts) | types.ts |

<!-- filetable:end -->
