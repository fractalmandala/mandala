---
id: kernel
title: Kernel Area
type: area
tags: [kernel, state, settings]
relates_to: [ADR-004, ADR-009, ADR-015, ADR-017, ADR-026]
summary: Covers state/ide.svelte.ts and settings/browser facades.
updated: 2026-07-15
---

## Purpose & boundaries

The Kernel area governs global app state, workspace directories, active templates, configurations, and core setting values.

## State & persistence

- **Global IDE State**: Core fields in `state/ide.svelte.ts`.
- **Global Settings**: Core settings model in `state/settings.svelte.ts`.
- **Persistence**: Encrypted native keychain storage for credentials and LocalStorage keys for preferences.

## Extension points

- **Registry contributions**: Mapped settings controls inside `SettingsDialog.svelte`.

## Cross-area edges

- **State Hub**: Coordinates updates across all modular states (designer, notes, ai, etc.).

## Gotchas

- **Browser Mock Parity**: Browser compatibility mock facades must be kept updated to prevent breaks during `pnpm dev` outside Tauri.
