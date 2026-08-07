---
id: ADR-044
title: Project-Local Shared Annotations
status: accepted
date: 2026-07-19
tags: [annotations, sqlite, collaboration, agentation, ipc]
relates_to: [ADR-004, ADR-018, ADR-027, ADR-028]
summary: Persist source-aware visual feedback in the workspace and bridge development-browser collaboration through a local relay.
---

# ADR-044: Project-Local Shared Annotations

## Context

Svelte Agentation can capture precise visual feedback, but its own storage is local to one browser context. That prevented a developer and an agent operating separate localhost browsers from seeing the same annotations.

The feedback must remain project-scoped and local-first. Native Tauri events cannot be consumed by ordinary `pnpm dev` browser tabs, while a cloud database would add credentials and an external dependency to a workflow that is normally one machine and one workspace.

## Decision

Store annotations in `<project>/.fractal/annotations.db`. The native desktop app accesses that SQLite file through typed `annotations_*` commands in the single IPC gateway. During development, Vite exposes an internal localhost relay backed by the same SQLite schema; the browser mock uses it and falls back to process memory only when unavailable.

Agentation remains the capture surface. Its lifecycle callbacks persist snapshots, and a small first-party overlay renders shared pins and comments. The initial transport polls once per second rather than adding a persistent socket dependency.

## Consequences

Visual feedback survives reloads and is available to independent local browser contexts, including an agent browser. It retains Agentation's selector, source, viewport, and target metadata instead of reducing feedback to coordinates.

The development relay is intentionally local and is not exposed by a production server. Future cross-machine collaboration needs an authenticated relay or provider; it can reuse this record contract. Polling is adequate for the first local workflow but can later be upgraded to events without changing storage or the frontend callbacks.
